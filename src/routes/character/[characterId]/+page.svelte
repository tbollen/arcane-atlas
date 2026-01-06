<script lang="ts">
	// Class and type imports
	import { StoredCharacter } from '$lib/domain/characters/character.svelte.js';
	import { StoredCard } from '$lib/domain/cards/cardStore.svelte.js';

	// Utils
	import type { UserID } from '$lib/domain/';
	import { toast } from 'svelte-sonner';
	import type { User as PrismaUser } from '@prisma/client';

	// UI Components
	import Icon from '@iconify/svelte';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	// Svelte
	import { page } from '$app/state';
	import CharacterPage from './CharacterPage.svelte';

	// Page init
	const characterID = page.params.characterId;
	let isNewCharacter: boolean = $derived(characterID == 'new');

	// Get props data
	let { data } = $props();
	const user = data?.user === null ? undefined : (data.user as PrismaUser);

	// Init cards from character
	let userCards: StoredCard[] = $derived(
		data?.cards
			? data.cards.map((card) =>
					StoredCard.newCardFromPrisma({ card, user, character: data.character })
				)
			: []
	);

	// Init StoredCharacter instance as Promise
	let characterPromise: Promise<StoredCharacter> = new Promise((resolve, reject) => {
		if (!data.user?.id || data.user == null) {
			reject(new Error('Client not logged in'));
			throw new Error('Client not logged in');
		}

		// If slug is 'new', create new character
		if (characterID == 'new') {
			let character = StoredCharacter.new({ userId: data.user.id as UserID });
			resolve(character);
		}
		// Check if character exists in database
		else if (!data.character) reject(new Error('No character found in database'));
		else {
			try {
				let character = StoredCharacter.fromPrisma({
					character: data.character,
					user: data.user as PrismaUser
				});
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
		<Spinner class="size-36" variant="Knight" />
	</main>
{:then character}
	<CharacterPage {character} {userCards} characterID={characterID!} {isNewCharacter} />
{:catch error}
	<main class="content flex flex-col">
		<h1 class="mb-4 text-2xl font-semibold">Error loading character</h1>
		<p>{error}</p>
		<Button class="mx-auto mt-4" variant="destructive" href="/character">
			<Icon icon="mdi:arrow-left" />Back to Character overview
		</Button>
	</main>
{/await}
