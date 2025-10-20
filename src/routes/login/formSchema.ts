import * as z from 'zod';
import { zod4 } from 'sveltekit-superforms/adapters';

export const loginFormSchema = z.object({
	email: z.email(),
	password: z.string().min(8)
});

export const registerFormSchema = loginFormSchema.extend({
	displayName: z.string().min(2).max(50),
	confirmPassword: z.string().min(8)
});

export type LoginFormSchema = typeof loginFormSchema;
export type RegisterFormSchema = typeof registerFormSchema;
