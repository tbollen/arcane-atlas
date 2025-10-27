import * as z from 'zod';
import { zod4 } from 'sveltekit-superforms/adapters';

export const changePasswordSchema = z.object({
	email: z.email(),
	'current-password': z.string().min(8),
	'new-password': z.string().min(8),
	'confirm-password': z.string().min(8)
});

export type ChangePasswordSchema = typeof changePasswordSchema;
