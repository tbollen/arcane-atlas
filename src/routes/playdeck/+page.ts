import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { activeCharacter } from '$lib/stores/activeCharacter.svelte';

// Disable SSR since we need to access the store
export const ssr = false;

export const load: PageLoad = async () => {
	// Check if there's an active character in the store
	const activeCharacterId = activeCharacter.activeCharacter?.id;

	if (activeCharacterId) {
		// Redirect to the active character's page
		throw redirect(302, `/character/${activeCharacterId}?mode=play`);
	} else {
		// Redirect to character selection page
		throw redirect(302, '/character');
	}
};
