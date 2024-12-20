import axios from 'axios';
import { ensureValidAccessToken } from '../services/refreshTokenService';
import logger from './logger';

/**
 * Fetch all custom and default objects from HubSpot, and format them with value and label properties.
 * @param {string} hubId - The hubId of the user making request
 * @returns {Promise<Array<{value: string, label: string}>>} - Array of objects with `value` and `label` fields for use in dropdowns or selection lists.
 */
export const fetchAllObjects = async (
  hubId: string,
): Promise<Array<{ value: string; label: string }>> => {
  try {
    const accessToken = await ensureValidAccessToken(hubId);
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
 * @param {string} hubId - The hubId of the user making request
 * @param {string} objectType - The type of the object (e.g., "contacts", "companies").
 * @returns {Promise<any>} - Array of properties for the specified object type.
 */
export const fetchObjectProperties = async (
  hubId: string,
  objectType: string,
): Promise<any> => {
  try {
    if (objectType) {
      const accessToken = await ensureValidAccessToken(hubId);
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
 * @param {string} hubId - The hubId of the user making request
 * @param {string} fromObjectType - The type of the first object (e.g., "contacts").
 * @param {string} toObjectType - The type of the second object (e.g., "companies").
 * @returns {Promise<any>} - Array of association labels for the two specified object types.
 */
export const fetchAssociationLabels = async (
  hubId: string,
  fromObjectType: string,
  toObjectType: string,
): Promise<any> => {
  try {
    if (!toObjectType) {
      return [];
    }

    const accessToken = await ensureValidAccessToken(hubId);
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
 * @param {string} hubId - The hubId of the user making request
 * @param {string} fromObjectType - The type of the first object (e.g., "contacts").
 * @param {string} fromObjectId - The object id of first object
 * @param {string} toObjectType - The type of the second object (e.g., "companies").
 * @param {[string]} toObjectIdArray - Array of all the associated record IDs of the second object
 * @param {string} associationTypeId - Array of the association type ID
 * @returns {Promise<boolean>} - Returns true if disassociation is successful, otherwise throws an error.
 */
export const disassociateTwobjects = async (
  hubId: string,
  fromObjectType: string,
  fromObjectId: string,
  toObjectType: string,
  toObjectIdArray: string,
  associationTypeId: [string],
): Promise<boolean> => {
  try {
    const accessToken = await ensureValidAccessToken(hubId);

    if (
      !fromObjectType ||
      !fromObjectId ||
      !toObjectType ||
      !associationTypeId ||
      !associationTypeId.length
    ) {
      throw new Error(
        'fromObjectType, toObjectType and associationTypeId all are required.',
      );
    }

    if (!toObjectIdArray || !toObjectIdArray.length) {
      logger.info(`No Object found to disassociate`);
      return true;
    }

    for (let associationType of associationTypeId) {
      for (let toObjectId of toObjectIdArray) {
        logger.info(
          `Disassociating ${fromObjectId} of ${fromObjectType} from ${toObjectId} of ${toObjectType} with association type ${associationType}`,
        );
        const apiUrl = `https://api.hubapi.com/crm/v4/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}/${toObjectId}`;

        try {
          logger.info(`Making request to disassociate objects`);

          const response = await axios.delete(apiUrl, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          logger.info(
            `Response status from disassociate api: ${response.status}`,
          );
        } catch (error: any) {
          logger.error(
            `Error while making API request to disassociate objects: ${error.stack}`,
          );
        }

        logger.info(
          `Successfully disassociated ${fromObjectType} from ${toObjectType} with association type ${associationType}`,
        );
      }
    }

    return true;
  } catch (error: any) {
    logger.error(`Error while disassociating objects: ${error.stack}`);
    throw error;
  }
};

/**
 * List all the associated records from source objects.
 * @param {string} hubId - The hubId of the user making request
 * @param {string} objectType - The type of the first object (e.g., "contacts").
 * @param {string} objectId - The object id of first object
 * @param {string} toObjectType - The type of the second object (e.g., "companies").
 * @returns {Promise<void>} - Returns list of all the associated records from source objects.
 */
export const listAllAssociatedObjects = async (
  hubId: string,
  objectType: string,
  objectId: string,
  toObjectType: string,
): Promise<void> => {
  const accessToken = await ensureValidAccessToken(hubId);
  const url = `https://api.hubapi.com/crm/v4/objects/${objectType}/${objectId}/associations/${toObjectType}?limit=500`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch associated objects. Status: ${response.status}. Message: ${errorText}`,
      );
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    logger.error(`Error while listing all associated objects: ${error.stack}`);
    throw error;
  }
};
