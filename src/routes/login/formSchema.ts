import * as z from 'zod';
import { zod4 } from 'sveltekit-superforms/adapters';

const basicLoginSchema = z.object({
	email: z.email(),
	password: z.string().min(8)
});

export const forgotPasswordSchema = z.object({
	email: z.email(),
	confirm: z.boolean().default(false)
});

export const loginFormSchema = basicLoginSchema.extend({
	rememberMe: z.boolean().default(false)
});

export const registerFormSchema = basicLoginSchema.extend({
	displayName: z.string().min(2).max(50),
	confirmPassword: z.string().min(8),
	acceptTerms: z.boolean().default(false),
	acceptPrivacyPolicy: z.boolean().default(false)
});

export type LoginFormSchema = typeof loginFormSchema;
export type RegisterFormSchema = typeof registerFormSchema;
export type ForgotPasswordSchema = typeof forgotPasswordSchema;
