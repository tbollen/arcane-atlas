// Widget stuff
import { type SystemWidgetMap } from '../widget';

// SVELTE COMPONENTS
import Aspects from './Aspects.svelte';

// WidgetMap
export const arcaneRiftWidgetMap: SystemWidgetMap = {
	['aspects']: {
		component: Aspects,
		name: 'Aspects',
		initialLayout: { w: 3, h: 2 }
	}
};
