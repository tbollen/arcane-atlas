<!-- Collection -->
<script lang="ts">
	// import Button from '$lib/components/coreComponents/Button.svelte';
	import Gamecard from '$lib/components/Gamecard.svelte';
	import GamecardBack from '$lib/components/GamecardBack.svelte';

	// UI Components
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	import { cardStore } from '$lib/stores/CardStore';
	let cards = $state(cardStore.cards);

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
		// cardStore.setActiveItem(id);
		updateItems();
		// Force svelte to recognise changes
		$selectedItems = $selectedItems;
	}

	function deleteCard(id: string) {
		// Confirmation
		// cardStore.destroy(id);
		// Remove from selected cards
		$selectedItems.delete(id);
		$selectedItems = $selectedItems;
		updateItems();
	}

	function viewCard(id: string) {
		// Navigate to viewer
		goto(`${base}/cards/${id}`);
	}

	function editCard(id: string) {
		// Navigate to editor
		goto(`${base}/cards/${id}?edit=1`);
	}

	function duplicateCard(id: string) {
		const baseCard = cardStore.getCard(id);
		cardStore.addNew(baseCard);
		updateItems();
	}

	import { type Item } from '$lib/types/Item.svelte';
	import Icon from '@iconify/svelte';
	import Dialog from '$lib/components/dialog/dialogs';
	function createFromTemplate(base: Item) {
		// cardStore.setActiveTemplate(base);
		addNew();
	}

	function addNew() {
		goto(`${base}/cards/new?edit=1`);
	}

	function updateItems() {
		// cardStore = cardStore;
	}

	// UI

	let showTemplates = $state(false);
	function toggleTemplates() {
		showTemplates = !showTemplates;
	}

	let renderCards = $state(false);
	onMount(() => {
		console.error(cardStore);
		renderCards = true;
	});

	function deleteSelected() {
		if (typeof window === 'undefined') throw new Error('Window is undefined');
		// Create an array of id's from the set
		const ids = Array.from($selectedItems);
		// cardStore.destroy(ids);
	}

	async function printDialog() {
		const printType = await Dialog.choose([
			{ name: 'Single Cards', response: 'single', icon: 'mdi:cards' },
			{ name: 'A4 (multiple)', response: 'A4', icon: 'mdi:view-grid' }
		]);
		if (printType === null) return;
		goto(`${base}/print?printMode=${printType}`);
	}

	// SEARCHING

	import SearchInput from '$lib/partials/SearchInput.svelte';
	let enableFiltering: boolean = $state(false);
	let searchTerm: string = $state('');
	let filteredItems: string[] = [];
	console.error(cardStore);
	$effect(() => {
		if (enableFiltering) {
			// Filter which match name or description includes the search term
			filteredItems = cardStore.cards
				.filter((card) => {
					return (
						card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
						card.description.toLowerCase().includes(searchTerm.toLowerCase())
					);
				})
				// Return their ID's
				.map((item) => item.id);
		}
		// Set _items.items to only include the items that match the search term
		if (filteredItems.length === 0) {
			cards = cardStore.cards;
		} else {
			cards = cardStore.cards.filter((card) => filteredItems.includes(card.id));
		}
	});
</script>

