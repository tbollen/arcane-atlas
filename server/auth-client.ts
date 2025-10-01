// Better Auth Client
import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: 'http://localhost:3000'
});

// export const { signIn, signUp, useSession } = createAuthClient();

authClient.useSession();

authClient.signUp.email({
	email: 'example@email.com',
	password: 'yourPassword123',
	name: 'koekiemonster'
});
