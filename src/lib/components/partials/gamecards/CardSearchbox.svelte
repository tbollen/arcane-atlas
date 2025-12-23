<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { iconExists } from '@iconify/svelte';
	import ListItem from '$lib/components/partials/ListItem.svelte';

	import type { ComponentProps } from 'svelte';
	import { StoredCard } from '$lib/domain/cards/cardStore.svelte';
	import { cardTypes } from '$lib/domain/cards/cardTypes';
	import type { CharacterSystems } from '$lib/gameSystems';
	import { invalidate } from '$app/navigation';

	type InputProps = ComponentProps<typeof InputGroup.Input>;
	type CardFilter = {
		disabledCardIDs?: StoredCard['id'][];
		disableCharacterCards?: boolean;
		systems?: CharacterSystems[];
	};

	let {
		searchTerm = $bindable(''),
		cards,
		onCardSelect,
		cardFilters,
		...restProps
	}: {
		searchTerm?: string;
		onCardSelect: (card: StoredCard) => void;
		cards: StoredCard[];
		cardFilters?: CardFilter;
	} & InputProps = $props();

	$effect(() => {
		console.log('FILTERS CHANGED', cardFilters);
	});

	let searchedCards: StoredCard[] = $derived.by(() => {
		// Fallback if no options
		if (!cards || cards.length === 0) return cards; // If not options are provided, return empty list
		if (!searchTerm || searchTerm.trim() === '') return cards; // If no search term, return all options

		const lowerSearch = searchTerm.toLowerCase();
		// Matches properties with higher relevance first
		const likelyMatches = cards.filter(
			(card) =>
				(lowerSearch.startsWith('card:') && card.id.toLowerCase().includes(lowerSearch)) ||
				card.name.toLowerCase().includes(lowerSearch)
		);
		// Then include less relevant matches (filtering out those already included)
		const possibleMatches = cards
			.filter((card) => card.subtitle && card.subtitle.toLowerCase().includes(lowerSearch))
			.filter((card) => !likelyMatches.some((c) => c.id === card.id));

		// Finally include description matches (filtering out those already included)
		const farfetchedMatches = cards
			.filter((card) => card.type.toLowerCase().includes(lowerSearch))
			.filter((card) => ![...likelyMatches, ...possibleMatches].some((c) => c.id === card.id));
		// Merge sorted
		let merged = [...likelyMatches, ...possibleMatches, ...farfetchedMatches];
		return merged;
	});

	let [sortedCards, filteredOutCards]: [StoredCard[], StoredCard[]] = $derived.by(() => {
		let filtered: StoredCard[] = [];

		// Remove explicitly disabled cards (by ID)
		if (cardFilters && cardFilters.disabledCardIDs) {
			filtered = [
				...filtered,
				...searchedCards.filter((card) =>
					cardFilters.disabledCardIDs!.some((disabledCardID) => disabledCardID === card.id)
				)
			];
		}

		// Remove cards that are already character cards (or the other way around)
		// If disableCharacterCards is true, remove character cards, if false, remove non-character cards
		if (cardFilters && cardFilters.disableCharacterCards !== undefined) {
			filtered = [
				...filtered,
				...searchedCards.filter(
					(card) => card.isCharacterCard === cardFilters.disableCharacterCards
				)
			];
		}

		// Remove cards that do not match the specified systems
		if (cardFilters && cardFilters.systems) {
			filtered = [
				...filtered,
				...searchedCards.filter((card) =>
					card.systems.some((sys) => !cardFilters.systems!.includes(sys))
				)
			];
		}
		// Sort filtered to have valid cards first, then filtered out cards
		let sorted = [...searchedCards.filter((card) => !filtered.includes(card)), ...filtered];
		return [sorted, filtered];
	});

	// Holder for focussing
	let isFocussedOnInput: boolean = $state(false);
	let isFocussedOnDropdown: boolean = $state(false);

	// Proxy selector (hover but default to only one)
	let proxyCardSelector: number = $state(0);

	// FUNCTIONS
	function refreshFilters() {
		// Trigger re-evaluation of derived stores
	}
</script>

<div class="group relative">
	<InputGroup.Root>
		<InputGroup.Input
			value={searchTerm}
			oninput={(e) => {
				searchTerm = e.currentTarget.value;
			}}
			placeholder={restProps?.placeholder ?? 'Search for cards...'}
			disabled={!cards || cards.length === 0}
			list="search-options"
			onkeydown={(e) => {
				// If Enter is pressed and there is at least one filtered card, select the first one
				if (e.key === 'Enter' && searchedCards.length > 0) {
					if (searchedCards.length === 0) return;
					// Prevent form submission
					e.preventDefault();
					onCardSelect(searchedCards[proxyCardSelector]);
					searchTerm = '';
				}
				// Arrow key navigation
				else if (e.key === 'ArrowDown') {
					e.preventDefault();
					proxyCardSelector = Math.min(proxyCardSelector + 1, searchedCards.length - 1);
				} else if (e.key === 'ArrowUp') {
					e.preventDefault();
					proxyCardSelector = Math.max(proxyCardSelector - 1, 0);
				}
			}}
			{...restProps}
		/>
		<!-- Custom datalist - shown when focused within group and has search term -->
		<div
			id="customDatalist"
			tabindex="-1"
			class="pointer-events-none absolute top-[100%] right-0 left-0 z-50 mt-2 max-h-[50vh] overflow-y-auto rounded-xl border border-foreground/10 bg-background p-2 opacity-0 shadow-lg transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100"
			class:hidden={searchTerm.trim() === ''}
		>
			{#if sortedCards.length > 0}
				{#each sortedCards as card, index}
					{@const cardType = cardTypes.find((type) => type.name === card.type) || cardTypes[0]}
					{@const icon = card.icon && iconExists(card.icon) ? card.icon : cardType.icon}
					{@const isFilteredOut = filteredOutCards.some(
						(filteredCard) => filteredCard.id === card.id
					)}
					<ListItem
						icon={{ icon, style: `color: ${card.style.color.icon}` }}
						class="hover:bg-unset {isFilteredOut
							? '!cursor-not-allowed opacity-50'
							: proxyCardSelector === index
								? 'bg-obsidian-500/10'
								: ''}"
						mainText={{
							text: card.name,
							style: `font-family: '${card.style.font.name}', 'Gotham', sans-serif;`
						}}
						subText={card.subtitle}
						onclick={isFilteredOut
							? undefined
							: () => {
									onCardSelect(card);
									searchTerm = '';
								}}
						onmouseenter={() => {
							proxyCardSelector = index;
						}}
					/>
				{/each}
			{:else}
				<p class="p-2 text-sm text-muted-foreground">No cards found with term "{searchTerm}"</p>
			{/if}
		</div>
		<InputGroup.Addon>
			<Icon icon="mdi:magnify" />
		</InputGroup.Addon>
		{#if searchTerm}
			<InputGroup.Addon align="inline-end">
				<InputGroup.Button
					onclick={() => {
						searchTerm = '';
					}}><Icon icon="mdi:remove" /></InputGroup.Button
				>
			</InputGroup.Addon>
		{/if}
		<InputGroup.Addon align="inline-end">
			<InputGroup.Button onclick={refreshFilters}><Icon icon="mdi:refresh" /></InputGroup.Button>
		</InputGroup.Addon>
	</InputGroup.Root>
</div>
