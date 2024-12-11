import { Router } from 'express';
import controllers from '../controllers';

const router = Router();

router.post(
  '/createCustomWorkflowAction',
  controllers.createCustomWorkflowAction,
);
router.patch(
  '/updateCustomWorkflowAction',
  controllers.updateCustomWorkflowAction,
);

export default router;
