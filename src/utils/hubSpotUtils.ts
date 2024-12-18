import axios from 'axios';
import { ensureValidAccessToken } from '../services/refreshTokenService';
import logger from './logger';

let userId = '9';

export const fetchAllObjects = async () => {
  try {
    const accessToken = await ensureValidAccessToken(userId);
    const customObjectsResponse: any = await axios.get(
      'https://api.hubapi.com/crm/v3/schemas',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const customObjects = customObjectsResponse.data.results;

    const objectsLabel = [
      { value: 'contacts', label: 'contacts' },
      { value: 'companies', label: 'companies' },
      { value: 'deals', label: 'deals' },
      { value: 'tickets', label: 'tickets' },
    ];

    customObjects.map((obj: any) => {
      objectsLabel.push({
        value: obj.objectTypeId,
        label: obj.labels.singular,
      });
    });

    return objectsLabel;
  } catch (error: any) {
    console.error(
      'Error fetching objects:',
      JSON.stringify(error.response?.data) || error.message,
    );
    throw error;
  }
};

export const fetchObjectProperties = async (objectType: string) => {
  try {
    const accessToken = await ensureValidAccessToken(userId);
    const response: any = await axios.get(
      `https://api.hubapi.com/crm/v3/properties/${objectType}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.results;
  } catch (error: any) {
    console.error(
      `Error fetching properties for ${objectType}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const fetchAssociationLabels = async (
  fromObjectType: string,
  toObjectType: string,
) => {
  try {
    console.log('to object id::', toObjectType);
    if (!toObjectType) {
      return [];
    }

    const accessToken = await ensureValidAccessToken(userId);
    const response: any = await axios.get(
      `https://api.hubapi.com/crm/v4/associations/${fromObjectType}/${toObjectType}/labels`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.results;
  } catch (error: any) {
    logger.error(`Error while fetching association labels: ${error.stack}`);
    throw error;
  }
};

/**
 * Disassociate two objects in HubSpot.
 * @param {string} fromObjectType - The type of the first object (e.g., "contacts").
 * @param {string} toObjectType - The type of the second object (e.g., "companies").
 * @param {string} associationTypeId - The association type ID
 * @returns {Promise<boolean>} - Returns true if disassociation is successful, otherwise throws an error.
 */
export const disassociateTwobjects = async (
  fromObjectType: string,
  toObjectType: string,
  associationTypeId: string,
): Promise<boolean> => {
  try {
    logger.info(
      `Disassociating ${fromObjectType} from ${toObjectType} with association type ${associationTypeId}`,
    );

    if (!fromObjectType || !toObjectType || !associationTypeId) {
      throw new Error(
        'fromObjectType, toObjectType and associationTypeId all are required.',
      );
    }

    const accessToken = await ensureValidAccessToken(userId);

    const apiUrl = `https://api.hubapi.com/crm/v4/associations/${fromObjectType}/${toObjectType}/labels/${associationTypeId}`;

    try {
      logger.info(`Making request to disassociate objects`);

      await axios.delete(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      logger.error(
        `Error while making API request to disassociate objects: ${error.stack}`,
      );
      throw error;
    }

    logger.info(
      `Successfully disassociated ${fromObjectType} from ${toObjectType} with association type ${associationTypeId}`,
    );
    return true;
  } catch (error: any) {
    logger.error(`Error while disassociating objects: ${error.stack}`);
    throw error;
  }
};
