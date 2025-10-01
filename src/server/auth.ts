import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from '@prisma/client';
import { nextCookies } from 'better-auth/next-js';
import { sveltekitCookies } from 'better-auth/svelte-kit';
// Cookies for SvelteKit imports
import { getRequestEvent } from '$app/server';

const prisma = new PrismaClient();
export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'sqlite' // or "mysql", "postgresql", ...etc
	}),
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5 // 5 minutes
		}
	},
	plugins: [sveltekitCookies(getRequestEvent)],
	emailAndPassword: {
		enabled: true
	}
	// socialProviders: {
	// 	github: {
	// 		enabled: true,
	// 		clientId: process.env.GITHUB_CLIENT_ID,
	// 		clientSecret: process.env.GITHUB_CLIENT_SECRET,
	// 		profileFields: ['id', 'email', 'name', 'picture']
	// 	},
	// 	google: {
	// 		enabled: true,
	// 		clientId: process.env.GOOGLE_CLIENT_ID,
	// 		clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	// 		profileFields: ['id', 'email', 'name', 'picture']
	// 	}
	// }
});
