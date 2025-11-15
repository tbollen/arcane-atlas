<script lang="ts">
	import { page } from '$app/state';
	import { getContext, onMount } from 'svelte';

	// Class imports
	import { CharacterStore, StoredCharacter } from '$lib/domain/characters/character.svelte.js';

	// Utils
	import { ck } from '$lib/utils/storage/keys.js';
	import type { UserID, CharacterID } from '$lib/domain/';

	// Get page data
	const characterID = page.params.characterId;
	let { data } = $props();

	console.log(data.characters);

	// Get store from context
	const characterStore = getContext<CharacterStore>(ck.characterStore);

	// Init StoredCharacter instance
	let character: StoredCharacter;
	let isNewCharacter: boolean = false;

	onMount(() => {
		// User not logged in, don't do anything
		if (!data.user) {
			alert('You must be logged in to view this page.');
			throw new Error('Client not logged in');
		}
		// If characterID is 'new', create a new character
		if (characterID == 'new') {
			character = characterStore.addNew({ userId: data.user.id as UserID });
			isNewCharacter = true;
		}
		// If characterID is defined, get the character
		else {
			try {
				character = characterStore.getCharacter(characterID ?? '');
			} catch (error) {
				alert(error);
				throw error;
			}
		}
	});
</script>

Character ID: {characterID}
