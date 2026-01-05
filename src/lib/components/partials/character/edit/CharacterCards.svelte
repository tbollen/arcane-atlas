<script lang="ts">
	// UI Components
	import { Label } from '$lib/components/ui/label/';
	import CardSearchbox from '$lib/components/partials/gamecards/CardSearchbox.svelte';
	import { EditList } from '$lib/components/ui/edit-list';
	import ListItem from '$lib/components/partials/ListItem.svelte';

	// Import Utils and Types
	import { StoredCharacter } from '$lib/domain/characters/character.svelte';
	import { StoredCard } from '$lib/domain/cards/cardStore.svelte.js';
	import CARD_API from '$lib/utils/api/cards_api.js';
	import { verbose } from '$lib/utils/feedback/verbose';

	// Prop type
	import type { CharacterEditProps } from '$lib/components/partials/character/edit/propsType.js';

	// Card and Icon
	import { cardTypes } from '$lib/domain/cards/cardTypes';

	// Svelte
	import { invalidateAll } from '$app/navigation';

	// Props
	let { character, cards }: CharacterEditProps = $props();

	function iconFromCard(card: StoredCard) {
		if (card.icon) return card.icon;
		const typeInfo = cardTypes.find((type) => type.name === card.type);
		return typeInfo && typeInfo.icon ? typeInfo.icon : 'mdi:card-outline';
	}

	let showList = $state(true);
	function rerender() {
		// Trick client to rerender the list
		showList = false;
		setTimeout(() => {
			showList = true;
		}, 0);
	}
</script>

<div>
	<Label for="cards" class="mb-2">Cards</Label>
	{#if !cards || cards.length === 0}
		<p class="text-sm text-muted-foreground">No cards available to add.</p>
	{:else if showList}
		<!-- SEARCHBOX -->
		<CardSearchbox
			placeholder="Search and add cards..."
			{cards}
			cardFilters={{
				disabledCardIDs: cards.filter((card) => card.isCharacterCard).map((card) => card.id)
			}}
			onRemoveCard={async (card) => {
				await verbose(
					async () => {
						// Remove card from character
						const response = await CARD_API.removeFromCharacter({
							characterId: character.id,
							cards: [card.id]
						});
					},
					{ successMessage: `Removed card "${card.name}" from character.` }
				);
				// Invalidate all to update character cards
				rerender(); // Force rerender to update list
				invalidateAll();
			}}
			onCardSelect={async (card) => {
				await verbose(
					async () => {
						// Add card to character
						const response = await CARD_API.addToCharacter({
							characterId: character.id,
							cards: [card.cardToPrisma()]
						});
					},
					{ successMessage: `Added card "${card.name}" to character.` }
				);
				// Invalidate all to update character cards
				invalidateAll();
			}}
		/>
		<!-- OVERVIEW OF CARDS -->
		{#if cards.filter((card) => card.isCharacterCard).length > 0}
			<EditList
				class="max-h-96 overflow-y-auto"
				list={cards.filter((card) => card.isCharacterCard)}
				increase="hidden"
				decrease="hidden"
				remove={(index) => {
					const card = cards.filter((card) => card.isCharacterCard)[index];
					verbose(
						async () => {
							// Remove card from character
							const response = await CARD_API.removeFromCharacter({
								characterId: character.id,
								cards: [card.id]
							});
						},
						{ successMessage: `Removed card "${card.name}" from character.` }
					);
					// Invalidate all to update character cards
					rerender(); // Force rerender to update list
					invalidateAll();
				}}
			>
				{#snippet item(card: StoredCard, index: number)}
					<ListItem
						mainText={card.name}
						subText={card.type}
						icon={{ icon: iconFromCard(card), style: `color: ${card.style.color.icon}` }}
					/>
				{/snippet}
			</EditList>
		{:else}
			<p class="mt-2 text-sm text-muted-foreground">No cards added to character yet.</p>
		{/if}
	{/if}
</div>
