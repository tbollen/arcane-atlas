<script lang="ts">
	// Svelte stuff
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	// Utils
	import { serializeCard } from '$lib/core/cards/cardStore.svelte';

	// API
	import CARD_API from '$lib/utils/api/cards_api.js';
	import USER_API from '$lib/utils/api/users_api.js';

	// Item stores, types and modules
	// import { cardStore } from '$lib/stores/CardStore';
	import { CardStore } from '$lib/core/cards/cardStore.svelte';
	import { StoredCard, CARD_CONTEXT_KEY } from '$lib/core/cards/cardStore.svelte';

	// Components and Partials
	import MainLoader from '$lib/partials/MainLoader.svelte';
	import Gamecard from '$lib/components/Gamecard.svelte';
	import GamecardBack from '$lib/components/GamecardBack.svelte';
	import ItemEditor from '$lib/partials/ItemEditor.svelte';
	// import Button from '$lib/components/coreComponents/Button.svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	// Page params
	const slug_id = page.params.slug;
	let isNewCard = $derived(slug_id === 'new');

	const { data } = $props();

	/////////////////////////
	// DATA INITIALIZATION //
	/////////////////////////
	import { getContext } from 'svelte';
	const cardStore = getContext<CardStore>(CARD_CONTEXT_KEY);

	// Data getting (card and cardstore)
	// Initialize item on page load, use a dummy item for init only!!
	let card: StoredCard = $state<StoredCard>(new StoredCard('new'));

	let creatorName = $state('Unknown');

	/////////////////////////
	// SAVE STATE TRACKING //
	/////////////////////////

	// Check if card is saved
	let cardIsSaved: boolean = $state(false);
	let isMounted: boolean = false;
	// });

	$effect(() => {
		serializeCard(card);
		if (!isMounted) return; // Wait for mount
		cardIsSaved = false;
	});

	// Retrieve and overwrite the dummy item with the real item on page load
	onMount(() => {
		// Retrieve Item
		try {
			if (!slug_id) throw new Error('No slug id found');
			// If the slug_id is 'new', get the active item or redirect to collection page if none found
			if (slug_id === 'new') {
				console.debug('Creating new card...');
				// TODO: create "new card" method
			} else {
				const retrievedCard = cardStore.getCard(slug_id); // Get card, may throw error
				if (!retrievedCard) throw new Error(`No card found with id: ${slug_id}`);
				console.debug('Retrieving card...', retrievedCard);
				// Get item from store
				card = retrievedCard;
				cardIsSaved = true;
			}
		} catch (err) {
			// Redirect to collection page when item not found
			alert(`${err} > Redirecting to collection page...`);
			goto('/cards');
		}

		// Update username
		if (card?.creatorId) {
			const response = USER_API.getByID(card.creatorId as string);
			response.then((res) => {
				creatorName = res.user.name;
			});
		} else {
			creatorName = data.user?.name || 'ERROR';
		}

		// Retrieve URL params for edit mode
		const urlParams = new URLSearchParams(window.location.search);
		urlParams.get('edit') === '1' ? (editMode = true) : (editMode = false);

		// Set mounted to true (timeout to avoid race condition)
		setTimeout(() => {
			cardIsSaved = slug_id !== 'new';
			isMounted = true;
		}, 50);
	});

	////////////////////////////////////////////
	// FUNCTIONS FOR EDITING AND PAGE ACTIONS //
	////////////////////////////////////////////

	function newEmptyItem() {
		const saveFirst = window.confirm('Do you want to save before creating a New Card?');
		if (saveFirst) {
			// TODO: add save method and push to DB
			cardStore.cache();
		}
		cardStore.addNew();
	}

	// Edit Mode stuff
	let editMode = $state(false);
	function toggleEditMode() {
		editMode = !editMode;
		updateUrlParams();
	}

	function updateUrlParams() {
		const url = new URL(window.location.href);
		if (editMode) {
			url.searchParams.set('edit', '1');
		} else {
			url.searchParams.delete('edit');
		}
		window.history.replaceState({}, '', url.toString());
	}

	// Advanced mode toggle
	import { advancedMode } from '$lib/stores/advancedMode';
	function toggleAdvancedMode() {
		$advancedMode = !$advancedMode;
	}

	// Printing the card (redirect to print page with only this card selected)
	import { selectedItems } from '$lib/stores/selectedItems';
	async function printCards() {
		const _cardId = card.id;
		saveHandler();
		selectedItems.set(new Set([_cardId]));
		goto(`${base}/print`);
	}

	// Download the current item as JSON
	function downloadItem() {
		// TODO: add download method
	}

	// Save item function
	async function saveHandler(preventRedirect = false) {
		const idsInCardStore = cardStore.cards.map((card) => card.id);
		let response;
		// Create new item if new
		if (isNewCard) {
			console.debug('Saving new item...');
			card = cardStore.addNew(card); // Add new item to store
			// API CALL
			response = await CARD_API.create(card.cardToPrisma());
		} else {
			console.debug('Saving existing item...');
			cardStore.setCard(card.id, card);
			// API CALL
			response = await CARD_API.update(card.cardToPrisma());
		}
		cardStore.save();
		// LOG API RESPONSE
		console.log(response);
		cardIsSaved = true;

		// If it was a new item, redirect to the new item's page
		if (slug_id === 'new') {
			goto(`/cards/${card.id}?edit=1`);
		}
	}

	// Preventing navigating away when the card is not saved
	import { beforeNavigate } from '$app/navigation';
	beforeNavigate((nav) => {
		if (!cardIsSaved) {
			const confirmLeave = confirm('Are you sure you want to leave? You have unsaved changes.');
			if (!confirmLeave) nav.cancel();
		}
	});

	function preventNavigationWhenUnsaved(event: BeforeUnloadEvent) {
		// Prevent closing if card is not saved (with dialog)
		if (!cardIsSaved) {
			event.preventDefault();
			// Old Chrome browsers requires returnValue to be set
			event.returnValue = '';
		}
	}
