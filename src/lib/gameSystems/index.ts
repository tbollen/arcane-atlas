///////////////
// MECHANICS //
///////////////
// Add and import system information HERE!!

// Import mechanics from each system
// Arcane Rift //
import {
	arcaneRiftCardMechanics,
	type ArcaneRiftCardMechanics
} from '$lib/gameSystems/ArcaneRift/ar_cards';
import {
	arcaneRiftCharacterMechanics,
	type ArcaneRiftCharacterMechanics
} from './ArcaneRift/ar_characters';
// ADD MORE WHEN MORE SYSTEMS ARE ADDED

// TYPE AND CONST DEFINITIONS
// ORIGIN SOURCE OF TRUTH
// System keys
export const GENERIC_KEY = 'generic' as const;
export const AR_KEY = 'arcaneRift' as const;

// CARDS
export const cardMechanics: {
	[GENERIC_KEY]: {};
	[AR_KEY]?: ArcaneRiftCardMechanics;
} = {
	[GENERIC_KEY]: {},
	[AR_KEY]: arcaneRiftCardMechanics
};

// CHARACTERS
export const characterMechanics: {
	[GENERIC_KEY]: {};
	[AR_KEY]?: ArcaneRiftCharacterMechanics;
} = {
	[GENERIC_KEY]: {},
	[AR_KEY]: arcaneRiftCharacterMechanics
};

///////////////////////////////////
// Populated and generated types //
///////////////////////////////////
// CARDS
export type CardMechanics = typeof cardMechanics;
export type CardSystems = keyof CardMechanics;

// CHARACTER
export type CharacterMechanics = typeof characterMechanics;
export type CharacterSystems = keyof CharacterMechanics;

///////////////////////////////////

// List of all system keys from Mechanics
export type SystemKey = keyof CardMechanics;
export const systemKeys: SystemKey[] = Object.keys({} as CardMechanics) as SystemKey[];

// System-specific keys, make sure to match from Mechanics Type!!

export type SystemInfo = {
	name: string;
	locked?: boolean;
	version?: string;
	cardMechanics: Object;
};

/////////////////
// SYSTEM INFO //
/////////////////

// Import system info from each system
import { arcaneRiftSystemInfo } from '$lib/gameSystems/ArcaneRift/ar_systemInfo';

// Create a "generic" system without mechanics or specific functions
const genericSystem: SystemInfo = {
	name: 'Generic',
	locked: true,
	cardMechanics: {}
};

export const gameSystems: Record<SystemKey, SystemInfo> = {
	[GENERIC_KEY]: genericSystem,
	[AR_KEY]: arcaneRiftSystemInfo
};
