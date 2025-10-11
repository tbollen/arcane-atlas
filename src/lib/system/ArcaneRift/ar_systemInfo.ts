import { type SystemInfo } from '../gameSystems';
import { arcaneRiftMechanics } from './ar_cards.svelte';
export const arcaneRiftSystemInfo: SystemInfo = {
	name: 'Arcane Rift',
	version: '0.1.0',
	cardMechanics: arcaneRiftMechanics
};
