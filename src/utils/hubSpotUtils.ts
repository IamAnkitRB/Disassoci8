import axios from 'axios';
import { ensureValidAccessToken } from '../services/refreshTokenService';
import logger from './logger';

let userId = '9';

/**
 * Fetch all custom and default objects from HubSpot, and format them with value and label properties.
 * @returns {Promise<Array<{value: string, label: string}>>} - Array of objects with `value` and `label` fields for use in dropdowns or selection lists.
 */
export const fetchAllObjects = async (): Promise<
  Array<{ value: string; label: string }>
> => {
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
    logger.error(
      'Error fetching objects:',
      JSON.stringify(error.response?.data) || error.message,
    );
    throw error;
  }
};

/**
 * Fetch all properties for a specified object type from HubSpot.
 * @param {string} objectType - The type of the object (e.g., "contacts", "companies").
 * @returns {Promise<any>} - Array of properties for the specified object type.
 */
export const fetchObjectProperties = async (
  objectType: string,
): Promise<any> => {
  try {
    if (objectType) {
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
    } else {
      return [];
    }
  } catch (error: any) {
    logger.error(
      `Error fetching properties for ${objectType}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Fetch association labels between two object types in HubSpot.
 * @param {string} fromObjectType - The type of the first object (e.g., "contacts").
 * @param {string} toObjectType - The type of the second object (e.g., "companies").
 * @returns {Promise<any>} - Array of association labels for the two specified object types.
 */
export const fetchAssociationLabels = async (
  fromObjectType: string,
  toObjectType: string,
): Promise<any> => {
  try {
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
  associationTypeId: [string],
): Promise<boolean> => {
  try {
    const accessToken = await ensureValidAccessToken(userId);

    if (
      !fromObjectType ||
      !toObjectType ||
      !associationTypeId ||
      !associationTypeId.length
    ) {
      throw new Error(
        'fromObjectType, toObjectType and associationTypeId all are required.',
      );
    }

    for (let associationType of associationTypeId) {
      logger.info(
        `Disassociating ${fromObjectType} from ${toObjectType} with association type ${associationType}`,
      );
      const apiUrl = `https://api.hubapi.com/crm/v4/associations/${fromObjectType}/${toObjectType}/labels/${associationType}`;

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
      }

      logger.info(
        `Successfully disassociated ${fromObjectType} from ${toObjectType} with association type ${associationType}`,
      );
    }

    return true;
  } catch (error: any) {
    logger.error(`Error while disassociating objects: ${error.stack}`);
    throw error;
  }
};
