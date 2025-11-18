// Import Svelte types
import { type ComponentProps, type Component } from 'svelte';

// Import available mechanics from the class
import { type CharacterSystems } from '$lib/gameSystems';

// Import class instance for typing Props
import { type StoredCharacter } from '$lib/domain/characters/character.svelte';

/////////////////////////////////////////////
// Deck Config

// The Svelte component Type
// TODO: 'any' is not great, but works as long as all components have the correct types and use DeckProps.
export type DeckComponent = Component<any>;

// NOTE: DeckItemProps describes the properties necessary on each deck component
export type DeckItemProps = {
	character: StoredCharacter;
	edit: boolean;
	system?: CharacterSystems;
} & ComponentProps<any>;

export type DeckConfig = ValidDeckComponent[];
export type DeckProps = {
	deck: DeckConfig;
} & DeckItemProps;

/////////////////////////////////////////////
// Component Maps Module

// Layout for every Item in the Deck map
export type DeckMapItem = {
	component: DeckComponent;
	name: string;
	system: CharacterSystems;
};

function prefixDeckMapKeys<T extends Record<string, DeckMapItem>>(map: T) {
	const result: Record<string, DeckMapItem> = {};
	for (const key in map) {
		const item = map[key];
		result[`${item.system}:${key}`] = item;
	}
	return result as {
		[K in keyof T as `${T[K]['system'] & string}:${K & string}`]: T[K];
	};
}

/////////////////////////////////////////////
// Import and load all maps

import { GenericDeckMap } from '$lib/components/playdeck/generic';
import { ArcaneRiftComponentMap } from '$lib/components/playdeck/arcaneRift';

// Composed component map
export const DeckMap = {
	...prefixDeckMapKeys(GenericDeckMap),
	...prefixDeckMapKeys(ArcaneRiftComponentMap)
};
export type ValidDeckComponent = keyof typeof DeckMap;

// Game systems that have available Deck components
export const deckSystems = Array.from(
	new Set(Object.values(DeckMap).map((item) => item.system))
) as CharacterSystems[];
export type DeckSystem = (typeof deckSystems)[number];
