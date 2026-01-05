///////////////
// MECHANICS //
///////////////
// Add and import system information HERE!!

// Import mechanics from each system

/////////////////////////////
// Arcane Rift //
/////////////////////////////

// Arcane Rift; CARDS
import {
	arcaneRiftCardMechanics,
	type ArcaneRiftCardMechanics
} from '$lib/gameSystems/ArcaneRift/ar_cards';
// Arcane Rift; CHARACTERS
import {
	arcaneRiftCharacterMechanics,
	type ArcaneRiftCharacterMechanics,
	arcaneRiftDefaultCharacterRules,
	type ArcaneRiftCharacterRules
} from './ArcaneRift/ar_characters';
import { ArcaneRiftCharacterController } from './ArcaneRift/controllers/characterController';

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

export const characterRules: {
	[GENERIC_KEY]: {};
	[AR_KEY]?: ArcaneRiftCharacterRules;
} = {
	[GENERIC_KEY]: {},
	[AR_KEY]: arcaneRiftDefaultCharacterRules
};

// CHARACTER CONTROLLERS
export class CharacterController {
	[GENERIC_KEY]: {} = {};
	[AR_KEY]?: ArcaneRiftCharacterController;

	constructor(
		getMechanics: () => CharacterMechanics,
		setMechanics: (mechanics: CharacterMechanics) => void,
		rules?: CharacterRules
	) {
		const mechanics = getMechanics();
		// SET UP ARCANE RIFT
		if (mechanics[AR_KEY]) {
			this[AR_KEY] = new ArcaneRiftCharacterController(
				() => getMechanics()[AR_KEY]!,
				(m: ArcaneRiftCharacterMechanics) => setMechanics({ ...mechanics, [AR_KEY]: m }),
				rules?.[AR_KEY] || arcaneRiftDefaultCharacterRules
			);
		}
	}
}

///////////////////////////////////
// Populated and generated types //
///////////////////////////////////
// CARDS
export type CardMechanics = typeof cardMechanics;
export type CardSystems = keyof CardMechanics;

// CHARACTER
export type CharacterMechanics = typeof characterMechanics;
export type CharacterSystems = keyof CharacterMechanics;
export type CharacterRules = typeof characterRules;

///////////////////////////////////

// List of all system keys from Mechanics
export type SystemKey = keyof CardMechanics;
export const systemKeys: SystemKey[] = Object.keys({} as CardMechanics) as SystemKey[];

// System-specific keys, make sure to match from Mechanics Type!!

export type SystemInfo = {
	name: string;
	description: string;
	icon: string;
	url?: string;
	creator?: string;
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
	description: 'Basic mechanics that fit with any game system.',
	icon: 'mdi:dice-multiple',
	locked: true,
	cardMechanics: {}
};

export const gameSystems: Record<SystemKey, SystemInfo> = {
	[GENERIC_KEY]: genericSystem,
	[AR_KEY]: arcaneRiftSystemInfo
};
