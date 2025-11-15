<!-- Collection -->
<script lang="ts">
	// Partials
	import Gamecard from '$lib/components/partials/gamecards/Gamecard.svelte';
	import GamecardBack from '$lib/components/partials/gamecards/GamecardBack.svelte';

	// Svelte stuff
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { expoOut } from 'svelte/easing';
	import { goto, invalidateAll } from '$app/navigation';
	import { base } from '$app/paths';

	// UI Components
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Avatar from '$lib/components/ui/avatar';
	import PrintDialog from './printDialog.svelte';

	// Toaster
	import { toast } from 'svelte-sonner';

	// API
	import CARD_API from '$lib/utils/api/cards_api';

	// INIT CARDSTORE
	import { getContext, setContext } from 'svelte';
	import cachedTemplate from '$lib/stores/cachedTemplate';
	import { Card } from '$lib/domain/cards/card.svelte';
	import { CARD_CONTEXT_KEY, CardStore, StoredCard } from '$lib/domain/cards/cardStore.svelte';
	import type { CardID } from '$lib/domain/';

	const cardStoreContext = getContext<CardStore>(CARD_CONTEXT_KEY);
	let cardStore: CardStore = cardStoreContext;
	let renderedCards = $state(cardStore.cards); // Cards to render
	let renderedCards_sorted = $derived(
		renderedCards.slice().sort((a, b) => {
			// newest, else based on name
			try {
				return b.createdAt.getTime() - a.createdAt.getTime();
			} catch (error) {
				return a.name.localeCompare(b.name);
			}
		})
	);

	// Get data from server
	import type { UserID } from '$lib/domain/';
	let { data } = $props();

	// Selected Cards
	import { selectedCardIds } from '$lib/stores/selectedCardIds';
	let imageView: boolean = $state(false);

	// Get Character (for badges and character cards)
	// TODO: get/set using context, currently uses a dummy
	let selectedCharacter = {
		name: 'Neovald',
		image: 'https://robohash.org/Neovald'
	};

	///////////////
	// FUNCTIONS //
	///////////////

	function forceUIUpdate() {
		invalidateAll(); //Trick to reload context (which gets data from API and context model)
	}

	function toggleCardSelection(id: CardID) {
		console.debug(
			`${!$selectedCardIds.has(id) ? 'added' : 'removed'} card selection: ${id}`,
			$selectedCardIds
		);
		if ($selectedCardIds.has(id)) {
			$selectedCardIds.delete(id);
		} else {
			$selectedCardIds.add(id);
		}
		// Force svelte to recognise changes
		$selectedCardIds = $selectedCardIds;
	}

	async function deleteCard(card: StoredCard) {
		const prismaCard = card.cardToPrisma();
		// Confirmation
		cardStore.destroy(card.id);
		// Remove from selected cards
		$selectedCardIds.delete(card.id); // Remove ID from the selected set
		$selectedCardIds = $selectedCardIds; // Force update
		// Make API call
		const response = await CARD_API.delete([prismaCard]);
		if (response.ok === true) toast.success('Card deleted successfully');
		else toast.error('Error deleting card');
	}

	async function deleteSelected(ids: Set<CardID> = $selectedCardIds) {
		const cardIds = Array.from(ids);
		// Get cards to delete in PrismaCard format
		// NOTE: first, before actually removing them from the store!!
		const cardsToDelete = Array.from($selectedCardIds).map((id) =>
			cardStore.getCard(id).cardToPrisma()
		);
		// Confirmation and remove from cached Store Instance
		cardStore.destroy(cardIds);
		// Make API call
		const response = await CARD_API.delete(cardsToDelete);
		if (response.ok === true) toast.success('Cards deleted successfully');
		else toast.error('Error deleting cards');
		// Remove from selected cards
		$selectedCardIds.clear(); // Remove ID from the selected cards set
		$selectedCardIds = $selectedCardIds; // Force update
		// Force UI update
		forceUIUpdate();
	}

	function viewCard(id: string) {
		// Navigate to viewer
		goto(`${base}/cards/${id}`);
	}

	function editCard(id: string) {
		// Navigate to editor
		goto(`${base}/cards/${id}?edit=1`);
	}

	async function duplicateCard(card: StoredCard) {
		// Add to store
		if (data.user === null) {
			throw new Error('User not logged in');
		}
		// CONFIRM
		const confirm = window.confirm('Are you sure you want to duplicate this card?');
		if (!confirm) return;
		// CREATE
		const userId = data.user.id as UserID;
		const newCard = cardStore.addNew({ card, userId });
		const newCardAsPrisma = newCard.cardToPrisma();
		// Make API call
		const response = await CARD_API.create(newCardAsPrisma);
		if (response.ok === true) toast.success('Card duplicated successfully');
		else toast.error('Error duplicating card');
	}

	import Icon from '@iconify/svelte';
	function createFromTemplate(base: Card) {
		cachedTemplate.set(base);
		addNew();
	}

	function addNew() {
		// does not "create" the card in the data, just navigates to the editor
		goto(`${base}/cards/new?edit=1`);
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
	///////////////////////////
	// SEARCHING & FILTERING //
	///////////////////////////
	import SearchInput from '$lib/components/partials/SearchInput.svelte';
	import { downloadCards } from '$lib/utils/cards/download';
	let enableFiltering: boolean = $state(false);
	let searchTerm: string = $state('');
	let filteredCards: string[] = [];
	$effect(() => {
		if (enableFiltering) {
			// Filter which match name or description includes the search term
			filteredCards = cardStore.cards
				.filter((card) => {
					return (
						card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
						card.description.toLowerCase().includes(searchTerm.toLowerCase())
					);
				})
				// Return their ID's
				.map((card) => card.id);
		}
		// Set rendered cards to match filter state
		if (filteredCards.length === 0) {
			renderedCards = cardStore.cards;
		} else {
			renderedCards = cardStore.cards.filter((card) => filteredCards.includes(card.id));
		}
	});
	/////////////////////////
</script>

<main>
	<section id="controls">
		<div class="toolbarCategory">
			<!-- CHANGE VIEWS -->
			<!-- Filter -->
			<Button
				variant={enableFiltering ? 'advanced' : 'default'}
				onclick={() => (enableFiltering = !enableFiltering)}
				><Icon icon="mdi:filter" />Filter</Button
			>
			<!-- Image View -->
			<Button variant={imageView ? 'blossom' : 'default'} onclick={() => (imageView = !imageView)}>
				<Icon icon={imageView ? 'mdi:file-image' : 'mdi:file-document'} />
				Change View</Button
			>

			<!-- ONLY FOR LOGGED IN USERS -->
			{#if data.user !== null}
				<!-- Create New Card -->
				<Button variant="destructive" onclick={addNew}>
					<Icon icon="mdi:plus" />
					New Card</Button
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
				{#if $selectedCardIds.size > 0}{:else}
					<Button
						onclick={() => {
							downloadCards(renderedCards_sorted);
						}}
					>
						<Icon icon="mdi:download" />
						Download All</Button
					>
				{/if}
			{/if}
		</div>
		{#if $selectedCardIds.size > 0}
			<div class="toolbarCategory">
				<div class="toolbarLabel text-sm text-muted-foreground">
					{$selectedCardIds.size} cards selected
				</div>
				<Button variant="outline" onclick={() => ($selectedCardIds = new Set())}>
					<Icon icon="mdi:content-copy" />
					Deselect
				</Button>
				<PrintDialog />
				<Button
					onclick={() => {
						const cards = Array.from($selectedCardIds).map((id) => {
							return cardStore.getCard(id);
						});
						downloadCards(cards);
					}}
				>
					<Icon icon="mdi:download" />
					Download
				</Button>
				<Button
					onclick={() => {
						deleteSelected();
					}}
					variant="destructive"
				>
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
			<p class="text-sm text-muted-foreground">More to come...</p>
		</section>
	{/if}
	<!-- Render cards -->
	{#if (renderCards && renderedCards_sorted.length > 0) || (showTemplates && cardStore.templates.length > 0)}
		<section
			id="viewer"
			out:fly|local={{ duration: 400, opacity: 0, y: 20, easing: expoOut }}
			in:fly|local={{ delay: 400, duration: 800, opacity: 0, y: 40, easing: expoOut }}
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
						{#if data.user}
							<!-- Create from Template, only show if user is logged in -->
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
						{/if}
						<div class="frontSideCard">
							<Gamecard {card} />
						</div>
						<div class="backSideCard">
							<GamecardBack {card} />
						</div>
					</button>
				{/each}
			{/if}
			{#each renderedCards_sorted as card}
				<button
					class="cardInViewer"
					class:imageView
					class:isSelected={$selectedCardIds.has(card.id)}
					id={card.id}
					onclick={() => toggleCardSelection(card.id)}
					ondblclick={() => viewCard(card.id)}
				>
					<!-- BADGES (for showing ownership and character enabled cards) -->
					<!-- TODO: remove badges when filtering on permissions -->
					<div class="cardBadges">
						{#if card.ownerId === data.user?.id}
							<!-- IS OWNER -->
							<Badge variant="triumph">
								<Icon icon="mdi:star" />
								Creator
							</Badge>
						{:else if card.clientPermission.canEdit}
							<!-- Can Edit -->
							<Badge variant="blossom">
								<Icon icon="mdi:pencil" />
								Can edit
							</Badge>
						{/if}
						{#if data.user && card.public}
							<!-- PUBLIC (only when not all cards are public, i.e user is not logged in) -->
							<Badge variant="secondary">
								<Icon icon="mdi:user-group" />
								Public
							</Badge>
						{/if}
						{#if selectedCharacter && card.isCharacterCard}
							<!-- SHOW AVATAR IF CHARACTER CARD -->
							<Avatar.Root class="ml-auto border-2 border-blossom-500 bg-secondary">
								<Avatar.Image src={selectedCharacter.image} />
								<Avatar.Fallback>{selectedCharacter.name.charAt(0)}</Avatar.Fallback>
							</Avatar.Root>
						{/if}
					</div>
					<!-- Edit Options -->
					<div class="editOptions">
						<!-- Options when user can edit -->
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
						<!-- DOWNLOAD -->
						<Button
							size="icon"
							title="Download as JSON"
							onclick={(e) => {
								e.stopPropagation();
								downloadCards([card]);
							}}
						>
							<Icon icon="mdi:download" />
						</Button>
						<!-- USER NEEDS TO BE LOGGED IN -->
						{#if data.user !== null}
							<!-- IF USER CAN EDIT -->
							{#if card.clientPermission.canEdit || card.ownerId === data.user?.id}
								<!-- EDIT -->
								<Button
									size="icon"
									variant="blossom"
									title="Edit Card"
									onclick={(e) => {
										e.stopPropagation();
										editCard(card.id);
									}}
								>
									<Icon icon="mdi:pencil" />
								</Button>
								<!-- DUPLICATE - SMALL -->
								<Button
									variant="advanced"
									size="icon"
									title="Duplicate Card"
									onclick={(e) => {
										e.stopPropagation();
										duplicateCard(card);
									}}
								>
									<Icon icon="mdi:content-copy" />
								</Button>
							{:else}
								<!-- DUPLICATE - LARGE -->
								<Button
									variant="advanced"
									title="Create card from this template"
									onclick={() => createFromTemplate(card)}
								>
									<Icon icon="mdi:content-copy" />
									Create</Button
								>
							{/if}

							{#if data.user?.id === card.ownerId}
								<!-- DELETE -->
								<Button
									size="icon"
									variant="destructive"
									title="Delete Card"
									color="threat"
									onclick={(e) => {
										e.stopPropagation();
										deleteCard(card);
									}}
								>
									<Icon icon="mdi:trash" />
								</Button>
							{/if}
						{/if}
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
	{:else}
		<section
			class="flex h-42 w-full items-center justify-center"
			out:fly|local={{ duration: 400, opacity: 0, y: 20, easing: expoOut }}
			in:fly|local={{ delay: 400, duration: 800, opacity: 0, y: 40, easing: expoOut }}
		>
			<p class="text-center text-lg text-muted-foreground">No cards to display.</p>
		</section>
	{/if}
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

	.cardBadges {
		/* Placement */
		position: absolute;
		z-index: 1;
		top: -20px;
		left: -20px;
		right: -20px;
		/* Layout */
		display: flex;
		gap: 0.5rem;
		justify-content: flex-start;
		align-items: center;
		padding: 10px;
		/* Styling */
		font-size: 2em;
		/* Effect */
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
