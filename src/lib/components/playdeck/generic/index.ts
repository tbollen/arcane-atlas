import { GENERIC_KEY } from '$lib/gameSystems';

// Widget stuff
import { type SystemWidgetMap } from '../modules/widget';

// SVELTE COMPONENTS
import PlayerBanner from './PlayerBanner.svelte';
import CharacterDescription from './CharacterDescription.svelte';
import DeckCards from './DeckCards.svelte';

// WidgetMap
export const genericWidgetMap: SystemWidgetMap = {
	['banner']: {
		component: PlayerBanner,
		name: 'Banner',
		initialLayout: { w: 3, h: 1, max: { w: 12, h: 3 }, min: { w: 2, h: 1 } },
		characterProperties: { [GENERIC_KEY]: ['name', 'subtitle', 'imageUrl'] }
	},
	['description']: {
		component: CharacterDescription,
		name: 'Description',
		initialLayout: { w: 3, h: 2 },
		characterProperties: { [GENERIC_KEY]: ['name', 'description'] }
	},
	['cards']: {
		component: DeckCards,
		name: 'Deck Cards',
		initialLayout: { w: 3, h: 3, min: { w: 2, h: 2 }, max: { w: 6, h: 6 } },
		characterProperties: {
			[GENERIC_KEY]: ['cards']
		}
	}
};
