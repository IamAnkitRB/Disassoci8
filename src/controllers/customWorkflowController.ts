import axios from 'axios';
import { Request, Response } from 'express';
import {
  HUBSPOT_DEVELOPER_API_KEY,
  HUBSPOT_APP_ID,
  API_BASE_URL,
} from '../config';
import logger from '../utils/logger';

export const createCustomWorkflowAction = async (
  req: Request,
  res: Response,
) => {
  try {
    const response = await axios.post(
      `https://api.hubapi.com/automation/v4/actions/${HUBSPOT_APP_ID}`,
      {
        actionUrl: `${API_BASE_URL}/hubspot/disassociate`,
        inputFields: [
          {
            typeDefinition: {
              name: 'objectInput',
              type: 'string',
              fieldType: 'text',
            },
            supportedValueTypes: ['OBJECT_PROPERTY'],
            isRequired: true,
          },
          {
            typeDefinition: {
              name: 'optionsInput',
              type: 'enumeration',
              fieldType: 'select',
              optionsUrl: `${API_BASE_URL}/hubspot/fetchProps`,
            },
            supportedValueTypes: ['STATIC_VALUE'],
          },
        ],
        labels: {
          en: {
            actionName: 'Disassociate Company and Contact',
            actionDescription:
              'This action will disassociate a contact from a company.',
            actionCardContent:
              'Disassociate contact {{contactId}} from company {{companyId}}',
            inputFieldLabels: {
              objectInput: 'Object Input',
              optionsInput: 'Options Input',
            },
            inputFieldDescriptions: {
              objectInput: 'Enter the object input value.',
              optionsInput: 'Choose an option for the input.',
            },
          },
        },
        published: 'true',
        objectTypes: ['CONTACT', 'COMPANY'],
      },
      {
        headers: {
          'content-type': 'application/json',
        },
        params: {
          hapikey: HUBSPOT_DEVELOPER_API_KEY,
        },
      },
    );

    res.status(200).json(response.data);
  } catch (error: any) {
    logger.error(
      `Error while creating custom workflow action:
      ${error.response?.data || error.message}`,
    );
    res.status(500).json({
      error: 'Failed to process the request.',
      details: error.response?.data || error.message,
    });
  }
};

export const updateCustomWorkflowAction = async (
  req: Request,
  res: Response,
) => {
  try {
    const DEFINITION_ID = '177121947';
    const response = await axios.post(
      `https://api.hubapi.com/automation/v4/actions/${HUBSPOT_APP_ID}/${DEFINITION_ID}`,
      {
        actionUrl: `${API_BASE_URL}/hubspot/disassociate`,
        inputFields: [
          {
            typeDefinition: {
              name: 'objectInput',
              type: 'string',
              fieldType: 'text',
            },
            supportedValueTypes: ['OBJECT_PROPERTY'],
            isRequired: true,
          },
          {
            typeDefinition: {
              name: 'optionsInput',
              type: 'enumeration',
              fieldType: 'select',
              optionsUrl: `${API_BASE_URL}/hubspot/fetchProps`,
            },
            supportedValueTypes: ['STATIC_VALUE'],
          },
        ],
        labels: {
          en: {
            actionName: 'Disassociate Company and Contact',
            actionDescription:
              'This action will disassociate a contact from a company.',
            actionCardContent:
              'Disassociate contact {{contactId}} from company {{companyId}}',
            inputFieldLabels: {
              objectInput: 'Object Input',
              optionsInput: 'Options Input',
            },
            inputFieldDescriptions: {
              objectInput: 'Enter the object input value.',
              optionsInput: 'Choose an option for the input.',
            },
          },
        },
        published: 'true',
        objectTypes: ['CONTACT', 'COMPANY'],
      },
      {
        headers: {
          'content-type': 'application/json',
        },
        params: {
          hapikey: HUBSPOT_DEVELOPER_API_KEY,
        },
      },
    );

    res.status(200).json(response.data);
  } catch (error: any) {
    logger.error(
      `Error while updating custom workflow action:
      ${error.response?.data || error.message}`,
    );
    res.status(500).json({
      error: 'Failed to process the request.',
      details: error.response?.data || error.message,
    });
  }
};
