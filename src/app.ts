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

app.get('/boundary-install-remove-association', (req, res) => {
  return res.redirect(
    `https://app.hubspot.com/oauth/authorize?client_id=eb2da63c-63b4-4d48-9959-5759609297c9&redirect_uri=https://hsdissociate.boundaryhq.com/hubspot/oauth/callback&scope=crm.schemas.deals.read%20oauth%20tickets%20crm.objects.contacts.write%20crm.schemas.custom.read%20crm.objects.custom.read%20crm.objects.custom.write%20crm.objects.companies.write%20crm.objects.companies.read%20crm.objects.deals.read%20crm.objects.deals.write%20crm.objects.contacts.read`,
  );
});

export default app;
