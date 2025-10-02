<!-- Collection -->
<script lang="ts">
	import Button from '$lib/components/coreComponents/Button.svelte';
	import Gamecard from '$lib/components/Gamecard.svelte';
	import GamecardBack from '$lib/components/GamecardBack.svelte';

	import { items } from '$lib/stores/Items';
	let _items = $state(items);

	// Svelte stuff
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	// Selected Items
	import { selectedItems } from '$lib/stores/selectedItems';

	let imageView: boolean = $state(false);

	// Functions

	function toggleCardSelection(id: string) {
		console.debug(
			`${!$selectedItems.has(id) ? 'added' : 'removed'} card selection: ${id}`,
			$selectedItems
		);
		if ($selectedItems.has(id)) {
			$selectedItems.delete(id);
		} else {
			$selectedItems.add(id);
		}
		// Set last clicked card to be active
		items.setActiveItem(id);
		updateItems();
		// Force svelte to recognise changes
		$selectedItems = $selectedItems;
	}

	function deleteCard(id: string) {
		// Confirmation
		items.destroy(id);
		// Remove from selected cards
		$selectedItems.delete(id);
		$selectedItems = $selectedItems;
		updateItems();
	}

	function removeUnavailableCardsFromSelection() {
		// if the ID's in the set are not in items anymore, remove them
		for (const id of $selectedItems as Set<string>) {
			if (!items.idSet.has(id)) {
				$selectedItems.delete(id);
			}
		}
	}

	function viewCard(id: string) {
		// Navigate to viewer
		goto(`${base}/card/${id}`);
	}

	function editCard(id: string) {
		// Navigate to editor
		goto(`${base}/card/${id}?edit=1`);
	}

	function duplicateCard(id: string) {
		items.duplicateItem(id);
		updateItems();
	}

	import { type Item } from '$lib/types/Item';
	import Icon from '@iconify/svelte';
	import Dialog from '$lib/components/dialog/dialogs';
	function createFromTemplate(base: Item) {
		items.setActiveTemplate(base);
		addNew();
	}

	function addNew() {
		goto(`${base}/card/new?edit=1`);
	}

	function updateItems() {
		_items = items;
	}

	// UI

	let showTemplates = $state(false);
	function toggleTemplates() {
		showTemplates = !showTemplates;
	}

	let renderCards = $state(false);
	onMount(() => {
		renderCards = true;
	});

	function deleteSelected() {
		if (typeof window === 'undefined') throw new Error('Window is undefined');
		// Create an array of id's from the set
		const ids = Array.from($selectedItems);
		items.destroy(ids);
	}

	async function printDialog() {
		const printType = await Dialog.choose([
			{ name: 'Single Cards', response: 'single', icon: 'mdi:cards' },
			{ name: 'A4 (multiple)', response: 'A4', icon: 'mdi:view-grid' }
		]);
		if (printType === null) return;
		goto(`${base}/print?printMode=${printType}`);
	}
</script>

