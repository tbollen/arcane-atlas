import { type CharacterSystems } from '$lib/gameSystems';
import { type DeckMapItem } from '.';

// NOTE: this function was put in modules to avoid circular imports
export function defineDeckMap<
	Sys extends CharacterSystems,
	T extends Record<string, Omit<DeckMapItem, 'system'>>
>(system: Sys, map: T) {
	const result = {} as Record<string, DeckMapItem>;

	for (const key in map) {
		result[key] = {
			...map[key],
			system,
			id: key
		};
	}

	return result as {
		[K in keyof T]: DeckMapItem & { system: Sys };
	};
}
