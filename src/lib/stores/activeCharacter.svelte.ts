import { StoredCharacter } from '$lib/domain/characters/character.svelte';
import { writable, type Writable } from 'svelte/store';

export const activeCharacter: Writable<StoredCharacter | undefined> = writable();