<main>
	<section id="controls">
		<div class="toolbarCategory">
			<!-- Create New Card -->
			<Button icon="mdi:plus" color="threat" click={addNew}>New Card</Button>
			<!-- Image View -->
			<Button
				icon={imageView ? 'mdi:file-image' : 'mdi:file-document'}
				stateOn={imageView}
				click={() => (imageView = !imageView)}>Change View</Button
			>
			<!-- Upload with JSON -->
			<Button icon="mdi:upload" click={() => items.upload()}>Upload</Button>
			<!-- Download -->
			{#if $selectedItems.size > 0}
				<Button icon="mdi:download" click={() => items.download(Array.from($selectedItems))}
					>Download ({$selectedItems.size})</Button
				>
			{:else}
				<Button icon="mdi:download" click={() => items.download()}>Download</Button>
			{/if}
			<Button
				icon={showTemplates ? 'mdi:clipboard-outline' : 'mdi:clipboard-off-outline'}
				stateOn={showTemplates}
				click={toggleTemplates}>Show Templates</Button
			>
		</div>
		{#if $selectedItems.size > 0}
			<div class="toolbarCategory">
				<div class="toolbarLabel">{$selectedItems.size} Items Selected</div>
				<Button
					size="small"
					variant="outlined"
					icon="mdi:content-copy"
					click={() => ($selectedItems = new Set())}
				>
					Deselect
				</Button>
				<Button size="small" icon="mdi:printer" click={printDialog}>Print</Button>
				<Button size="small" icon="mdi:trash" click={deleteSelected} color="threat">Delete</Button>
			</div>
		{/if}
	</section>
	{#if renderCards}
		<section
			id="viewer"
			transition:fly={{ delay: 200, duration: 800, opacity: 0, y: 40, easing: expoOut }}
		>
			<!-- TEMPLATES -->
			{#if showTemplates}
				{#each _items.templates as card}
					<button class="cardInViewer cardTemplate" class:imageView>
						<!-- Edit Options -->
						<div class="templateLabel cardLabel">
							<Icon icon="mdi:clipboard-outline" />
							Template
						</div>
						<div class="editOptions">
							<Button
								color="weave"
								title="Create card from this template"
								icon="mdi:content-copy"
								stopPropagation
								click={() => createFromTemplate(card)}
							>
								Create</Button
							>
						</div>
						<div class="frontSideCard">
							<Gamecard item={card} />
						</div>
						<div class="backSideCard">
							<GamecardBack item={card} />
						</div>
					</button>
				{/each}
			{/if}
			{#each _items.items as card}
				<button
					class="cardInViewer"
					class:imageView
					class:isSelected={$selectedItems.has(card.id)}
					id={card.id}
					onclick={() => toggleCardSelection(card.id)}
					ondblclick={() => viewCard(card.id)}
				>
					<!-- Edit Options -->
					<div class="editOptions">
						<Button
							icon="mdi:zoom-in"
							title="Show card"
							stopPropagation
							click={() => viewCard(card.id)}
						/>
						<Button
							icon="mdi:pencil"
							title="Edit Card"
							stopPropagation
							click={() => editCard(card.id)}
						/>
						<Button
							icon="mdi:content-copy"
							title="Duplicate Card"
							stopPropagation
							click={() => duplicateCard(card.id)}
						/>
						<Button
							icon="mdi:download"
							title="Download as JSON"
							stopPropagation
							click={() => items.download(card.id)}
						/>
						<Button
							icon="mdi:trash-can"
							title="Delete Card"
							color="threat"
							stopPropagation
							click={() => deleteCard(card.id)}
						/>
					</div>
					<div class="frontSideCard">
						<Gamecard item={card} />
					</div>
					<div class="backSideCard">
						<GamecardBack item={card} />
					</div>
				</button>
			{/each}
		</section>
	{/if}
	<section id="printSelected">
		{#each $selectedItems as sc}{/each}
	</section>
</main>

<style>
	section#controls {
		display: flex;
		gap: 10px;
		flex-wrap: wrap;
	}
	@media (max-width: 800px) {
		section#controls {
			justify-content: center;
		}
	}

	.toolbarCategory {
		display: flex;
		flex-wrap: wrap;
		column-gap: 8px;
		row-gap: 4px;
		/* Placement */
		position: relative;
		padding-bottom: 2.5px;
	}

	.toolbarCategory:has(.toolbarLabel) {
		border-bottom: 1px solid var(--color-obsidian-2);
	}

	.toolbarLabel {
		font-weight: 600;
		font-size: 9pt;
		/* Placement */
		position: absolute;
		top: calc(100% + 2.5px);
	}

	section#viewer {
		overflow-x: hidden;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(65mm, 1fr));
		grid-auto-flow: dense;
		justify-items: center;
		align-items: center;
		gap: 5mm;
		padding: 0mm min(10%, 15mm);
	}

	.cardInViewer {
		/* Reset button stuff */
		all: unset;
		/* Positioning */
		position: relative;
		/* Scaling down */
		height: fit-content;
		width: fit-content;
		transform: scale(0.8);
		transition: all 0.4s ease-in-out;
		margin: 5mm;
		/* Click */
		cursor: pointer;
	}

	.cardInViewer:hover,
	.cardInViewer:focus-visible {
		z-index: 100;
		transform: scale(0.8) translatex(-30%);
	}

	.editOptions {
		/* Placement */
		position: absolute;
		bottom: -20px;
		width: 100%;
		z-index: 1;
		/* Layout */
		display: flex;
		gap: 3px;
		justify-content: center;
		align-items: center;
		padding: 10px;
		/* Styling */
		font-size: 2em;
		/* Effect */
		opacity: 0;
		transform: translateY(10px);
		transition: all 0.2s ease-in-out;
	}

	.cardInViewer:hover .editOptions,
	.editOptions:focus-within {
		transform: translateY(0px);
		opacity: 1;
	}

	.frontSideCard {
		/* Positioning */
		position: relative;
		transition: all 0.4s ease-in-out;
		box-sizing: content-box;
	}

	.backSideCard {
		/* Positioning */
		position: absolute;
		top: 0%;
		left: 0%;
		z-index: -1;
		transition: all 0.4s ease-in-out;
		/* vars for image View */
		--bsc-translate-y: 0%;
		transform: rotate(0deg) translateY(var(--bsc-translate-y));
	}

	.cardTemplate > .frontSideCard,
	.cardTemplate > .backSideCard {
		scale: 0.9;
	}

	.cardInViewer:focus-visible .frontSideCard,
	.cardInViewer:hover .frontSideCard {
		box-shadow: 10px 10px 15px var(--color-text-1);
		transform: rotate(-5deg) translateY(var(--bsf-translate-y));
	}

	.cardInViewer:focus-visible .backSideCard,
	.cardInViewer:hover .backSideCard {
		left: 60%;
		transform: rotate(5deg) translateY(var(--bsc-translate-y));
		box-shadow: 10px 10px 15px var(--color-text-3);
	}

	.cardInViewer.isSelected .frontSideCard::after,
	.cardInViewer.isSelected .backSideCard::after {
		content: '';
		position: absolute;
		inset: -5px;
		background-color: var(--color-blossom-2);
		opacity: 1;
		z-index: -1;
	}
	/* Image View things */

	.imageView {
		padding-bottom: 20%;
	}

	.imageView > .frontSideCard {
		z-index: -1;
	}

	.imageView > .backSideCard {
		--bsc-translate-y: 20%;
	}

	/* Label */

	.cardLabel {
		/* Placement */
		position: absolute;
		left: 0;
		top: 0;
		z-index: 1;
		/* Layout */
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 5px;
		/* Styling */
		padding: 5px;
		font-weight: 500;
		border-radius: 1em;
		color: var(--color-blossom-2);
		background: var(--color-blossom-3);
	}

	.templateLabel {
		color: var(--color-text-2);
		background: var(--color-surface-3);
	}

	.activeLabel {
		left: -10px;
		top: -10px;
		color: var(--color-blossom-2);
		background: var(--color-blossom-3);
	}
</style>
