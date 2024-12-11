import { Router } from 'express';
import controllers from '../controllers';

const router = Router();

router.get('/oauth/callback', controllers.handleOAuthCallback);
router.get('/getObjects', controllers.fetchObejcts);
router.get('/getProps', controllers.fetchProperties);

export default router;
