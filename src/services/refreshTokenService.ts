import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import logger from '../utils/logger';
import { HUBSPOT_CLIENT_ID, HUBSPOT_CLIENT_SECRET } from '../config';

const prisma = new PrismaClient();

/*
 * const accessToken = await ensureValidAccessToken(userId);
 */

export const ensureValidAccessToken = async (
  hubId: string,
): Promise<string> => {
  try {
    const user = await prisma.user.findUnique({
      where: { hubId: hubId.toString() },
    });

    if (!user) {
      throw new Error(`User with hubId ${hubId} not found`);
    }

    const { accessToken, refreshToken, expireTime } = user;

    // Check if token is expired
    const currentTime = new Date();
    if (expireTime <= currentTime) {
      logger.info(
        `Access token expired for user with hubId ${hubId}. Refreshing token...`,
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
        where: { hubId: hubId.toString() },
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expireTime: newExpireTime,
        },
      });

      logger.info(`Access token refreshed for user with hubId ${hubId}`);
      return newAccessToken;
    }

    logger.info(`Access token is valid for user with hubId ${hubId}`);
    return accessToken;
  } catch (error: any) {
    logger.error(
      `Error ensuring valid access token for user with hubId ${hubId}: ${error.message}`,
    );
    throw error;
  }
};
