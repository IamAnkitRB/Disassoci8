import express from 'express';
import routes from './routes';

const app = express();

app.use('/hubspot', routes.hubSpotRoutes);
app.use('/hubspot/workflow', routes.customWorkflowRoutes);

export default app;
