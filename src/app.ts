import express from 'express';
import routes from './routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/hubspot', routes.hubSpotRoutes);
app.use('/hubspot/workflow', routes.customWorkflowRoutes);

app.get('/health', (req, res) => {
  res.status(200).send(`Server is up and running`);
});

export default app;
