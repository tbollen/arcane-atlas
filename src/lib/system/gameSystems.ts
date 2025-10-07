export type SystemInfo = {
	name: string;
	id: string;
	version?: string;
};

// Create a "generic" system without mechanics or specific functions
const genericSystem: SystemInfo = {
	name: 'Generic',
	id: 'generic'
};
// Import system info from each system
import { arcaneRiftSystemInfo } from '$lib/system/ArcaneRift/ar_systemInfo';
// ADD MORE WHEN MORE SYSTEMS ARE ADDED

// List of available game systems, update when more systems are added
export const availableGameSystems = [genericSystem.id, arcaneRiftSystemInfo.id];

// Get Item Mechanics from each system
// ADD MORE WHEN MORE SYSTEMS ARE ADDED
import { type ArcaneRiftCard } from '$lib/system/ArcaneRift/ar_cards.svelte';

export const gameCardSystems = {
	[genericSystem.id]: {},
	[arcaneRiftSystemInfo.id]: {}
	// ADD MORE WHEN MORE SYSTEMS ARE ADDED
};
