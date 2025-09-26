<script lang="ts">
	// Svelte stuff
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	// Page params
	const slug_id = $page.params.slug;

	// Item stores, types and modules
	import { items, type StoredItem } from '$lib/stores/Items';

	// Components and Partials
	import MainLoader from '$lib/partials/MainLoader.svelte';
	import Gamecard from '$lib/components/Gamecard.svelte';
	import GamecardBack from '$lib/components/GamecardBack.svelte';
	import ItemEditor from '$lib/partials/ItemEditor.svelte';
	import Button from '$lib/components/coreComponents/Button.svelte';

	function newEmptyItem() {
		const saveFirst = window.confirm('Do you want to save before creating a New Card?');
		if (saveFirst) {
			items.save();
		}
		items.addNewItem();
		item = items.getActiveItem();
	}

	// Edit Mode stuff
	let editMode = false;
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

	// Save stuff
	let showSaved: boolean = false;
	function saveItem() {
		items.setItem(item.id, item);
		items.save();
		showSaved = true;
		setTimeout(() => (showSaved = false), 2000);
	}

	// Edit Date
	let localDate: string = '';

	// Initialize item on page load
	let item: StoredItem;
	onMount(() => {
		// Retrieve Item
		try {
			item = items.getItem(slug_id);
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
</script>

{#if !item}
	<MainLoader />
{:else}
	<main id="main" class:viewMode={!editMode}>
		<!-- Editor Pane -->
		{#if editMode}
			<section id="editor">
				<header id="editorHeader">
					<div class="displayText editorTitle">Card Editor</div>
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
								{item?.creator}
							</div>
							<div id="cardDate" class="infoBlockMinor">{localDate}</div>
						</div>
					</div>
					<!-- Buttons and Toolbar -->
					<div id="toolbar" class="editorRow">
						<!-- Advanced -->
						<Button
							click={toggleAdvancedMode}
							stateOn={$advancedMode}
							variant="flipped"
							color="weave"
							icon="memory:anvil"
							size="small"
						>
							Advanced
						</Button>
						<!-- Download -->
						<Button click={downloadItem} variant="filled" icon="memory:download" size="small"
							>Download</Button
						>

						<!-- Save -->
						<Button
							click={saveItem}
							color={showSaved ? 'success' : 'blossom'}
							variant="filled"
							icon={showSaved ? 'mdi:check' : 'memory:floppy-disk'}
							size="small">Save</Button
						>
						<!-- Print -->
						<Button click={printCards} icon="mdi:printer" size="small">Print Card</Button>
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
				<Button color="threat" click={() => goto(`${base}/collection`)} icon="mdi:arrow-left"
					>Back</Button
				>
				<!-- Toggle Edit/View Mode -->
				<Button click={toggleEditMode} icon={editMode ? 'mdi:eye' : 'mdi:pencil'}
					>{editMode ? 'Viewing Mode' : 'Edit Card'}</Button
				>
				<Button click={newEmptyItem} icon="mdi:plus">New Card</Button>

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
<style>
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
		background-color: var(--color-surface-4);
		border-top-left-radius: 1em;
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
		background-color: var(--color-surface-4);
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
