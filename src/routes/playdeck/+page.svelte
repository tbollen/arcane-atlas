<script lang="ts">
	// Types
	import { type User as PrismaUser } from '@prisma/client';

	// Import UI components
	import { Header } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import Icon from '@iconify/svelte';
	import CharacterCard from '$lib/components/partials/character/CharacterCard.svelte';

	// Import Dialogs
	import AddWidgetDialog from './AddWidgetDialog.svelte';

	// Import classes
	import {
		StoredCharacter,
		type PrismaCharacterExtended
	} from '$lib/domain/characters/character.svelte.js';

	// DECK stuff
	import Deck from '$lib/components/playdeck/Deck.svelte';
	import {
		type StoredDeck,
		checkDeckValidity,
		fallbackDeck,
		getWidget,
		widgetIDs
	} from '$lib/components/playdeck';
	//@ts-ignore
	import gridHelp from 'svelte-grid/build/helper/index.mjs';

	// Utils
	import { lsk } from '$lib/utils/storage/keys.js';
	import { onMount } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { AR_KEY, GENERIC_KEY } from '$lib/gameSystems/index.js';
	import { spinner } from '$lib/stores/loadingSpinner.svelte.js';

	// API
	import CHARACTER_API from '$lib/utils/api/characters_api.js';
	import { defaultDeckConfig, type DeckConfig } from '$lib/components/playdeck/deckConfig';

	// Init character
	let { data } = $props();
	const dataCharactersAsStored = data.characters.map((character) =>
		StoredCharacter.fromPrisma({ character, user: data.user as PrismaUser })
	);

	// Init characters
	let character: StoredCharacter | undefined = $state();
	let activeCharacter: PrismaCharacterExtended | undefined = $state(undefined);

	// Init deck
	let DeckComponent: Deck;
	let deck: StoredDeck = $state(fallbackDeck);

	// Deck config
	const deckConfig: DeckConfig = defaultDeckConfig;

	// EDIT MODES
	type EditMode = 'view' | 'editItems' | 'editDeck';
	function toggleEditMode(mode: EditMode = 'view') {
		editDeck = mode === 'editDeck';
		editItems = mode === 'editItems';
		// Also set edit mode in component
		DeckComponent.toggleEditMode(mode);
	}
	let editDeck: boolean = $state(false);
	let editItems: boolean = $state(false);

	//////////////////////////
	// DECK FUNCTIONS

	function unsetActiveCharacter() {
		localStorage.removeItem(lsk.activeCharacter);
		character = undefined;
	}

	function setActiveCharacter(_character: StoredCharacter) {
		localStorage.setItem(lsk.activeCharacter, _character.id);
		character = _character;
		deck = character?.deck ?? fallbackDeck;
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
			// Find the targeted character (activeCharacter)
			const activeCharacterID = localStorage.getItem(lsk.activeCharacter);
			activeCharacter = data.characters.find((char) => char.id === activeCharacterID);
			if (activeCharacter) {
				character = dataCharactersAsStored.find((char) => char.id === activeCharacterID);
				deck = character?.deck ?? fallbackDeck;
			}
		}
	});
</script>

<!-- RENDERING -->
<main>
	{#if !data?.characters || dataCharactersAsStored.length === 0}
		<div class="flex w-full flex-col items-center justify-center gap-4 py-12">
			<Header variant="h2">No characters found</Header>
			<p class="w-lg text-muted-foreground">
				It seems you have no characters linked to your account. You can create a new character to
				start setting up a playdeck!
			</p>
			<Button href="/character/new" size="lg" variant="destructive"
				><Icon icon="mdi:plus" />Create your first Character</Button
			>
		</div>
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
		<Deck bind:this={DeckComponent} {character} bind:deck config={deckConfig} />
	{/if}
</main>
