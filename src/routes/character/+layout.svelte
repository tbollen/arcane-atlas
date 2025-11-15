<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { CharacterStore, StoredCharacter } from '$lib/domain/characters/character.svelte.js';
	// Types
	import type { User as PrismaUser } from '@prisma/client';
	import type { CharacterID } from '$lib/domain/';
	// Stores
	import { activeCharacter } from '$lib/stores/activeCharacter.svelte.js';
	// Utils
	import { ck, lsk } from '$lib/utils/storage/keys.js';

	let { children, data } = $props();

	// Set characterStore in Context
	let storedCharacters: StoredCharacter[] = data.viewableCharacters.map((character) =>
		StoredCharacter.fromPrisma({
			character,
			user: data.user as PrismaUser,
			campaigns: character?.campaigns
		})
	);
	let characterStore: CharacterStore = new CharacterStore({
		characters: storedCharacters,
		ids: data.allCharacterIds.map((c) => c.id as CharacterID)
	});

	// Set store in context
	setContext<CharacterStore>(ck.characterStore, characterStore);

	onMount(() => {
		// Set active character in store
		const activeCharacterFromLS = localStorage.getItem(lsk.activeCharacter);
		if (data.characters.find((c) => c.id == activeCharacterFromLS)) {
			activeCharacter.set(activeCharacterFromLS as CharacterID);
		}
	});
</script>

{@render children?.()}
