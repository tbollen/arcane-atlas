// Static Adapter for GitHub pages
// import adapter from '@sveltejs/adapter-static';
// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		appDir: 'src',
		adapter: adapter(),
		paths: {
			base: process.argv.includes('dev') ? '' : process.env.BASE_PATH
		},
		prerender: {
			handleHttpError: 'warn'
		}
	},
	vite: {
		ssr: {
			// Fix for stupid bits-ui error
			noExternal: [/^@smui(?:-extra)?\//]
		}
	}
};

export default config;
