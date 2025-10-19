import { z } from 'zod';

export const loginFormSchema = z.object({
	email: z.email(),
	password: z.string()
});

export const signupFormSchema = z.object({
	name: z.string(),
	email: z.email(),
	password: z.string()
});
