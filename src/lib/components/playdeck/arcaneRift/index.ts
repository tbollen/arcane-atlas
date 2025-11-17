import { defineDeckMap } from '../modules';
import { AR_KEY } from '$lib/gameSystems';

// SVELTE COMPONENTS
import Aspects from './Aspects.svelte';

// DeckMap
export const ArcaneRiftComponentMap = defineDeckMap(AR_KEY, {
	['aspects']: {
		component: Aspects,
		name: 'Aspects'
	}
});

// Export dict of the components themselves
export default { Aspects };
