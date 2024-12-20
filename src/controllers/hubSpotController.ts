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
} from '../utils/hubSpotUtils';
import { disassociateTwobjects } from '../utils/hubSpotUtils';

const prisma = new PrismaClient();

/**
 * Handles the OAuth callback for HubSpot integration.
 * Exchanges the authorization code for access and refresh tokens, then saves the tokens in the database.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} - Sends a response to the client with success or error message.
 */
export const handleOAuthCallback = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

    const newUser = await prisma.user.create({
      data: {
        user: userData.user,
        userId: userData.user_id.toString(),
        appId: userData.app_id.toString(),
        hubId: userData.hub_id.toString(),
        accessToken: accessToken,
        refreshToken: refreshToken,
        expireTime: expireTime,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Authorization successful',
      data: newUser,
    });
  } catch (error: any) {
    logger.error(`Error exchanging token: ${error.message}`);
    res.status(500).send('Error during OAuth process');
  }
};

/**
 * Fetches all HubSpot objects, including default and custom objects.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} - Sends a response with the list of objects.
 */
export const fetchObejcts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { origin } = req.body;
    const hubId = origin.portalId;
    const response = await fetchAllObjects(hubId);

    res.status(200).json({
      success: true,
      options: response,
    });
  } catch (error: any) {
    logger.error(`Error while fetching Objects: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

/**
 * Fetches properties of a specific HubSpot object type.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} - Sends a response with the list of properties.
 */
export const fetchProperties = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { origin } = req.body;
    const hubId = origin.portalId;
    const objectType = req.body?.inputFields?.objectInput?.value;
    const response = await fetchObjectProperties(hubId, objectType);

    const allObjectProperties: any = [];
    response.map((prop: any) => {
      allObjectProperties.push({ value: prop.label, label: prop.label });
    });

    res.status(200).json({
      options: allObjectProperties,
    });
  } catch (error: any) {
    logger.error(`Error while fetching properties: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

/**
 * Fetches association labels between two specified HubSpot object types.
 * @param {Request} req - Express request object containing object type IDs in the body.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} - Sends a response with the association labels.
 */
export const fethcAssociationLabels = async (
  req: Request,
  res: Response,
): Promise<void> => {
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

    res.status(200).json({
      success: true,
      options: associationLabels,
    });
  } catch (error: any) {
    logger.error(`Error while fetching association labels: ${error.stack}`);
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
 * @returns {Promise<void>} - Sends a response indicating success or failure of the operation.
 */
export const disassociateObjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { origin, object, inputFields } = req.body;
    const hubId = origin.portalId;

    const fromObjectType = object?.objectType;
    const toObjectType = inputFields?.objectInput;
    const associationTypeId = inputFields?.associationLabelInput;
    const withProperty = inputFields?.optionsInput;
    const withPropertyValue = inputFields?.optionsValueInput;

    if (!fromObjectType || !toObjectType || !associationTypeId) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields for disassociation.',
      });
    }

    const response = await disassociateTwobjects(
      hubId,
      fromObjectType,
      toObjectType,
      associationTypeId,
    );

    if (response) {
      res.status(200).send({
        success: true,
        message: 'Objects Disassociated Successfully',
      });
    } else {
      res.status(400).send({
        success: false,
        message: 'Error While Disassociating Objects',
      });
    }
  } catch (error: any) {
    logger.error(`Error while disassociating objects: ${error.stack}`);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};
