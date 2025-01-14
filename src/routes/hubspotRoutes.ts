import { Router } from 'express';
import controllers from '../controllers';

const router = Router();

router.get('/oauth/callback', controllers.handleOAuthCallback);
router.post('/fetchObjects', controllers.fetchObejcts);
router.post('/fetchProps', controllers.fetchProperties);
router.post('/fetchOptions', controllers.fetchOptions);
router.post('/fethcAssociationLabels', controllers.fethcAssociationLabels);
router.post('/disassociate', controllers.disassociateObjects);

export default router;
