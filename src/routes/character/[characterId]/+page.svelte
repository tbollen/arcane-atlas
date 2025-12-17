<script lang="ts">
	import { page } from '$app/state';
	import { getContext, onMount } from 'svelte';

	// Class and type imports
	import {
		CharacterStore,
		StoredCharacter,
		type PrismaCharacterExtended
	} from '$lib/domain/characters/character.svelte.js';
	import { StoredCard } from '$lib/domain/cards/cardStore.svelte.js';

	// Utils
	import { ck } from '$lib/utils/storage/keys.js';
	import type { UserID, CharacterID } from '$lib/domain/';
	import { toast } from 'svelte-sonner';
	import type { User as PrismaUser, Character as PrismaCharacter } from '@prisma/client';
	import { spinner } from '$lib/stores/loadingSpinner.svelte.js';

	// API
	import CHARACTER_API from '$lib/utils/api/characters_api';

	// UI Components
	import Icon from '@iconify/svelte';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Header } from '$lib/components/typography';
	import CharacterCard from '$lib/components/partials/character/CharacterCard.svelte';

	// Deck imports
	import Deck from '$lib/components/playdeck/Deck.svelte';
	import { fallbackDeck, type StoredDeck } from '$lib/components/playdeck';
	import {
		defaultDeckConfig,
		type DeckConfig
	} from '$lib/components/playdeck/modules/deckConfig.js';

	// Svelte
	import { goto, invalidateAll } from '$app/navigation';

	// Page init
	const characterID = page.params.characterId;
	let isNewCharacter: boolean = $derived(characterID == 'new');
	// svelte-ignore state_referenced_locally
	let isEditing: boolean = $state(isNewCharacter);

	// Get props data
	let { data } = $props();
	const user = data?.user === null ? undefined : (data.user as PrismaUser);

	// Init cards from character
	let characterCardsAsStored: StoredCard[] = data?.cards
		? data.cards.map((card) => StoredCard.newCardFromPrisma({ card, user }))
		: [];

	// Init StoredCharacter instance as Promise
	let characterPromise: Promise<StoredCharacter> = new Promise((resolve, reject) => {
		if (!data.user?.id || data.user == null) {
			reject(new Error('Client not logged in'));
			throw new Error('Client not logged in');
		}

		// If slug is 'new', create new character
		if (characterID == 'new') {
			let character = StoredCharacter.new({ userId: data.user.id as UserID });
			isNewCharacter = true;
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
				// let character = characterStore.getCharacter(characterID ?? '');
				resolve(character);
			} catch (error) {
				toast.error(`Error loading character: ${error}`);
				reject(error);
			}
		}
	});

	////////////////////////
	// DECK
	let deck: StoredDeck | undefined = $state(); //local state to allow reactivity, without binding to character
	// Deck config TODO: make editable and add sb entry
	const deckConfig: DeckConfig = defaultDeckConfig;

	// Character promise resolving
	$effect(() => {
		characterPromise.then((character) => {
			deck = character.deck ?? fallbackDeck;
			// Notify user
			toast.success(`Loaded character: ${character.name}`);
		});
	});

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('edit') == '1' || isNewCharacter) {
			isEditing = true;
		}
	});

	// FUNCTIONS
	// API shorthands with UI feedback
	function deleteCharacter(character: PrismaCharacter) {
		if (confirm('Are you sure you want to delete this character?')) {
			spinner.set('delete', 'Deleting...');
			CHARACTER_API.delete(character)
				.then(() => {
					toast.success('Character deleted');
					window.location.href = '/character';
				})
				.catch((error) => {
					toast.error(`Error deleting character: ${error}`);
				})
				.finally(() => {
					setTimeout(() => {
						spinner.complete();
					}, 500);
				});
		}
	}

	function createCharacter(character: PrismaCharacter) {
		spinner.set('create', 'Creating...');
		CHARACTER_API.create(character)
			.then(() => {
				toast.success('Character created');
				goto(`/character/${character.id}`);
			})
			.catch((error) => {
				toast.error(`Error creating character: ${error}`);
			})
			.finally(() => {
				setTimeout(() => {
					spinner.complete();
				}, 500);
			});
	}

	function saveCharacter(character: PrismaCharacter) {
		spinner.set('save', 'Saving...');
		CHARACTER_API.update(character)
			.then(() => {
				toast.success('Character updated');
			})
			.catch((error) => {
				toast.error(`Error updating character: ${error}`);
			})
			.finally(() => {
				setTimeout(() => {
					spinner.complete();
					invalidateAll();
				}, 500);
			});
	}
</script>

{#await characterPromise}
	<main class="content grid columns-1 place-items-center">
		<p class="mb-4 text-2xl">Loading character...</p>
		<code>ID: {characterID}</code>
		<Spinner class="size-36" variant="Knight" />
	</main>
{:then character}
	{#if isEditing}
		<main class="content">
			<!-- CHARACTER EDITING -->
			<img src={character.imageUrl} alt={character.name} />
			<div class="mt-4 grid grid-cols-[max-content_1fr] gap-2">
				<Label for="name">Name</Label>
				<Input id="name" bind:value={character.name} />
				<Label for="subtitle">Subtitle</Label>
				<Input id="subtitle" bind:value={character.subtitle} />
				<Label for="description">Description</Label>
				<Textarea id="description" rows={3} bind:value={character.description} />
				<Label for="image">Image</Label>
				<Input id="image" bind:value={character.imageUrl} />
			</div>
			<div class="flex flex-row">
				{#if isNewCharacter}
					<Button
						variant="success"
						spinner={{ id: 'create' }}
						onclick={() => createCharacter(character.toPrisma())}
					>
						<Icon icon="mdi:sparkles" />Create
					</Button>
				{:else}
					<Button
						variant="success"
						spinner={{ id: 'save' }}
						onclick={() => saveCharacter(character.toPrisma())}
					>
						<Icon icon="mdi:floppy" />Save
					</Button>
					<Button
						variant="destructive"
						spinner={{ id: 'delete' }}
						onclick={() => deleteCharacter(character.toPrisma())}
					>
						<Icon icon="mdi:delete" />Delete
					</Button>
				{/if}
			</div>
		</main>
	{:else}
		<!-- PLAYDECK -->
		{#if deck}
			<!-- Ensure deck is loaded -->
			<Deck {character} bind:deck config={deckConfig} />
		{:else}{/if}
	{/if}
{:catch error}<main class="content flex flex-col">
		<h1 class="mb-4 text-2xl font-semibold">Error loading character</h1>
		<p>{error}</p>
		<Button class="mx-auto mt-4" variant="destructive" href="/character"
			><Icon icon="mdi:arrow-left" />Back to Character overview</Button
		>
	</main>
{/await}
