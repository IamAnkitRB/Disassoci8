import { Request, Response } from 'express';
import axios from 'axios';
import {
  HUBSPOT_CLIENT_ID,
  HUBSPOT_CLIENT_SECRET,
  HUBSPOT_REDIRECT_URI,
} from '../config';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import { fetchAllObjects, fetchObjectProperties } from '../utils/hubSpotUtils';

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
      data: response,
    });
  } catch (error: any) {
    logger.error(``);
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
      allObjectProperties.push(prop.label);
    });

    res.status(200).json({
      success: true,
      data: allObjectProperties,
    });
  } catch (error: any) {
    logger.error(``);
  }
};
