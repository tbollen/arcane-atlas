import { Resend } from 'resend';
// dotenv for environment variables

export const resend = new Resend(process.env.RESEND_API_KEY);
