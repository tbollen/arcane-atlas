import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'sqlite' // or "mysql", "postgresql", ...etc
	}),
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
