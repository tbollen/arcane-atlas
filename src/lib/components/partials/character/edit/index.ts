// Character Edit Partials
import CharacterGeneralFields from './CharacterGeneralFields.svelte';
import CharacterCards from './CharacterCards.svelte';
import CharacterGameSystems from './CharacterGameSystems.svelte';

// Arcane Rift Specific
import CharacterAspects from './arcaneRift/CharacterAspects.svelte';
import CharacterStressTrack from './arcaneRift/CharacterStressTrack.svelte';
import CharacterStats from './arcaneRift/CharacterStats.svelte';
import CharacterConsequences from './arcaneRift/CharacterConsequences.svelte';

// SYSTEM KEYS
import { GENERIC_KEY, AR_KEY } from '$lib/gameSystems/index.js';

// Types
import type { CharacterProperties } from '$lib/domain/characters/character.svelte';
import type { CharacterEditProps } from '$lib/components/partials/character/edit/propsType';
import type { Component } from 'svelte';

export { CharacterGeneralFields, CharacterCards, CharacterGameSystems, CharacterAspects };

// Type helper to convert CharacterProperties to accordion dictionary structure
type EditComponentDict = {
	[System in keyof CharacterProperties]?: {
		[Property in NonNullable<CharacterProperties[System]>[number]]?: {
			name: string;
			component: Component<CharacterEditProps>;
			description: string;
		};
	};
};

export const characterEditComponentDict: EditComponentDict = {
	[GENERIC_KEY]: {
		general: {
			name: 'Character Info',
			description: 'General information about the character.',
			component: CharacterGeneralFields
		},
		cards: {
			name: 'Cards',
			description: 'Manage the cards associated with this character.',
			component: CharacterCards
		},
		systems: {
			name: 'Game Systems',
			description: 'Manage the game systems associated with this character.',
			component: CharacterGameSystems
		}
	},
	[AR_KEY]: {
		aspects: {
			name: 'Aspects',
			description: 'Define the aspects of your Arcane Rift character.',
			component: CharacterAspects
		},
		stressTracks: {
			name: 'Stress Tracks',
			description: 'Manage the stress tracks for your Arcane Rift character.',
			component: CharacterStressTrack
		},
		stats: {
			name: 'Stats',
			description: 'Manage the skills and characteristics for your Arcane Rift character.',
			component: CharacterStats
		},
		consequences: {
			name: 'Consequences',
			description: 'Manage the consequences your Arcane Rift character can face.',
			component: CharacterConsequences
		}
	}
} as const;
