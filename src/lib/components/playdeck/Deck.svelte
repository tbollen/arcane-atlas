<script lang="ts" module>
	////////////////////////////////////////////////////////////////////
	// Import component maps and their keys for all available systems //
	////////////////////////////////////////////////////////////////////
	// KEYS
	// NOTE: it is important to do this separate, as not every system automatically has components yet
	import { GENERIC_KEY, AR_KEY } from '$lib/gameSystems';

	// GENERIC
	import { GenericComponentMap } from '$lib/components/playdeck/generic';

	// ARCANE RIFT
	import { ArcaneRiftComponentMap } from '$lib/components/playdeck/arcaneRift';

	// Put all imported components in 1 big Component (dict)
	// Keep generic separate, generic components may always be used!
	const ComponentDict = {
		[AR_KEY]: ArcaneRiftComponentMap
	} as const;
	// Generic components are ALWAYS supported, as they do not require the "mechanics" property
	const GenericDict = {
		[GENERIC_KEY]: GenericComponentMap
	} as const;

	// Compiled types
	// All supported systems for the Playdeck
	export type DeckSystems = keyof typeof ComponentDict;

	// All supported components for the Playdeck, requires a system as key
	type DeckConfig = {
		[S in DeckSystems]: {
			system?: S;
			config: Array<
				keyof (typeof ComponentDict)[S] | keyof (typeof GenericDict)[typeof GENERIC_KEY]
			>;
		};
	}[DeckSystems];
</script>

<script lang="ts">
	// Import necessary types and utils
	import { type StoredCharacter } from '$lib/domain/characters/character.svelte';
	import { type DeckComponent } from './types';

	type Props = {
		deck: DeckConfig;
		character: StoredCharacter;
		edit?: boolean;
	};

	let { deck, character, edit = false }: Props = $props();

	// Create combined component map with all keys
	const DeckDict = deck?.system
		? {
				...ComponentDict[deck.system],
				...GenericDict[GENERIC_KEY]
			}
		: ({ ...GenericDict[GENERIC_KEY] } as const);

	// Create array of components to be rendered
	const ComponentArray: DeckComponent[] = deck.config
		// Filter out keys that are not in the component map (used when no System is given)
		.filter((key) => Object.keys(DeckDict).includes(key))
		// Create an array of Components from the filtered keys
		.map((key) => DeckDict[key as keyof typeof DeckDict]);
</script>

{#each ComponentArray as Component}
	<Component {character} {edit} />
{/each}
