import { type StoredCharacter } from '$lib/domain/characters/character.svelte';
import { type ComponentProps, type Component } from 'svelte';

export type DeckProps = {
	character: StoredCharacter;
	edit: boolean;
} & ComponentProps<any>;

export type DeckComponent = Component<DeckProps>;
