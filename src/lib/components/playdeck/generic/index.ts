// Widget stuff
import { type SystemWidgetMap } from '../widget';

// SVELTE COMPONENTS
import PlayerBanner from './PlayerBanner.svelte';
import CharacterDescription from './CharacterDescription.svelte';

// WidgetMap
export const genericWidgetMap: SystemWidgetMap = {
	['banner']: {
		component: PlayerBanner,
		name: 'Banner',
		initialLayout: { w: 3, h: 1, max: { w: 12, h: 2 }, min: { w: 3, h: 1 } }
	},
	['description']: {
		component: CharacterDescription,
		name: 'Description',
		initialLayout: { w: 3, h: 2 }
	}
};
