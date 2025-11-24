import { AR_KEY } from '$lib/gameSystems';

// Widget stuff
import { type SystemWidgetMap } from '../widget';

// SVELTE COMPONENTS
import Aspects from './Aspects.svelte';
import Consequences from './Consequences.svelte';

// WidgetMap
export const arcaneRiftWidgetMap: SystemWidgetMap = {
	['aspects']: {
		component: Aspects,
		name: 'Aspects',
		initialLayout: { w: 4, h: 4, min: { w: 2, h: 2 }, max: { w: 6, h: 7 } },
		characterProperties: { [AR_KEY]: ['aspects'] }
	},
	['consequences']: {
		component: Consequences,
		name: 'Consequences',
		initialLayout: { w: 4, h: 4, min: { w: 2, h: 2 }, max: { w: 6, h: 7 } },
		characterProperties: { [AR_KEY]: ['consequences'] }
	}
};
