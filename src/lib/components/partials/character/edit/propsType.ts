import type { StoredCard } from '$lib/domain/cards/cardStore.svelte';
import type { StoredCharacter } from '$lib/domain/characters/character.svelte';
export type CharacterEditProps = {
	character: StoredCharacter;
	cards?: StoredCard[];
};