<main>
	<section id="controls">
		<div class="toolbarCategory">
			<!-- Filter -->
			<Button
				variant={enableFiltering ? 'advanced' : 'default'}
				onclick={() => (enableFiltering = !enableFiltering)}
				><Icon icon="mdi:filter" />Filter</Button
			>
			<!-- Create New Card -->
			<Button variant="destructive" onclick={addNew}>
				<Icon icon="mdi:plus" />
				New Card</Button
			>
			<!-- Image View -->
			<Button variant={imageView ? 'blossom' : 'default'} onclick={() => (imageView = !imageView)}>
				<Icon icon={imageView ? 'mdi:file-image' : 'mdi:file-document'} />
				Change View</Button
			>
			<!-- Upload with JSON -->
			<Button onclick={() => {}}>
				<Icon icon="mdi:upload" />
				Upload</Button
			>
			<!-- Show Templates -->
			<Button variant={showTemplates ? 'advanced' : 'default'} onclick={toggleTemplates}>
				<Icon icon={showTemplates ? 'mdi:clipboard-outline' : 'mdi:clipboard-off-outline'} />
				Show Templates</Button
			>
			<!-- Download -->
			{#if $selectedItems.size > 0}{:else}
				<Button onclick={() => {}}>
					<Icon icon="mdi:download" />
					Download All</Button
				>
			{/if}
		</div>
		{#if $selectedItems.size > 0}
			<div class="toolbarCategory">
				<div class="toolbarLabel text-sm text-muted-foreground">
					{$selectedItems.size} cards selected
				</div>
				<Button variant="outline" onclick={() => ($selectedItems = new Set())}>
					<Icon icon="mdi:content-copy" />
					Deselect
				</Button>
				<Button onclick={printDialog}>
					<Icon icon="mdi:printer" />
					Print</Button
				>
				<Button onclick={() => {}}>
					<Icon icon="mdi:download" />
					Download
				</Button>
				<Button onclick={deleteSelected} variant="destructive">
					<Icon icon="mdi:trash" />
					Delete</Button
				>
			</div>
		{/if}
	</section>
	{#if enableFiltering}
		<section
			id="filters"
			class=" flex flex-row items-baseline gap-4 border-b border-primary bg-card p-6 text-card-foreground"
		>
			<div id="filterContainer" class="">
				<SearchInput bind:searchTerm />
			</div>
			<Button
				variant="advanced"
				onclick={() => console.log('Serialized Items: ', cardStore.serialize())}
			>
				<Icon icon="mdi:code-json" />
				Serialize</Button
			>
		</section>
	{/if}
	{#if renderCards}
		<section
			id="viewer"
			transition:fly={{ delay: 200, duration: 800, opacity: 0, y: 40, easing: expoOut }}
		>
			<!-- TEMPLATES -->
			{#if showTemplates}
				{#each cardStore.templates as card}
					<button class="cardInViewer cardTemplate" class:imageView>
						<!-- Edit Options -->
						<Badge variant="advanced">
							<Icon icon="mdi:clipboard-outline" />
							Template
						</Badge>
						<div class="editOptions">
							<Button
								variant="advanced"
								title="Create card from this template"
								onclick={() => createFromTemplate(card)}
							>
								<Icon icon="mdi:content-copy" />
								Create</Button
							>
						</div>
						<div class="frontSideCard">
							<Gamecard {card} />
						</div>
						<div class="backSideCard">
							<GamecardBack {card} />
						</div>
					</button>
				{/each}
			{/if}
			{#each cards as card}
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
							title="Show card"
							size="icon"
							onclick={(e) => {
								e.stopPropagation();
								viewCard(card.id);
							}}
						>
							<Icon icon="mdi:zoom-in" />
						</Button>
						<Button
							size="icon"
							title="Edit Card"
							onclick={(e) => {
								e.stopPropagation();
								editCard(card.id);
							}}
						>
							<Icon icon="mdi:pencil" />
						</Button>
						<Button
							size="icon"
							title="Download as JSON"
							onclick={(e) => {
								e.stopPropagation();
								// cardStore.download(card.id);
							}}
						>
							<Icon icon="mdi:download" />
						</Button>
						<Button
							variant="advanced"
							size="icon"
							title="Duplicate Card"
							onclick={(e) => {
								e.stopPropagation();
								duplicateCard(card.id);
							}}
						>
							<Icon icon="mdi:content-copy" />
						</Button>
						<Button
							size="icon"
							variant="destructive"
							title="Delete Card"
							color="threat"
							onclick={(e) => {
								e.stopPropagation();
								deleteCard(card.id);
							}}
						>
							<Icon icon="mdi:trash" />
						</Button>
					</div>
					<div class="frontSideCard">
						<Gamecard {card} />
					</div>
					<div class="backSideCard">
						<GamecardBack {card} />
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
	}

	.activeLabel {
		left: -10px;
		top: -10px;
		color: var(--color-blossom-2);
		background: var(--color-blossom-3);
	}
</style>
