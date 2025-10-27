import * as z from 'zod';

export const zodPassword = z.string().min(8).max(100).describe('Password');
