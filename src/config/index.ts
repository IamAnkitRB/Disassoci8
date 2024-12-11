import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT;
export const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
export const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
export const HUBSPOT_REDIRECT_URI = process.env.HUBSPOT_REDIRECT_URI;
