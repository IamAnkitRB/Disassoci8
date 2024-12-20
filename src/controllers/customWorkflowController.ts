import axios from 'axios';
import { Request, Response } from 'express';
import {
  HUBSPOT_DEVELOPER_API_KEY,
  HUBSPOT_APP_ID,
  API_BASE_URL,
} from '../config';
import logger from '../utils/logger';

/**
 * Creates a custom workflow action in HubSpot for disassociating objects.
 * The workflow action allows users to define input fields and behaviors for the disassociation process.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} - Sends a response with the creation result or an error message.
 */
export const createCustomWorkflowAction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const response = await axios.post(
      `https://api.hubapi.com/automation/v4/actions/${HUBSPOT_APP_ID}`,
      {
        actionUrl: `${API_BASE_URL}/hubspot/disassociate`,
        inputFields: [
          {
            typeDefinition: {
              name: 'objectInput',
              type: 'enumeration',
              fieldType: 'select',
              optionsUrl: `${API_BASE_URL}/hubspot/fetchObjects`,
            },
            supportedValueTypes: ['STATIC_VALUE'],
            isRequired: true,
          },
          {
            typeDefinition: {
              name: 'associationLabelInput',
              type: 'enumeration',
              fieldType: 'checkbox',
              optionsUrl: `${API_BASE_URL}/hubspot/fethcAssociationLabels`,
            },
            supportedValueTypes: ['STATIC_VALUE'],
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
            isRequired: true,
          },
          {
            typeDefinition: {
              name: 'optionsValueInput',
              type: 'string',
              fieldType: 'text',
            },
            supportedValueTypes: ['STATIC_VALUE'],
            isRequired: false,
          },
        ],
        labels: {
          en: {
            actionName: 'Disassociate Objects',
            actionDescription:
              'This action will disassociate two objects. The source object is defined by the "Workflow Type"',
            actionCardContent: 'Disassociate objects from one another',
            inputFieldLabels: {
              objectInput: 'Object To Disassociate',
              associationLabelInput: 'Association Label Input',
              optionsInput: 'Only objects with this property',
              optionsValueInput: 'With the value of',
            },
            inputFieldDescriptions: {
              objectInput:
                'Enter the object from which you want to disassociate',
              associationLabelInput: 'Select association labels',
              optionsInput:
                'Disassociate only those objects which contains this property',
              optionsValueInput: 'Value of property in the selected object',
            },
          },
        },
        published: 'true',
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

/**
 * Updates an existing custom workflow action in HubSpot.
 * Modifies the action's input fields, labels, and other properties.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} - Sends a response with the update result or an error message.
 */
export const updateCustomWorkflowAction = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const DEFINITION_ID = req.body.definitionId;
    const response = await axios.patch(
      `https://api.hubapi.com/automation/v4/actions/${HUBSPOT_APP_ID}/${DEFINITION_ID}`,
      {
        actionUrl: `${API_BASE_URL}/hubspot/disassociate`,
        inputFields: [
          {
            typeDefinition: {
              name: 'objectInput',
              type: 'enumeration',
              fieldType: 'select',
              optionsUrl: `${API_BASE_URL}/hubspot/fetchObjects`,
            },
            supportedValueTypes: ['STATIC_VALUE'],
            isRequired: true,
          },
          {
            typeDefinition: {
              name: 'associationLabelInput',
              type: 'enumeration',
              fieldType: 'checkbox',
              optionsUrl: `${API_BASE_URL}/hubspot/fethcAssociationLabels`,
            },
            supportedValueTypes: ['STATIC_VALUE'],
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
            isRequired: true,
          },
          {
            typeDefinition: {
              name: 'optionsValueInput',
              type: 'string',
              fieldType: 'text',
            },
            supportedValueTypes: ['STATIC_VALUE'],
            isRequired: false,
          },
        ],
        labels: {
          en: {
            actionName: 'Disassociate Objects',
            actionDescription:
              'This action will disassociate two objects. The source object is defined by the "Workflow Type"',
            actionCardContent: 'Disassociate objects from one another',
            inputFieldLabels: {
              objectInput: 'Object To Disassociate',
              associationLabelInput: 'Association Label Input',
              optionsInput: 'Only objects with this property',
              optionsValueInput: 'With the value of',
            },
            inputFieldDescriptions: {
              objectInput:
                'Enter the object from which you want to disassociate',
              associationLabelInput: 'Select association labels',
              optionsInput:
                'Disassociate only those objects which contains this property',
              optionsValueInput: 'Value of property in the selected object',
            },
          },
        },
        published: 'true',
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
