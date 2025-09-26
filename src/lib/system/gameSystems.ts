export const availableGameSystems = ['arcane-rift', 'dnd5e'];

// Get Item Mechanics from each system
// ADD MORE WHEN MORE SYSTEMS ARE ADDED
import { type ArcaneRiftCard } from '$lib/system/ArcaneRift/cards';

export const gameCardSystems = {
	undefined: {},
	'arcane-rift': {} as ArcaneRiftCard
	// ADD MORE WHEN MORE SYSTEMS ARE ADDED
} as const;
