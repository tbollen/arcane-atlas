export type SystemInfo = {
	name: string;
	id: string;
	version: string;
};

// Import system info from each system
import { arcaneRiftSystemInfo } from '$lib/system/ArcaneRift/systemInfo';
// ADD MORE WHEN MORE SYSTEMS ARE ADDED

// List of available game systems, update when more systems are added
export const availableGameSystems = [arcaneRiftSystemInfo.id, 'dnd5e'];

// Get Item Mechanics from each system
// ADD MORE WHEN MORE SYSTEMS ARE ADDED
import { type ArcaneRiftCard } from '$lib/system/ArcaneRift/cards';

export const gameCardSystems = {
	undefined: {},
	[arcaneRiftSystemInfo.id]: {} as ArcaneRiftCard
	// ADD MORE WHEN MORE SYSTEMS ARE ADDED
} as { [key: string]: any };
