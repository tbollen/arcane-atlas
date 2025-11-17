import PlayerBanner from './PlayerBanner.svelte';
import { type DeckComponent } from '../types';

// Lay out all available options for the deck (manual)
type GenericDeckOptions = 'banner';
// Create a map of all generic component and their keys
export const GenericComponentMap: Record<GenericDeckOptions, DeckComponent> = {
	['banner']: PlayerBanner
} as const;

// Export dict of the components themselves
export default { PlayerBanner };
