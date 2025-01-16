import { Request, Response } from 'express';
import axios from 'axios';
import {
  HUBSPOT_CLIENT_ID,
  HUBSPOT_CLIENT_SECRET,
  HUBSPOT_REDIRECT_URI,
} from '../config';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import {
  fetchAllObjects,
  fetchObjectProperties,
  fetchAssociationLabels,
  listAllAssociatedObjects,
  fetchObjectDetailsWithId,
  disassociateTwoObjects,
} from '../utils/hubSpotUtils';

const prisma = new PrismaClient();

/**
 * Handles the OAuth callback for HubSpot integration.
 * Exchanges the authorization code for access and refresh tokens, then saves the tokens in the database.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<any>} - Sends a response to the client with success or error message.
 */
export const handleOAuthCallback = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const { code } = req.query;

  if (!code) {
    res.status(400).send('Missing authorization code or user ID');
    return;
  }

  try {
    const tokenResponse: any = await axios.post(
      'https://api.hubapi.com/oauth/v1/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: HUBSPOT_CLIENT_ID || '',
        client_secret: HUBSPOT_CLIENT_SECRET || '',
        redirect_uri: HUBSPOT_REDIRECT_URI || '',
        code: code as string,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;
    const expiresIn = tokenResponse.data.expires_in;

    const tokenMetaDataResponse: any = await axios.get(
      `https://api.hubapi.com/oauth/v1/access-tokens/${accessToken}`,
    );

    const userData = tokenMetaDataResponse.data;

    const expireTime = new Date();
    expireTime.setSeconds(expireTime.getSeconds() + expiresIn);

    const newUser = await prisma.user.upsert({
      where: {
        hubId: userData?.hub_id.toString(),
      },
      update: {
        user: userData.user,
        userId: userData.user_id.toString(),
        appId: userData.app_id.toString(),
        accessToken: accessToken,
        refreshToken: refreshToken,
        expireTime: expireTime,
        updatedAt: new Date(),
      },
      create: {
        user: userData.user,
        userId: userData.user_id.toString(),
        appId: userData.app_id.toString(),
        hubId: userData.hub_id.toString(),
        accessToken: accessToken,
        refreshToken: refreshToken,
        expireTime: expireTime,
      },
    });

    return res.redirect(
      `https://app.hubspot.com/integrations-settings/${newUser.hubId}/installed`,
    );
  } catch (error: any) {
    logger.error(`Error exchanging token: ${error.message}`);
    return res.status(500).send('Error during OAuth process');
  }
};

/**
 * Fetches all HubSpot objects, including default and custom objects.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<any>} - Sends a response with the list of objects.
 */
