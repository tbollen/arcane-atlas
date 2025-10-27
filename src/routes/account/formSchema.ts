import * as z from 'zod';
import { zod4 } from 'sveltekit-superforms/adapters';

export const changePasswordSchema = z.object({
	email: z.email(),
	'current-password': z.string().min(8),
	'new-password': z.string().min(8),
	'confirm-password': z.string().min(8)
});

export const updateAccountInfoSchema = z.object({
	name: z.string().min(3).max(20).optional(),
	imageUrl: z.url().optional()
});

export type ChangePasswordSchema = typeof changePasswordSchema;

export type UpdateAccountInfoSchema = typeof updateAccountInfoSchema;
