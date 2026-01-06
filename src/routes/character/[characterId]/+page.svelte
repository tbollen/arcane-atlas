<script lang="ts">
	// Class and type imports
	import {
		CharacterStore,
		StoredCharacter,
		type PrismaCharacterExtended
	} from '$lib/domain/characters/character.svelte.js';
	import { StoredCard } from '$lib/domain/cards/cardStore.svelte.js';
	import { gameSystems } from '$lib/gameSystems';

	// Stores
	import { activeCharacter as activeCharacterStore } from '$lib/stores/activeCharacter.svelte.js';

	// Utils
	import type { UserID, CharacterID } from '$lib/domain/';
	import { toast } from 'svelte-sonner';
	import type { User as PrismaUser, Character as PrismaCharacter } from '@prisma/client';
	import { spinner } from '$lib/stores/loadingSpinner.svelte.js';
	import { characterEditComponentDict } from '$lib/components/partials/character/edit';

	// API
	import CHARACTER_API from '$lib/utils/api/characters_api';

	// UI Components
	import Icon from '@iconify/svelte';
	import { Spinner } from '$lib/components/ui/spinner/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as ButtonGroup from '$lib/components/ui/button-group';
	import { Header } from '$lib/components/typography';

	// Deck imports
	import Deck from '$lib/components/playdeck/Deck.svelte';
	import { fallbackDeck, type StoredDeck } from '$lib/components/playdeck';
	import {
		defaultDeckConfig,
		type DeckConfig
	} from '$lib/components/playdeck/modules/deckConfig.js';
	import EditDialog from './EditDialog.svelte';
	import AddWidgetDialog from '$lib/components/playdeck/components/AddWidgetDialog.svelte';

	// Svelte
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import CharacterEditAccordion from '$lib/components/partials/character/edit/CharacterEditAccordion.svelte';

	// Page init
	const characterID = page.params.characterId;
	let isNewCharacter: boolean = $derived(characterID == 'new');
	// svelte-ignore state_referenced_locally
	let isEditing: boolean = $state(isNewCharacter);

	// Edit mode type - specific modes with autocomplete, but allows any string
	type EditMode = 'play' | 'content' | 'layout' | (string & {});

	///////////////////////////////////////
	// Active character
	let characterIsResolved: boolean = $state(false);
	let activeCharacter = $derived(activeCharacterStore.activeCharacter);
	$effect(() => {
		// If the active character changes, and it's not the current character, redirect to that character's page
		if (window && characterIsResolved && activeCharacter && activeCharacter.id !== characterID) {
			if (characterID === 'new' && isNewCharacter) return; // Don't redirect if creating new character
			// Ask for confirmation before redirecting
			const confirm = window.confirm(
				'The active character has changed. Do you want to switch to the new character?'
			);
			if (confirm) {
				window.location.href = `/character/${activeCharacter.id}${isEditing ? '?edit=1' : ''}`;
			}
		}
	});

	///////////////////////////////////////

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

	// Edit Modes
	const editModes = [
		{
			name: 'Play',
			value: 'play',
			icon: 'mdi:play'
		},
		{
			name: 'Content',
			value: 'content',
			icon: 'mdi:content-copy'
		},
		{
			name: 'Layout',
			value: 'layout',
			icon: 'mdi:view-dashboard'
		},
		{
			name: 'Edit',
			value: 'edit',
			icon: 'mdi:pencil'
		}
	];
	let editMode: EditMode = $state(editModes[0].value);

	function setEditMode(mode: EditMode) {
		const foundMode = editModes.find((m) => m.value === mode)?.value;
		// Set mode or default to first mode
		editMode = foundMode ?? editModes[0].value;
		// Update url params
		const url = new URL(window.location.href);
		url.searchParams.set('mode', editMode);
		window.history.replaceState({}, '', url.toString());
	}

	// Dialog state
	let addWidgetDialog: boolean = $state(false);
	let editLayoutDialog: boolean = $state(false);
	let editDialog: {
		componentID: string;
		editableProperties: string[];
		open: boolean;
	} = $state({
		componentID: '',
		editableProperties: [],
		open: false
	});

	// Unsaved tracking
	let unsaved: boolean = $state(false);
	let deckRef: Deck | undefined = $state();
	let currentLayout: DeckConfig['layouts'][number] | undefined = $state();

	// Edit Accordion stuff
	let openAccordionItems: string[] = $state([]);
	let listedAccordionItems: typeof characterEditComponentDict = $state({});

	// Character promise resolving
	$effect(() => {
		characterPromise.then((character) => {
			deck = character.deck ?? fallbackDeck;
			// Notify user
			toast.success(`Loaded character: ${character.name}`);

			// Set active character store
			activeCharacterStore.set(character);
			characterIsResolved = true;
		});
	});

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('edit') == '1' || isNewCharacter) {
			isEditing = true;
		}
		// Get edit mode from params
		setEditMode(urlParams.get('mode') ?? 'play');
	});

	beforeNavigate((navigation) => {
		// Warn if unsaved changes
		if (unsaved) {
			const confirmLeave = confirm(
				'You have unsaved changes in your deck. Do you want to leave without saving?'
			);
			if (!confirmLeave) {
				navigation.cancel();
			}
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

	async function handleSaveDeck(character: StoredCharacter) {
		if (!character) {
			console.error('No character selected');
			toast.error("Can't save deck: No character selected");
			throw new Error('No character selected');
		}
		if (!deck) {
			console.error('No deck found');
			toast.error("Can't save deck: No deck found");
			throw new Error('No deck found');
		}

		// Start saving
		spinner.set('save', 'Saving...');

		// Update character's deck
		character.deck = deck;

		// Convert to PrismaCharacter
		const prismaCharacter = character.toPrisma();

		// Create or update based on whether it's a new character
		if (isNewCharacter) {
			createCharacter(prismaCharacter);
		} else {
			saveCharacter(prismaCharacter);
		}
	}
</script>

{#await characterPromise}
	<main class="content grid columns-1 place-items-center">
		<p class="mb-4 text-2xl">Loading character...</p>
		<code>ID: {characterID}</code>
		<Spinner class="size-36" variant="Knight" />
	</main>
{:then character}
	<!-- TOP BAR / EDIT BAR -->
	<div id="Actions" class="mx-4 my-4 flex flex-row items-center gap-8">
		<div class="flex flex-col">
			<Header tag="h2" variant="h3">{character.name}'s Deck</Header>
			<Button
				size="xs"
				class="inline-block w-max"
				variant="ghost"
				onclick={() => (editLayoutDialog = true)}
			>
				{#if currentLayout}
					{currentLayout.name} ({currentLayout.columns})
				{:else}
					Layout
				{/if}
			</Button>
		</div>

		<!-- Mode Toggle Buttons -->
		<ButtonGroup.Root>
			{#each editModes as mode}
				<Button
					variant={editMode === mode.value ? 'bold' : 'ghost'}
					onclick={() => setEditMode(mode.value)}
				>
					<Icon icon={mode.icon} />
					{mode.name}
				</Button>
			{/each}
		</ButtonGroup.Root>

		<!-- Context Actions -->
		<div
			id="contextActions"
			class="ml-auto flex flex-grow flex-wrap items-center justify-end gap-2"
		>
			{#if editMode === 'content' || editMode === 'layout'}
				<Button
					size="sm"
					onclick={() => (addWidgetDialog = true)}
					variant="bold"
					tooltip="Add a new widget to the deck"
				>
					<Icon icon="mdi:plus" />
					Add Widget
				</Button>
			{/if}

			<!-- Save/Create Button -->
			{#if isNewCharacter || editMode !== 'play' || unsaved}
				<Button
					size="sm"
					onclick={() => handleSaveDeck(character)}
					disabled={!isNewCharacter && !unsaved}
					variant="blossom"
					spinner={{ id: 'save' }}
				>
					{#if isNewCharacter}
						<Icon icon="mdi:plus-circle" />
						Create
					{:else if unsaved}
						<Icon icon="mdi:floppy" />
						Save
					{:else}
						<Icon icon="mdi:check" />
						Saved
					{/if}
				</Button>
			{/if}
		</div>
	</div>

	{#snippet accordion()}
		<CharacterEditAccordion
			{character}
			cards={userCards}
			showHeaders={true}
			autoOpenItems={true}
			bind:openItems={openAccordionItems}
			bind:listedItems={listedAccordionItems}
		/>
	{/snippet}

	<!-- PLAYDECK -->
	{#if isNewCharacter || editMode === 'edit'}
		<div id="editCharacterGrid" class="mx-auto grid max-w-[1200px] grid-cols-[auto_1fr] px-2">
			<div id="editBreadcrumbs" class="mr-4 flex flex-col border-r-1 border-threat-500 pr-4 pl-2">
				{#each Object.entries(listedAccordionItems) as [systemKey, propertyComponents]}
					<Header tag="h3" variant="h4" class="mt-4 mb-2">
						{gameSystems[systemKey as keyof typeof gameSystems].name}
					</Header>
					{#each Object.entries(propertyComponents) as [propertyKey, content]}
						<Button
							size="sm"
							variant={openAccordionItems.includes(`${systemKey}:${propertyKey}`)
								? 'bold'
								: 'ghost'}
							class="justify-start"
							onclick={() => {
								const itemId = `${systemKey}:${propertyKey}`;
								if (openAccordionItems.includes(itemId)) {
									openAccordionItems = openAccordionItems.filter((id) => id !== itemId);
								} else {
									openAccordionItems = [...openAccordionItems, itemId];
									setTimeout(() => {
										const element = document.getElementById(itemId);
										if (element) {
											element.scrollIntoView({ behavior: 'smooth', block: 'start' });
											toast.info(`Navigated to ${content.name}`);
										}
									}, 200); // Wait for accordion animation
								}
							}}
						>
							{content.name}
						</Button>
					{/each}
				{/each}
			</div>
			{@render accordion()}
		</div>
	{:else if deck}
		<!-- Ensure deck is loaded -->
		<Deck
			bind:this={deckRef}
			{character}
			bind:deck
			config={deckConfig}
			cards={userCards}
			{editMode}
			bind:unsaved
			bind:editDialog
			bind:currentLayout
		/>
	{:else}
		Can't load deck...
	{/if}

	<!-- DIALOGS -->
	<AddWidgetDialog
		onAdd={(widgets) => {
			if (deckRef) deckRef.addToDeck(widgets);
		}}
		{character}
		bind:open={addWidgetDialog}
	/>
	<EditDialog
		bind:open={editDialog.open}
		cards={userCards}
		componentID={editDialog.componentID}
		{character}
	/>
{:catch error}<main class="content flex flex-col">
		<h1 class="mb-4 text-2xl font-semibold">Error loading character</h1>
		<p>{error}</p>
		<Button class="mx-auto mt-4" variant="destructive" href="/character"
			><Icon icon="mdi:arrow-left" />Back to Character overview</Button
		>
	</main>
{/await}
