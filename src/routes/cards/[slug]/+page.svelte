<script lang="ts">
	// Svelte stuff
	import { page } from '$app/state';
	import { onMount, setContext } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	// Utils
	import { serializeCard } from '$lib/domain/cards/cardStore.svelte';

	// Spinner
	import { spinner } from '$lib/stores/loadingSpinner.svelte';

	// Toaster
	import { toast } from 'svelte-sonner';

	// API
	import CARD_API from '$lib/utils/api/cards_api.js';
	import USER_API from '$lib/utils/api/users_api.js';

	// Card stores, types and modules
	import cachedTemplate from '$lib/stores/cachedTemplate.js';
	import { CardStore } from '$lib/domain/cards/cardStore.svelte';
	import { StoredCard, CARD_CONTEXT_KEY } from '$lib/domain/cards/cardStore.svelte';

	// User info and types
	import type { UserID } from '$lib/domain/users/user';

	// Components and Partials
	import MainLoader from '$lib/components/partials/MainLoader.svelte';
	import Gamecard from '$lib/components/partials/gamecards/Gamecard.svelte';
	import GamecardBack from '$lib/components/partials/gamecards/GamecardBack.svelte';
	import CardEditor from './CardEditor.svelte';
	// import Button from '$lib/components/coreComponents/Button.svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	// Page params
	const slug_id = page.params.slug;
	let isNewCard = $derived(slug_id === 'new');

	let { data } = $props();
	const userId: UserID = data.user?.id as UserID;

	/////////////////////////
	// DATA INITIALIZATION //
	/////////////////////////
	import { getContext } from 'svelte';
	const cardStore = getContext<CardStore>(CARD_CONTEXT_KEY);

	// Data getting (card and cardstore)
	// Initialize card on page load, use a dummy card ('new') for init only!!
	let card: StoredCard = $state<StoredCard>(StoredCard.newCard(userId));
	let ownerName = $state(data.ownerName);
	let canEdit = $state(false);
	let isOwner = $state(false);

	/////////////////////////
	// SAVE STATE TRACKING //
	/////////////////////////

	// Check if card is saved
	let cardIsSaved: boolean = $state(false);
	let isMounted: boolean = false;
	// });

	$effect(() => {
		serializeCard(card); // Serialize card as trigger
		if (!isMounted) return; // Wait for mount
		cardIsSaved = false;
	});

	// Retrieve and overwrite the dummy card with the real card on page load
	onMount(() => {
		// Retrieve card
		try {
			if (!slug_id) throw new Error('No slug id found');
			// If the slug_id is 'new', get the active card or redirect to collection page if none found
			if (slug_id === 'new') {
				console.debug('Creating new card...');
				if (cachedTemplate.template) {
					card = StoredCard.newCard(userId, cachedTemplate.template); // Create new card using the cached template
					cachedTemplate.template = undefined; //Reset to undefined
				}
			} else {
				const retrievedCard = cardStore.getCard(slug_id); // Get card, may throw error
				if (!retrievedCard) throw new Error(`No card found with id: ${slug_id}`);
				console.debug('Retrieving card...', retrievedCard);
				// Get card from store
				card = retrievedCard;
				cardIsSaved = true;
			}
		} catch (err) {
			// Redirect to collection page when card not found
			alert(`${err} > Redirecting to collection page...`);
			goto('/cards');
		}

		// Set canEdit based on card owner, or logged in user (TODO: check with db instead of client permission)
		canEdit = card.ownerId === userId || card.clientPermission.canEdit;
		// Set isOwner based on card owner
		isOwner = card.ownerId === userId;

		// Retrieve URL params for edit mode
		const urlParams = new URLSearchParams(window.location.search);
		//Set edit mode based on URL params, only set to true if canEdit is true
		editMode = urlParams.get('edit') === '1' && canEdit;

		// Set mounted to true (timeout to avoid race condition)
		setTimeout(() => {
			cardIsSaved = slug_id !== 'new';
			isMounted = true;
		}, 50);
	});

	////////////////////////////////////////////
	// FUNCTIONS FOR EDITING AND PAGE ACTIONS //
	////////////////////////////////////////////

	function newEmptyCard() {
		const saveFirst = window.confirm('Do you want to save before creating a New Card?');
		if (saveFirst) {
			// TODO: add save method and push to DB
			cardStore.cache();
		}
		cardStore.addNew({ userId });
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
	import { selectedCardIds } from '$lib/stores/selectedCardIds.js';
	async function printCards() {
		const _cardId = card.id;
		saveHandler();
		selectedCardIds.set(new Set([_cardId]));
		goto(`${base}/cards/print`);
	}

	// Download the current card as JSON
	import { downloadCards } from '$lib/utils/cards/download.js';
	function downloadCard() {
		downloadCards([card]);
	}

	// Save card function
	async function saveHandler() {
		// Set spinner
		spinner.set('Saving...', 'save');
		let response;
		// Create new card if new
		if (isNewCard) {
			console.debug('Saving new card...');
			card = cardStore.addNew({ userId, card }); // Add new card to store
			// API CALL
			const prismaCard = card.cardToPrisma();
			console.debug('New prisma card:', prismaCard);
			response = await CARD_API.create(prismaCard);
			isNewCard = false;
		} else {
			console.debug('Saving existing card...');
			cardStore.setCard(card.id, card);
			// API CALL
			response = await CARD_API.update(card.cardToPrisma());
		}
		if (response.ok === true) {
			toast.success('Card saved successfully');
		} else {
			toast.error('Error saving card');
		}
		cardStore.save();
		cardIsSaved = true;
		// Complete spinner
		spinner.complete();

		// If it was a new card, redirect to the new card's page
		if (slug_id === 'new') {
			goto(`/cards/${card.id}?edit=1`);
		}
	}

	// Preventing navigating away when the card is not saved
	import { beforeNavigate } from '$app/navigation';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
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
								<span class="mr-1 text-sm text-muted-foreground">by</span>{ownerName}
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
						<Button onclick={downloadCard} variant="outline" size="sm"
							><Icon icon="memory:download" />Download</Button
						>
						<!-- Print -->
						<Button onclick={printCards} size="sm" variant="outline"
							><Icon icon="mdi:printer" />Print Card</Button
						>

						<!-- Save -->
						<Button
							onclick={() => saveHandler()}
							disabled={cardIsSaved || spinner.id === 'save'}
							color={cardIsSaved ? 'success' : 'blossom'}
							variant="success"
							size="sm"
							class="ml-auto"
						>
							{#if spinner.id === 'save'}
								<Spinner />
							{:else}
								<Icon icon={cardIsSaved ? 'mdi:check' : 'memory:floppy-disk'} />
							{/if}
							{cardIsSaved ? 'Saved' : 'Save'}</Button
						>
					</div>
				</header>
				{#if canEdit}
					<div id="itemEditor">
						<CardEditor bind:card bind:isOwner />
					</div>
				{/if}
			</section>
		{/if}
		<!-- Card Pane -->
		<section id="cardView">
			<div class="buttonRow">
				<!-- Back to Collection -->
				<Button
					variant="link"
					onclick={() => goto(`${base}/cards`)}
					title={!cardIsSaved ? 'Please save the card before leaving' : 'Back to Collection'}
					><Icon icon="mdi:arrow-left" />Back</Button
				>
				<!-- Toggle Edit/View Mode -->
				{#if canEdit}
					<Button onclick={toggleEditMode}
						><Icon icon={editMode ? 'mdi:eye' : 'mdi:pencil'} />{editMode
							? 'Viewing Mode'
							: 'Edit Card'}</Button
					>
				{/if}

				<!-- New Card -->
				{#if !isNewCard}
					<Button onclick={newEmptyCard}><Icon icon="mdi:plus" />New Card</Button>
				{/if}

				<Button variant="link" class="mobileOnly" href="#editor"
					><Icon icon="mdi:arrow-down" />Editor</Button
				>
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

	@media screen and (max-width: 920px) {
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