</script>

<!-- Svelte Window -->
<svelte:window onbeforeunload={preventNavigationWhenUnsaved} />
{#await card}
	<MainLoader />
{:then}
	<main id="main" class:viewMode={!editMode}>
		<!-- Editor Pane -->
		{#if editMode}
			<section id="editor">
				<div class="displayText editorTitle bg-primary text-secondary">Card Editor</div>
				<header id="editorHeader" class="bg-secondary">
					<div id="cardInfo" class="editorRow">
						<div class="cardInfoBlock">
							<div id="cardName" class="infoBlockMajor">
								{card.name}
							</div>
							<div id="cardId" class="infoBlockMinor">
								id: {card.id}
							</div>
						</div>

						<div class="cardInfoBlock">
							<div id="cardCreator" class="infoBlockMajor">
								<span class="mr-1 text-sm text-muted-foreground">by</span>{creatorName}
							</div>
							<div
								id="cardDate"
								title={new Date(card.createdAt).toLocaleTimeString()}
								class="infoBlockMinor"
							>
								{new Date(card.createdAt).toLocaleDateString()}
							</div>
						</div>
					</div>
					<!-- Buttons and Toolbar -->
					<div id="toolbar" class="editorRow">
						<!-- Advanced -->
						<Button
							onclick={toggleAdvancedMode}
							variant={$advancedMode ? 'advanced' : 'default'}
							color="weave"
							size="sm"
						>
							<Icon icon="memory:anvil" />Advanced
						</Button>
						<!-- Download -->
						<Button onclick={downloadItem} variant="outline" size="sm"
							><Icon icon="memory:download" />Download</Button
						>
						<!-- Print -->
						<Button onclick={printCards} size="sm" variant="outline"
							><Icon icon="mdi:printer" />Print Card</Button
						>

						<!-- Save -->
						<Button
							onclick={() => saveHandler()}
							disabled={cardIsSaved}
							color={cardIsSaved ? 'success' : 'blossom'}
							variant="success"
							size="sm"
							class="ml-auto"
							><Icon icon={cardIsSaved ? 'mdi:check' : 'memory:floppy-disk'} />{cardIsSaved
								? 'Saved'
								: 'Save'}</Button
						>
					</div>
				</header>
				<div id="itemEditor">
					<ItemEditor bind:card />
				</div>
			</section>
		{/if}
		<!-- Card Pane -->
		<section id="cardView">
			<div class="buttonRow">
				<!-- Back to Collection -->
				<Button
					variant="link"
					disabled={!cardIsSaved}
					onclick={() => goto(`${base}/collection`)}
					title={!cardIsSaved ? 'Please save the card before leaving' : 'Back to Collection'}
					><Icon icon="mdi:arrow-left" />Back</Button
				>
				<!-- Toggle Edit/View Mode -->
				<Button onclick={toggleEditMode}
					><Icon icon={editMode ? 'mdi:eye' : 'mdi:pencil'} />{editMode
						? 'Viewing Mode'
						: 'Edit Card'}</Button
				>

				<!-- New Card -->
				{#if !isNewCard}
					<Button onclick={newEmptyItem}><Icon icon="mdi:plus" />New Card</Button>
				{/if}

				<a class="mobileOnly" href="#editor">Go to editor</a>
			</div>
			<div id="cardArea">
				<Gamecard {card} />
				<GamecardBack {card} />
			</div>
		</section>
	</main>
{/await}

<!-- Styles -->
<style lang="postcss">
	:global(body) {
		margin: 0;
	}
	#main {
		display: grid;
		/* Section with scroll */
		height: calc(100dvh - var(--navbar-height, 3rem));
		overflow-y: hidden;
		grid-template-areas: 'cardView editor';
		grid-template-columns: fit-content max(2fr, fit-content);
	}

	#main.viewMode {
		grid-template-areas: 'cardView';
		grid-template-columns: 1fr;
	}

	/* Changed layout for mobile */
	.mobileOnly {
		display: none;
	}

	@media screen and (max-width: 750px) {
		#main {
			grid-template-areas: 'cardView' 'editor';
			grid-template-rows: min-content min-content;
			grid-template-columns: 1fr;
			height: fit-content;
		}

		.mobileOnly {
			display: initial;
		}
	}

	section {
		padding: var(--padding);
		/* Size and scroll */
		overflow-y: auto;
	}

	section#header {
		grid-area: header;
	}

	section#editor {
		grid-area: editor;
		/* Styling */
		border-left: solid 1px var(--color-obsidian-2);
		/* Layout */
		display: flex;
		flex-direction: column;
		/* Size */
		min-width: 20em;
		box-sizing: border-box;
		/* Scrollbar */
		overflow-y: scroll;
		scroll-behavior: auto;
		padding: 0;
	}

	section#editor > #editorFooter {
		margin-top: auto;
		padding-top: var(--padding);
		border-top: solid 1px black;
	}

	section#cardView {
		/* Position */
		margin: 0 auto;
		width: 100%;
	}

	div#cardArea {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		/* Gap */
		gap: 5mm;
		padding: 5mm;
	}

	.buttonRow {
		display: flex;
		flex-wrap: wrap;
		gap: var(--padding);
	}

	.editorTitle {
		text-align: center;
		font-size: 2em;
	}

	/* Editor Header */

	header#editorHeader {
		/* Placement */
		position: sticky;
		top: 0;
		/* layout */
		display: flex;
		flex-direction: column;
		gap: 0.2em;
		padding: var(--padding);
		/* Style */
		border-bottom: solid 1px var(--color-obsidian-2);
	}

	/* Toolbar */
	#toolbar {
		display: flex;
		gap: 0.3em;
		justify-content: start;
	}

	#itemEditor {
		padding: var(--padding);
	}

	/* Card Info */
	#cardInfo {
		display: flex;
		gap: 0.5em;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
	}

	.cardInfoBlock {
		display: flex;
		flex-direction: column;
		gap: 0;
		font-size: 0.8rem;
		text-align: center;
	}

	.cardInfoBlock:first-child {
		text-align: left;
	}

	.cardInfoBlock:last-child {
		text-align: right;
	}

	.infoBlockMinor {
		color: var(--color-text-2);
	}

	.infoBlockMajor {
		font-weight: 500;
		font-size: 1rem;
	}
</style>
