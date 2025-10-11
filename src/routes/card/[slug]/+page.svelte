<script lang="ts">
	// Svelte stuff
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	// Utils
	import { serializeCard } from '$lib/core/cards/cardStore.svelte';

	// Page params
	const slug_id = page.params.slug;

	console.log('slug_id:', slug_id);

	// Item stores, types and modules
	import { cardStore } from '$lib/stores/CardStore';
	import { StoredCard } from '$lib/core/cards/cardStore.svelte';

	// Components and Partials
	import MainLoader from '$lib/partials/MainLoader.svelte';
	import Gamecard from '$lib/components/Gamecard.svelte';
	import GamecardBack from '$lib/components/GamecardBack.svelte';
	import ItemEditor from '$lib/partials/ItemEditor.svelte';
	// import Button from '$lib/components/coreComponents/Button.svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

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
	import { cardMechanics, gameSystems } from '$lib/system/gameSystems';
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

	let savedCard: {} = $state({}); // Store the last saved item to compare with current item

	function updateSaveState() {
		// TODO: fix
	}

	// Save item function
	function saveHandler(preventRedirect = false) {
		const idsInCardStore = cardStore.cards.map((card) => card.id);
		// Create new item if new
		if (isNewCard) {
			console.debug('Saving new item...');
			card = cardStore.addNew(card); // Add new item to store
		} else {
			console.debug('Saving existing item...');
			cardStore.setCard(card.id, card);
		}
		console.error('Serialized Card:', serializeCard(card));
		cardStore.save();
		savedCard = { ...card }; // Update saved item
		// updateSaveState(); // Update save state
		// setTimeout(() => (cardIsSaved = false), 2000);

		// If it was a new item, redirect to the new item's page
		if (slug_id === 'new') {
			goto(`${base}/item/${card.id}?edit=1`);
		}
	}

	// Initialize item on page load, use a dummy item for init only!!
	let card: StoredCard = $state<StoredCard>(new StoredCard('new'));
	console.error('Card:', card);
	// Check if card is saved
	let cardIsSaved: boolean = $state(false);

	onMount(() => {
		// Retrieve Item
		try {
			if (!slug_id) throw new Error('No slug id found');
			// If the slug_id is 'new', get the active item or redirect to collection page if none found
			if (slug_id === 'new') {
				console.debug('Creating new card...');
				// TODO: create "new card" method
			} else {
				const retrievedCard = cardStore.getCard(slug_id);
				if (!retrievedCard) throw new Error(`No card found with id: ${slug_id}`);
				console.log('Retrieving card...', retrievedCard);
				// Get item from store
				card = retrievedCard;
				// savedCard = { ...card };
			}
		} catch {
			// Redirect to collection page when item not found
			alert(`No card found with id: ${slug_id}, redirecting to collection page...`);
			goto('/collection');
		}

		// Retrieve URL params for edit mode
		const urlParams = new URLSearchParams(window.location.search);
		urlParams.get('edit') === '1' ? (editMode = true) : (editMode = false);
	});

	function beforeUnload(event: BeforeUnloadEvent) {
		// Prevent closing if card is not saved (with dialog)
		return; // TODO: remove after fixing save method
		if (!cardIsSaved) {
			event.preventDefault();
			// Old Chrome browsers requires returnValue to be set
			event.returnValue = '';
		}
	}
	let isNewCard = $derived(slug_id === 'new');
</script>

<!-- Svelte Window -->
<svelte:window onbeforeunload={beforeUnload} />
{#if !card}
	<MainLoader />
{:else}
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
								<span class="mr-1 text-sm text-muted-foreground">by</span>{card?.creatorId ||
									'Unknown'}
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
					<div id="toolbar" class="editorRow">
						{#each Object.keys(cardMechanics) as sysId}
							{gameSystems.find((sys) => sys.id === sysId)?.name}
						{/each}
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
{/if}

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
