import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import logger from '../utils/logger';
import { HUBSPOT_CLIENT_ID, HUBSPOT_CLIENT_SECRET } from '../config';

const prisma = new PrismaClient();

/*
 * const accessToken = await ensureValidAccessToken(userId);
 */

export const ensureValidAccessToken = async (
  userId: string,
): Promise<string> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const { accessToken, refreshToken, expireTime } = user;

    // Check if token is expired
    const currentTime = new Date();
    if (expireTime <= currentTime) {
      logger.info(
        `Access token expired for user ${userId}. Refreshing token...`,
      );

      // Refresh the token
      const response = await axios.post(
        'https://api.hubapi.com/oauth/v1/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: HUBSPOT_CLIENT_ID || '',
          client_secret: HUBSPOT_CLIENT_SECRET || '',
          refresh_token: refreshToken,
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const data: any = response.data;
      const newAccessToken = data.access_token;
      const newRefreshToken = data.refresh_token;
      const expiresIn = data.expires_in;

      // Calculate new expiration time
      const newExpireTime = new Date();
      newExpireTime.setSeconds(newExpireTime.getSeconds() + expiresIn);

      // Update the database
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expireTime: newExpireTime,
        },
      });

      logger.info(`Access token refreshed for user ${userId}`);
      return newAccessToken;
    }

    logger.info(`Access token is valid for user ${userId}`);
    return accessToken;
  } catch (error: any) {
    logger.error(
      `Error ensuring valid access token for user ${userId}: ${error.response?.data} || ${error.message}`,
    );
    throw error;
  }
};
