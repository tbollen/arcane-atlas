import type { SystemWidgetMap, WidgetMap } from '$lib/components/playdeck/widget';
import type { CharacterSystems } from '$lib/gameSystems';

export function defineDeckMap<
	System extends CharacterSystems, // literal prefix
	Map extends SystemWidgetMap // literal widget keys
>(widgetMap: Map, system: System): WidgetMap {
	return Object.fromEntries(
		Object.entries(widgetMap).map(([key, widget]) => [
			// prefix the key
			`${system}:${key}`,
			{
				...widget,
				system // add system property
			}
		])
	) as {
		[K in keyof Map as `${System & string}:${K & string}`]: Map[K] & { system: System };
	};
}
