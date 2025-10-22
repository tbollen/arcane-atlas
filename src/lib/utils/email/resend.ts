import { Resend } from 'resend';
// dotenv for environment variables
import 'dotenv/config';

export const resend = new Resend(process.env.RESEND_API_KEY);
