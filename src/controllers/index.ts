import {
  handleOAuthCallback,
  fetchObejcts,
  fetchProperties,
  fetchOptions,
  fethcAssociationLabels,
  disassociateObjects,
  disassociateObjectsViaPropV2,
} from './hubSpotController';
import {
  createCustomWorkflowAction,
  updateCustomWorkflowAction,
  createCustomWorkflowActionV2,
} from './customWorkflowController';

export default {
  handleOAuthCallback,
  fetchObejcts,
  fetchProperties,
  fetchOptions,
  fethcAssociationLabels,
  disassociateObjects,
  disassociateObjectsViaPropV2,
  createCustomWorkflowAction,
  createCustomWorkflowActionV2,
  updateCustomWorkflowAction,
};
