import Aspects from './Aspects.svelte';
import { type DeckComponent } from '../types';

// Lay out all available options for the deck (manual)
type ArcaneRiftDeckOptions = 'aspects';
// Create a map of all Arcane Rift Components and their keys
export const ArcaneRiftComponentMap: Record<ArcaneRiftDeckOptions, DeckComponent> = {
	['aspects']: Aspects
} as const;

// Export dict of the components themselves
export default { Aspects };
