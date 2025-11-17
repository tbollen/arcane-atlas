<script lang="ts">
	// Types
	import { type Character as PrismaCharacter, type User as PrismaUser } from '@prisma/client';

	// Import UI components
	import { Header } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import CharacterCard from '$lib/components/partials/character/CharacterCard.svelte';

	// Import classes
	import { CharacterStore, StoredCharacter } from '$lib/domain/characters/character.svelte.js';

	// DECK stuff
	import Deck from '$lib/components/playdeck/Deck.svelte';

	// Utils
	import { lsk } from '$lib/utils/storage/keys.js';
	import { getContext } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { AR_KEY, GENERIC_KEY } from '$lib/gameSystems/index.js';

	// Init deck
	const deck = ['character', 'system', 'deck'];

	// Init character
	let { data } = $props();
	const dataCharactersAsStored = data.characters.map((character) =>
		StoredCharacter.fromPrisma({ character, user: data.user as PrismaUser })
	);

	// Retrieve active character
	let character: Promise<StoredCharacter> = $derived(
		new Promise((resolve, reject) => {
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
		})
	);
	// FUNCTIONS
	function setActiveCharacter(characterID: string) {
		localStorage.setItem(lsk.activeCharacter, characterID);
		invalidateAll();
	}

	function unsetActiveCharacter() {
		localStorage.removeItem(lsk.activeCharacter);
		invalidateAll();
	}
</script>

{#await character}
	<p>Loading character...</p>
{:then character}
	<Deck {character} deck={{ system: AR_KEY, config: ['banner', 'aspects'] }} />
	<Button onclick={unsetActiveCharacter} variant="destructive">Select different character</Button>
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
