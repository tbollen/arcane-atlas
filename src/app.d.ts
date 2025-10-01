// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { AuthRequest } from 'better-auth';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: AuthRequest;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
