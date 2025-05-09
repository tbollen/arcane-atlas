<script lang="ts">
	// Core Components
	import Button from '$lib/components/coreComponents/Button.svelte';
	// Import Components
	import Gamecard from '$lib/components/Gamecard.svelte';
	import GamecardBack from '$lib/components/GamecardBack.svelte';
	import DiceIcon from '$lib/components/coreComponents/DiceIcon.svelte';

	// Import Item Store
	import { editItem } from '$lib/stores/Items';
	import ItemEditor from '$lib/partials/ItemEditor.svelte';

	import { items } from '$lib/stores/Items';
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';

	let editMode = true;
	// Sync Edititem with Items
	$editItem = items.getActiveItem();

	function newEmptyItem() {
		const saveFirst = window.confirm('Do you want to save before creating a New Card?');
		if (saveFirst) {
			items.save();
		}
		items.addNewItem();
		$editItem = items.getActiveItem();
	}
	function toggleEditMode() {
		editMode = !editMode;
	}

	// ## Toolbar buttons
	// Printing the card
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { selectedItems } from '$lib/stores/selectedItems';

	async function printCards() {
		const itemId = $editItem.id;
		saveItem();
		selectedItems.set(new Set([itemId]));
		goto(`${base}/print`);
	}

	function downloadItem() {
		items.download($editItem.id);
	}

	let showSaved: boolean = false;

	function saveItem() {
		items.setItem($editItem.id, $editItem);
		items.save();
		showSaved = true;
		setTimeout(() => (showSaved = false), 2000);
	}

	import { advancedMode } from '$lib/stores/advancedMode';
	function toggleAdvancedMode() {
		$advancedMode = !$advancedMode;
	}

	// END OF TOOLBAR BUTTONS
	let localDate: string = '';
	let mounted = false;
	onMount(() => {
		mounted = true;
	});

	$: if (mounted) {
		localDate = new Date($editItem.dateCreated).toLocaleDateString();
	}
</script>

<main id="main">
	<!-- Editor Pane -->
	{#if editMode}
		<section id="editor" transition:slide={{ duration: 200 }}>
			<header id="editorHeader">
				<div class="displayText editorTitle">Card Editor</div>
				<div id="cardInfo" class="editorRow">
					<div class="cardInfoBlock">
						<div id="cardName" class="infoBlockMajor">
							{$editItem?.name}
						</div>
						<div id="cardId" class="infoBlockMinor">
							id: {$editItem?.id}
						</div>
					</div>

					<div class="cardInfoBlock">
						<div id="cardCreator" class="infoBlockMajor">
							{$editItem?.creator}
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
				<ItemEditor />
			</div>
		</section>
	{/if}

	<!-- Card Pane -->
	<section id="cardView">
		<div class="buttonRow">
			<Button click={toggleEditMode} icon={editMode ? 'mdi:eye' : 'mdi:pencil'}
				>{editMode ? 'Viewing Mode' : 'Edit Card'}</Button
			>
			<Button click={newEmptyItem} icon="mdi:plus">New Card</Button>

			<a class="mobileOnly" href="#editor">Go to editor</a>
		</div>
		<div id="cardArea">
			<Gamecard item={$editItem} />
			<GamecardBack item={$editItem} />
		</div>
	</section>
</main>

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
		/* Nothing to see here */
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
