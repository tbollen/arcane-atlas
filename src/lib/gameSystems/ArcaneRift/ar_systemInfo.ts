import { type SystemInfo } from '..';
import { arcaneRiftCardMechanics } from './ar_cards';
export const arcaneRiftSystemInfo: SystemInfo = {
	name: 'Arcane Rift',
	description: 'A custom home-brew RPG system based on Fate and Genesys',
	icon: 'game-icons:portal',
	creator: 'Thomas Bollen',
	version: '0.1.0',
	cardMechanics: arcaneRiftCardMechanics
};
