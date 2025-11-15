<script lang="ts">
	import { page } from '$app/state';
	import { getContext, onMount } from 'svelte';

	// Class imports
	import { CharacterStore, StoredCharacter } from '$lib/domain/characters/character.svelte.js';

	// Utils
	import { ck } from '$lib/utils/storage/keys.js';
	import type { UserID, CharacterID } from '$lib/domain/';
	import { toast } from 'svelte-sonner';

	// UI Components
	import Icon from '@iconify/svelte';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	// Get page data
	const characterID = page.params.characterId;
	let { data } = $props();

	console.log(data.characters);

	// Get store from context
	const characterStore = getContext<CharacterStore>(ck.characterStore);

	// Init StoredCharacter instance
	let isNewCharacter: boolean = false;
	let characterPromise: Promise<StoredCharacter> = new Promise((resolve, reject) => {
		if (!data.user?.id || data.user == null) {
			reject(new Error('Client not logged in'));
			throw new Error('Client not logged in');
		}
		if (characterID == 'new') {
			let character = characterStore.addNew({ userId: data.user.id as UserID });
			isNewCharacter = true;
			resolve(character);
		} else {
			try {
				let character = characterStore.getCharacter(characterID ?? '');
				resolve(character);
			} catch (error) {
				toast.error(`Error loading character: ${error}`);
				reject(error);
			}
		}
	});
</script>

{#await characterPromise}
	<main class="content grid columns-1 place-items-center">
		<p class="mb-4 text-2xl">Loading character...</p>
		<code>ID: {characterID}</code>
		<Spinner class="size-36" />
	</main>
{:then character}
	<img src={character.imageUrl} alt={character.name} />
	Character ID: {characterID}
{:catch error}<main class="content flex flex-col">
		<h1 class="mb-4 text-2xl font-semibold">Error loading character</h1>
		<p>{error}</p>
		<Button class="mx-auto mt-4" variant="destructive" href="/character"
			><Icon icon="mdi:arrow-left" />Back to Character overview</Button
		>
	</main>
{/await}
