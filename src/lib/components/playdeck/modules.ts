import type { SystemWidgetMap, WidgetMap, MappedWidget } from '$lib/components/playdeck/widget';
import type { CharacterSystems } from '$lib/gameSystems';

export function defineDeckMap<
	System extends CharacterSystems, // literal prefix
	Map extends SystemWidgetMap // literal widget keys
>(widgetMap: Map, system: System): WidgetMap {
	return Object.fromEntries(
		Object.entries(widgetMap).map(([key, widget]) => {
			const componentID = `${system}:${key}`;
			const newWidget: MappedWidget = {
				...widget,
				system
			};
			// prefix the key
			return [componentID, newWidget];
		})
	) as {
		[K in keyof Map as `${System & string}:${K & string}`]: Map[K] & { system: System };
	};
}
