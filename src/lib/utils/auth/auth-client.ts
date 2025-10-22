// Better Auth Client
import { createAuthClient } from 'better-auth/svelte';
import { emailOTPClient } from 'better-auth/client/plugins';
import { passkeyClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	// baseURL: 'http://localhost:5432'
	plugins: [passkeyClient(), emailOTPClient()]
});
