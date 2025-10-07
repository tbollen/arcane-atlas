<script lang="ts">
	// Svelte stuff
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	// Page params
	const slug_id = page.params.slug;

	// Item stores, types and modules
	import { items, type StoredItem } from '$lib/stores/Items.svelte';

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
			items.save();
		}
		items.addNewItem();
		item = items.getActiveItem();
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
		const itemId = item.id;
		saveItem();
		selectedItems.set(new Set([itemId]));
		goto(`${base}/print`);
	}

	// Download the current item as JSON
	function downloadItem() {
		items.download(item.id);
	}

	let savedItem: {} = $state({}); // Store the last saved item to compare with current item

	function updateSaveState() {
		if (!item || !savedItem) return (cardIsSaved = false);
		cardIsSaved = JSON.stringify(item) === JSON.stringify(savedItem);
	}

	// Save item function
	function saveItem(preventRedirect = false) {
		// Create new item if new
		if (isNewCard) {
			console.debug('Saving new item...');
			items.addNewItem(item); // Add new item to store
			items.setActiveItem(item); // Set active item to the new item
		} else {
			console.debug('Saving existing item...');
			items.setItem(item.id, item); // Update item in store, create new if not found
		}
		items.save();
		savedItem = { ...item }; // Update saved item
		// updateSaveState(); // Update save state
		// setTimeout(() => (cardIsSaved = false), 2000);

		// If it was a new item, redirect to the new item's page
		if (slug_id === 'new') {
			goto(`${base}/item/${item.id}?edit=1`);
		}
	}

	// Edit Date
	let localDate: string = $state('');

	// Initialize item on page load, use a dummy item for init only!!
	let item: StoredItem = $state<StoredItem>(items.prepareItem());
	// Check if card is saved
	let cardIsSaved: boolean = $state(false);

	onMount(() => {
		// Retrieve Item
		try {
			if (!slug_id) throw new Error('No slug id found');
			// If the slug_id is 'new', get the active item or redirect to collection page if none found
			if (slug_id === 'new') {
				console.debug('Creating new item...');
				item = items.prepareItem();
			} else {
				// Get item from store
				item = items.getItem(slug_id);
				savedItem = { ...item };
			}
			// Store a copy of the item to compare later
			console.debug('Item retrieved:', item);
		} catch {
			// Redirect to collection page when item not found
			alert(`No item found with id: ${slug_id}, redirecting to collection page...`);
			goto('/collection');
		}

		// Set local date
		localDate = new Date(item.dateCreated).toLocaleDateString();

		// Retrieve URL params for edit mode
		const urlParams = new URLSearchParams(window.location.search);
		urlParams.get('edit') === '1' ? (editMode = true) : (editMode = false);
	});

	function beforeUnload(event: BeforeUnloadEvent) {
		// Prevent closing if card is not saved (with dialog)
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
{#if !item}
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
								{item?.name}
							</div>
							<div id="cardId" class="infoBlockMinor">
								id: {item?.id}
							</div>
						</div>

						<div class="cardInfoBlock">
							<div id="cardCreator" class="infoBlockMajor">
								<span class="mr-1 text-sm text-muted-foreground">by</span>{item?.creator}
							</div>
							<div id="cardDate" class="infoBlockMinor">{localDate}</div>
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
							onclick={() => saveItem()}
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
					<ItemEditor bind:item />
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
				<Gamecard {item} />
				<GamecardBack {item} />
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
