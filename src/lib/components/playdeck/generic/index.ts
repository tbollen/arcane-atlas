import { defineDeckMap } from '../modules';
import { GENERIC_KEY } from '$lib/gameSystems';

// SVELTE COMPONENTS
import PlayerBanner from './PlayerBanner.svelte';
import CharacterDescription from './CharacterDescription.svelte';

// DeckMap
export const GenericDeckMap = defineDeckMap(GENERIC_KEY, {
	['banner']: {
		component: PlayerBanner,
		name: 'Banner'
	},
	['description']: {
		component: CharacterDescription,
		name: 'Description'
	}
});

// Export dict of the components themselves
export default { PlayerBanner };
