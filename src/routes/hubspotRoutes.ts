import { Router } from 'express';
import controllers from '../controllers';

const router = Router();

router.get('/oauth/callback', controllers.handleOAuthCallback);

export default router;