export const fetchObejcts = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { origin } = req.body;
    const hubId = origin.portalId;
    const response = await fetchAllObjects(hubId);

    return res.status(200).json({
      success: true,
      options: response,
    });
  } catch (error: any) {
    logger.error(`Error while fetching Objects: ${error.stack}`);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

/**
 * Fetches properties of a specific HubSpot object type.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<any>} - Sends a response with the list of properties.
 */
export const fetchProperties = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { origin } = req.body;
    const hubId = origin.portalId;
    const objectType = req.body?.inputFields?.objectInput?.value;
    const response = await fetchObjectProperties(hubId, objectType);

    const allObjectProperties: any = [];
    response.map((prop: any) => {
      allObjectProperties.push({ value: prop.name, label: prop.label });
    });

    return res.status(200).json({
      options: allObjectProperties,
    });
  } catch (error: any) {
    logger.error(`Error while fetching properties: ${error.stack}`);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

/**
 * Fetches association labels between two specified HubSpot object types.
 * @param {Request} req - Express request object containing object type IDs in the body.
 * @param {Response} res - Express response object.
 * @returns {Promise<any>} - Sends a response with the association labels.
 */
export const fethcAssociationLabels = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { origin } = req.body;
    const hubId = origin.portalId;
    const fromObjectType: string = req.body?.objectTypeId;
    const toObjectType: string =
      req.body?.fields?.objectInput?.fieldValue?.value;
    const response = await fetchAssociationLabels(
      hubId,
      fromObjectType,
      toObjectType,
    );

    const associationLabels = response.map((item: any) => {
      return {
        label: item?.label ? item.label : 'Unlabeled',
        value: item.typeId,
      };
    });

    return res.status(200).json({
      success: true,
      options: associationLabels,
    });
  } catch (error: any) {
    logger.error(`Error while fetching association labels: ${error.stack}`);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const fetchOptions = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { origin, inputFields } = req.body;
    const hubId = origin.portalId;
    const fromObjectType: string = req.body?.objectTypeId;
    const toObjectType = req.body?.inputFields?.objectInput?.value;

    const { selectionInput } = inputFields;

    let optionResponse: any = [];

    if (selectionInput?.value === 'property') {
      const response = await fetchObjectProperties(hubId, toObjectType);

      response.map((prop: any) => {
        optionResponse.push({ value: prop.name, label: prop.label });
      });
    } else if (selectionInput?.value === 'associationLabel') {
      const response = await fetchAssociationLabels(
        hubId,
        fromObjectType,
        toObjectType,
      );

      optionResponse = response.map((item: any) => {
        return {
          label: item?.label ? item.label : 'Unlabeled',
          value: item.typeId,
        };
      });
    }

    return res.status(200).json({
      success: true,
      options: optionResponse,
    });
  } catch (error: any) {
    logger.error(`Error while fetching options: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

/**
 * Disassociates two objects in HubSpot using their object types and association type IDs.
 * @param {Request} req - Express request object containing necessary details in the body.
 * @param {Response} res - Express response object.
 * @returns {Promise<any>} - Sends a response indicating success or failure of the operation.
 */
export const disassociateObjects = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    logger.info(`Request received: ${JSON.stringify(req.body)}`);

    const { origin, object, inputFields } = req.body;
    const hubId: string = origin.portalId;
    logger.info(`Hub ID: ${hubId}`);

    const fromObjectType: string = object?.objectType;
    const fromObjectId: string = object?.objectId;
    const toObjectType: string = inputFields?.objectInput;
    const selectionInputType: string = inputFields?.selectionInput;
    const optionsInput: string = inputFields?.optionsInput;
    const optionValue: string = inputFields?.optionValue;

    const toObjectIdList: any = await listAllAssociatedObjects(
      hubId,
      fromObjectType,
      fromObjectId,
      toObjectType,
    );
    logger.info(
      `Associated objects retrieved: ${JSON.stringify(toObjectIdList)}`,
    );

    if (toObjectIdList?.results.length) {
      let associationTypeId: any = new Set();

      toObjectIdList.results.forEach((item: any) => {
        item.associationTypes.forEach((assocType: any) => {
          if (assocType.typeId) {
            associationTypeId.add(assocType.typeId);
          }
        });
      });

      associationTypeId = Array.from(associationTypeId);

      logger.info(
        `Association labels collected: ${JSON.stringify(associationTypeId)}`,
      );

      let toObjectIdArray = [];
      if (selectionInputType === 'property') {
        logger.info(`Generating object ID array with property`);
        toObjectIdArray = toObjectIdList?.results?.map(
          (item: any) => item.toObjectId,
        );
      } else {
        logger.info(`Generating object ID array with association label`);
        toObjectIdArray = toObjectIdList?.results
          ?.filter((item: any) => {
            const hasMatchingTypeId = item.associationTypes?.some(
              (assocType: any) => {
                const isMatch = assocType.typeId === Number(optionsInput);
                logger.info(
                  `Checking assocType: ${JSON.stringify(assocType)} | optionsInput: ${optionsInput} | Match: ${isMatch}`,
                );
                return isMatch;
              },
            );

            logger.info(
              `Result for item.toObjectId ${item.toObjectId}: Match Found: ${hasMatchingTypeId}`,
            );
            return hasMatchingTypeId;
          })
          .map((item: any) => {
            return item.toObjectId;
          });
      }

      logger.info(`toObjectIdArray: ${JSON.stringify(toObjectIdArray)}`);
      for (const toObjectId of toObjectIdArray) {
        logger.info(`Processing toObjectId: ${toObjectId}`);

        if (selectionInputType === 'property') {
          const toObjectProps = await fetchObjectDetailsWithId(
            hubId,
            toObjectType,
            toObjectId,
            optionsInput,
          );
          logger.info(
            `Fetched properties for toObjectId ${toObjectId}: ${JSON.stringify(toObjectProps)}`,
          );

          const propertyValue = toObjectProps?.properties?.[optionsInput];
          logger.info(
            `Property value for ${optionsInput} of toObjectId ${toObjectId}: ${propertyValue}`,
          );
          // Only disassociate if the property value matches
          if (propertyValue === optionValue) {
            logger.info(
              `Disassociating object ID ${toObjectId} as it matches the condition.`,
            );

            await disassociateTwoObjects(
              hubId,
              fromObjectType,
              fromObjectId,
              toObjectType,
              toObjectId,
              associationTypeId,
            );
            logger.info(`Successfully disassociated object ID ${toObjectId}.`);
          } else {
            logger.info(
              `Skipping object ID ${toObjectId} as it does not match the condition.`,
            );
          }
        } else if (selectionInputType === 'associationLabel') {
          // Disassociating object based on the provided association label
          await disassociateTwoObjects(
            hubId,
            fromObjectType,
            fromObjectId,
            toObjectType,
            toObjectId,
            [optionsInput],
          );
        }
      }
    } else {
      logger.info(
        `Object with objectId : ${fromObjectId} is not associated to any object of type ${toObjectType}`,
      );
    }

    logger.info('All objects processed successfully.');
    return res.status(200).send({
      success: true,
      message: 'Objects Disassociated Successfully',
    });
  } catch (error: any) {
    logger.error(`Error while disassociating objects: ${error.stack}`);
    logger.error(`Error details: ${JSON.stringify(error, null, 2)}`);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
