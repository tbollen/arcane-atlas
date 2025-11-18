<script lang="ts">
	// Types
	import { type Character as PrismaCharacter, type User as PrismaUser } from '@prisma/client';

	// Import UI components
	import { Header } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import Icon from '@iconify/svelte';
	import CharacterCard from '$lib/components/partials/character/CharacterCard.svelte';

	// Import Dialogs
	import AddWidgetDialog from './AddWidgetDialog.svelte';

	// Import classes
	import { StoredCharacter } from '$lib/domain/characters/character.svelte.js';

	// DECK stuff
	import Deck from '$lib/components/playdeck/Deck.svelte';
	import { type DeckConfig, type ValidDeckComponent } from '$lib/components/playdeck';

	// Utils
	import { lsk } from '$lib/utils/storage/keys.js';
	import { getContext, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { AR_KEY, GENERIC_KEY } from '$lib/gameSystems/index.js';
	import { spinner } from '$lib/stores/loadingSpinner.svelte.js';

	// API
	import CHARACTER_API from '$lib/utils/api/characters_api.js';

	// Init character
	let { data } = $props();
	const dataCharactersAsStored = data.characters.map((character) =>
		StoredCharacter.fromPrisma({ character, user: data.user as PrismaUser })
	);

	// Functions
	function setActiveCharacterFromID(id: string | null): StoredCharacter | undefined {
		const foundCharacter = dataCharactersAsStored.find((c) => c.id === id);
		if (!foundCharacter) {
			toast.error('No character found with ID ' + id);
			return undefined;
		}
		return foundCharacter;
	}

	// Init characters
	let character: StoredCharacter | undefined = $state();

	// Init deck
	let deck: DeckConfig = $state([]);

	// EDIT MODE
	let edit = $state(false);
	function toggleEdit() {
		edit = !edit;
	}

	// Dialog vars
	let addWidgetDialog: boolean = $state(false);
	let selectedWidgets: ValidDeckComponent[] = $state([]);

	//////////////////////////
	// DECK FUNCTIONS

	// Save changes to the deck
	function saveDeck() {
		if (!character) return console.error('No character selected');
		if (!deck) return console.error('No deck found');
		if (typeof window === 'undefined' || !window.localStorage)
			return console.error('Localstorage not ready');

		const deckJSON = JSON.stringify(deck);
		localStorage.setItem(lsk.deck, deckJSON);
		console.log('Deck saved to localstorage', deckJSON);
	}

	function unsetActiveCharacter() {
		alert('TODO: Unset active character');
	}

	function setActiveCharacter(character: StoredCharacter) {
		alert(`TODO: Set active character to ${character.name}`);
	}

	function addWidgets(widgets: ValidDeckComponent[]) {
		deck = [...deck, ...widgets];
	}

	function removeWidgets(indexes: number[]) {
		const newDeck = deck.filter((_, i) => !indexes.includes(i));
		console.log('New deck', newDeck);
	}

	//////////////////
	// Mount

	onMount(() => {
		// REDIRECTS
		if (!data.user) {
			toast.info('Please log in to access your playdeck');
			goto('/login');
		} else {
			// DO MOUNT
			character = getActiveCharacterFromLS() ?? character;
			deck = getDeckFromLS();
		}
	});

	// MOUNTING FUNCTIONS
	function getActiveCharacterFromLS(): StoredCharacter | undefined {
		if (typeof window === 'undefined' || !window.localStorage) return undefined;
		const activeCharacterID = localStorage.getItem(lsk.activeCharacter);
		return setActiveCharacterFromID(activeCharacterID);
	}

	function getDeckFromLS(): DeckConfig {
		if (typeof window === 'undefined' || !window.localStorage) return [];
		const deck = localStorage.getItem(lsk.deck);
		return deck ? JSON.parse(deck) : [];
	}
</script>

<main>
	{#if !data?.characters || dataCharactersAsStored.length === 0}
		<p>No characters found</p>
	{:else if !character}
		<Header variant="h2">Select Character</Header>
		{#each dataCharactersAsStored as character}
			<button
				class="cursor-pointer rounded-md hover:outline-2 hover:outline-blossom-500"
				onclick={() => {
					setActiveCharacter(character);
				}}
			>
				<CharacterCard {character} />
			</button>
		{/each}
	{:else}
		<div id="Actions" class="my-4 flex flex-row items-center gap-2">
			<Header variant="h2" class="mr-4">{character.name}</Header>
			{#if edit}
				<Button onclick={toggleEdit} variant="secondary"><Icon icon="mdi:eye" />View</Button>
				<Button onclick={saveDeck} variant="success" spinner={{ id: 'save' }}
					><Icon icon="mdi:floppy" />Save</Button
				>
				<Button onclick={() => (addWidgetDialog = true)} variant="success"
					><Icon icon="mdi:plus" />Add Widget</Button
				>
			{:else}
				<Button onclick={toggleEdit} variant="advanced"><Icon icon="mdi:pencil" />Edit</Button>
			{/if}
			<Button onclick={unsetActiveCharacter} variant="destructive"
				>Select different character</Button
			>
			<AddWidgetDialog
				onAdd={(widgets) => {
					addWidgets(widgets);
				}}
				{character}
				bind:open={addWidgetDialog}
			/>
		</div>
		{#if deck.length !== 0}
			<Deck {character} bind:edit {deck} />
		{:else}
			TODO
		{/if}
	{/if}
</main>
