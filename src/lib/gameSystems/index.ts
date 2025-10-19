///////////////
// MECHANICS //
///////////////
// Add and import system information HERE!!

// Import mechanics from each system
import {
	arcaneRiftMechanics,
	type ArcaneRiftMechanics
} from '$lib/gameSystems/ArcaneRift/ar_cards';
// ADD MORE WHEN MORE SYSTEMS ARE ADDED

// TYPE AND CONST DEFINITIONS
// ORIGIN SOURCE OF TRUTH
// System keys
export const GENERIC_KEY = 'generic' as const;
export const AR_KEY = 'arcaneRift' as const;

export const cardMechanics: {
	[GENERIC_KEY]: {};
	[AR_KEY]?: ArcaneRiftMechanics;
} = {
	[GENERIC_KEY]: {},
	[AR_KEY]: arcaneRiftMechanics
};

// Populated and generated
export type Mechanics = typeof cardMechanics;

// List of all system keys from Mechanics
export type SystemKey = keyof Mechanics;
export const systemKeys: SystemKey[] = Object.keys({} as Mechanics) as SystemKey[];

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
