import * as z from 'zod';
import { zod4 } from 'sveltekit-superforms/adapters';

const basicLoginSchema = z.object({
	email: z.email(),
	password: z.string().min(8)
});

export const loginFormSchema = basicLoginSchema.extend({
	rememberMe: z.boolean().default(false)
});

export const registerFormSchema = basicLoginSchema.extend({
	displayName: z.string().min(2).max(50),
	confirmPassword: z.string().min(8)
});

export type LoginFormSchema = typeof loginFormSchema;
export type RegisterFormSchema = typeof registerFormSchema;
