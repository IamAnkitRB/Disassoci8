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

    const expireTime = new Date();
    expireTime.setSeconds(expireTime.getSeconds() + expiresIn);

    const newUser = await prisma.user.create({
      data: {
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
    logger.error(
      'Error exchanging token:',
      error.response?.data || error.message,
    );
    res.status(500).send('Error during OAuth process');
  }
};

export const fetchObejcts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const response = await fetchAllObjects();

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

export const fetchProperties = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const response = await fetchObjectProperties('2-22394367');

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

export const fethcAssociationLabels = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const fromObjectType: string = req.body?.objectTypeId;
    const toObjectType: string =
      req.body?.fields?.objectInput?.fieldValue?.value;
    const response = await fetchAssociationLabels(fromObjectType, toObjectType);

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

export const disassociateObjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { object, inputFields } = req.body;

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
