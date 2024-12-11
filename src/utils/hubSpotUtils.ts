import axios from 'axios';
import { ensureValidAccessToken } from '../services/refreshTokenService';

export const fetchAllObjects = async () => {
  try {
    const accessToken = await ensureValidAccessToken('2');
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

    const objectsLabel = ['contacts', 'companies', 'deals', 'tickets'];

    customObjects.map((obj: any) => {
      objectsLabel.push(obj.labels.singular);
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
    const accessToken = await ensureValidAccessToken('2');
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
