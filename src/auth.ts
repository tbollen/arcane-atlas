import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';

export const { handle, signIn, signOut } = SvelteKitAuth(async (event) => {
	const authOptions = {
		providers: [
			GitHub({
				clientId: event.platform.env.AUTH_GITHUB_ID,
				clientSecret: event.platform.env.AUTH_GITHUB_SECRET
			})
		],
		secret: event.platform.env.AUTH_SECRET,
		trustHost: true
	};
	return authOptions;
});
