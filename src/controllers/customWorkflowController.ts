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
 * @returns {Promise<any>} - Sends a response with the creation result or an error message.
 */
export const createCustomWorkflowAction = async (
  req: Request,
  res: Response,
): Promise<any> => {
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
              name: 'selectionInput',
              type: 'enumeration',
              fieldType: 'select',
              options: [
                {
                  value: 'associationLabel',
                  label: 'Association Label',
                },
                {
                  value: 'property',
                  label: 'Property',
                },
              ],
            },
            supportedValueTypes: ['STATIC_VALUE'],
            isRequired: true,
          },
          {
            typeDefinition: {
              name: 'optionsInput',
              type: 'enumeration',
              fieldType: 'select',
              optionsUrl: `${API_BASE_URL}/hubspot/fetchOptions`,
            },
            supportedValueTypes: ['STATIC_VALUE'],
            isRequired: true,
          },
          {
            typeDefinition: {
              name: 'optionValue',
              type: 'string',
              fieldType: 'text',
            },
            supportedValueTypes: ['STATIC_VALUE'],
            isRequired: false,
          },
        ],
        labels: {
          en: {
            actionName: 'Disassociate Objects Test',
            actionDescription:
              'This action will disassociate two objects. The source object is defined by the "Workflow Type"',
            actionCardContent: 'Disassociate objects from one another',
            inputFieldLabels: {
              objectInput: 'Object To Disassociate',
              selectionInput: 'Disassociate on the basis of',
              optionsInput: 'Select property/association label',
              optionValue: 'Enter the property value',
            },
            inputFieldDescriptions: {
              objectInput:
                'Enter the object from which you want to disassociate',
              selectionInput:
                'The basis of disassociation i.e. Properties or Association Label',
              optionsInput:
                'The property or association label via which you want to disassociate the objects',
              optionValue:
                'The object will be disassociated if the property matches this value',
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

    return res.status(200).json(response.data);
  } catch (error: any) {
    logger.error(
      `Error while creating custom workflow action:
      ${error.response?.data || error.message}`,
    );
    return res.status(500).json({
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
 * @returns {Promise<any>} - Sends a response with the update result or an error message.
 */
export const updateCustomWorkflowAction = async (
  req: Request,
  res: Response,
): Promise<any> => {
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
              name: 'selectionInput',
              type: 'enumeration',
              fieldType: 'select',
              options: [
                {
                  value: 'associationLabel',
                  label: 'Association Label',
                },
                {
                  value: 'property',
                  label: 'Property',
                },
              ],
            },
            supportedValueTypes: ['STATIC_VALUE'],
            isRequired: true,
          },
          {
            typeDefinition: {
              name: 'optionsInput',
              type: 'enumeration',
              fieldType: 'select',
              optionsUrl: `${API_BASE_URL}/hubspot/fetchOptions`,
            },
            supportedValueTypes: ['STATIC_VALUE'],
            isRequired: true,
          },
          {
            typeDefinition: {
              name: 'optionValue',
              type: 'string',
              fieldType: 'text',
            },
            supportedValueTypes: ['STATIC_VALUE'],
            isRequired: false,
          },
        ],
        labels: {
          en: {
            actionName: 'Remove Association',
            actionDescription:
              'This action will remove the association between two objects. The source object is defined by the "Workflow Type".',
            actionCardContent: 'Remove the association between objects',
            inputFieldLabels: {
              objectInput: 'Object to Update Association For',
              selectionInput: 'Remove Association Based On',
              optionsInput: 'Select Property/Association Label',
              optionValue: 'Specify the Property Value',
            },
            inputFieldDescriptions: {
              objectInput:
                'Specify the object for which you want to remove the association.',
              selectionInput:
                'Choose the criteria for removing the association, such as Properties or Association Labels.',
              optionsInput:
                'Select the property or label that defines the association to remove.',
              optionValue:
                'The association will be removed if the selected property matches the specified value (applicable only when property is chosen as the criteria).',
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

    return res.status(200).json(response.data);
  } catch (error: any) {
    logger.error(
      `Error while updating custom workflow action:
      ${error.response?.data || error.message}`,
    );
    return res.status(500).json({
      error: 'Failed to process the request.',
      details: error.response?.data || error.message,
    });
  }
};

export const createCustomWorkflowActionV2 = async (
  req: Request,
  res: Response,
): Promise<any> => {
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
              name: 'selectionInput',
              type: 'enumeration',
              fieldType: 'select',
              options: [
                {
                  value: 'associationLabel',
                  label: 'Association Label',
                },
                {
                  value: 'property',
                  label: 'Property',
                },
              ],
            },
            supportedValueTypes: ['STATIC_VALUE'],
            isRequired: true,
          },
          {
            typeDefinition: {
              name: 'optionsInput',
              type: 'enumeration',
              fieldType: 'checkbox',
              optionsUrl: `${API_BASE_URL}/hubspot/fetchOptions`,
            },
            supportedValueTypes: ['STATIC_VALUE'],
            isRequired: true,
          },
        ],
        labels: {
          en: {
            actionName: 'Disassociate Objects 2.0',
            actionDescription:
              'This action will disassociate two objects. The source object is defined by the "Workflow Type"',
            actionCardContent: 'Disassociate objects from one another',
            inputFieldLabels: {
              objectInput: 'Object To Disassociate',
              selectionInput: 'Disassociate on the basis of',
              optionsInput: 'Select property/association label',
            },
            inputFieldDescriptions: {
              objectInput:
                'Enter the object from which you want to disassociate',
              selectionInput:
                'The basis of disassociation i.e. Properties or Association Label',
              optionsInput:
                'The property or association label via which you want to disassociate the objects',
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

    return res.status(200).json(response.data);
  } catch (error: any) {
    logger.error(
      `Error while creating custom workflow action:
      ${error.response?.data || error.message}`,
    );
    return res.status(500).json({
      error: 'Failed to process the request.',
      details: error.response?.data || error.message,
    });
  }
};
