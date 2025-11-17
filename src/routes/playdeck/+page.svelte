<script lang="ts">
	// Types
	import { type Character as PrismaCharacter, type User as PrismaUser } from '@prisma/client';

	// Import UI components
	import { Header } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import Icon from '@iconify/svelte';
	import CharacterCard from '$lib/components/partials/character/CharacterCard.svelte';

	// Import classes
	import { StoredCharacter } from '$lib/domain/characters/character.svelte.js';

	// DECK stuff
	import Deck from '$lib/components/playdeck/Deck.svelte';
	import { type DeckConfig } from '$lib/components/playdeck';

	// Utils
	import { lsk } from '$lib/utils/storage/keys.js';
	import { getContext } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { AR_KEY, GENERIC_KEY } from '$lib/gameSystems/index.js';
	import { spinner } from '$lib/stores/loadingSpinner.svelte.js';

	// API
	import CHARACTER_API from '$lib/utils/api/characters_api.js';

	// Init character
	let { data } = $props();
	const dataCharactersAsStored = data.characters.map((character) =>
		StoredCharacter.fromPrisma({ character, user: data.user as PrismaUser })
	);

	// Retrieve active character
	function promiseCharacter(): Promise<StoredCharacter> {
		return new Promise((resolve, reject) => {
			// If user is not logged in
			if (!data.user?.id || data.user == null) {
				toast.error('Please log in to see your playdeck');
				reject(new Error('Error: Client not logged in, redirecting to login page'));
				goto(`/login`);
				return;
			}

			// If user has no characters
			if (!data.characters) {
				toast.error('No characters found in database');
				reject(new Error('Error: No characters found in database, redirecting to character page'));
				goto(`/character`);
				return;
			}

			// If localStorage has no active character set, or the character set does not exist
			const activeCharacterID = localStorage.getItem(lsk.activeCharacter);
			const activeCharacter = data.characters.find((c) => c.id === activeCharacterID);
			if (!activeCharacterID || activeCharacter == undefined) {
				reject(new Error('Please select your character'));
				return;
			} else {
				// If all checks pass, resolve with active character
				let character = StoredCharacter.fromPrisma({
					character: activeCharacter,
					user: data.user as PrismaUser
				});
				toast.success('Character loaded');
				resolve(character);
			}
		});
	}
	let character: Promise<StoredCharacter> = $state(promiseCharacter());

	// FUNCTIONS
	function setActiveCharacter(characterID: string) {
		localStorage.setItem(lsk.activeCharacter, characterID);
		character = promiseCharacter();
	}

	function saveChanges() {
		spinner.set('save', 'Saving...');
		// Check character promise
		character
			.then((character) => {
				// If character exists, try to update through API
				CHARACTER_API.update(character.toPrisma())
					.then(() => {
						toast.success('Character saved');
						console.log('Character saved', character.systems);
					})
					.catch((error) => {
						toast.error(`Error saving character: ${error}`);
					});
			})
			// If character does not exist anymore, notify user
			.catch((error) => {
				toast.error(`Error saving character: ${error}`);
			})
			// Close spinner
			.finally(() => {
				setTimeout(() => {
					spinner.complete();
				}, 500);
			});
	}

	function unsetActiveCharacter() {
		localStorage.removeItem(lsk.activeCharacter);
		character = promiseCharacter();
	}

	// EDIT MODE
	let edit = $state(false);
	function toggleEdit() {
		edit = !edit;
	}

	// DECK VARS
	let deck: DeckConfig = $state(['generic:banner']);
</script>

<main>
	{#await character}
		<p>Loading character...</p>
	{:then character}
		<div id="Actions" class="my-4 flex flex-row items-center gap-2">
			{#if edit}
				<Button onclick={toggleEdit} variant="secondary"><Icon icon="mdi:eye" />View</Button>
				<Button onclick={saveChanges} variant="success" spinner={{ id: 'save' }}
					><Icon icon="mdi:floppy" />Save</Button
				>
			{:else}
				<Button onclick={toggleEdit} variant="advanced"><Icon icon="mdi:pencil" />Edit</Button>
			{/if}
			<Button onclick={unsetActiveCharacter} variant="destructive"
				>Select different character</Button
			>
			<Button
				onclick={() => {
					console.log(character.mechanics);
				}}>Log</Button
			>
		</div>
		<Deck {character} bind:edit {deck} />
	{:catch}
		<!-- Any errors encountered will redirect the client, except when no "Active Character" is set -->
		<!-- In this case, the client will be shown a menu to select a character -->
		<Header variant="h2">Select Character</Header>
		{#each dataCharactersAsStored as character}
			<button
				class="cursor-pointer rounded-md hover:outline-2 hover:outline-blossom-500"
				onclick={() => {
					setActiveCharacter(character.id);
				}}
			>
				<CharacterCard {character} />
			</button>
		{/each}
	{/await}
</main>
