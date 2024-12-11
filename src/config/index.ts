import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT;
export const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
export const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
export const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI;
export const HUBSPOT_DEVELOPER_API_KEY = process.env.HUBSPOT_DEVELOPER_API_KEY;
export const HUBSPOT_APP_ID = process.env.HUBSPOT_APP_ID;
export const API_BASE_URL = process.env.API_BASE_URL;
