<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import Icon from '@iconify/svelte';
	import { iconExists } from '@iconify/svelte';
	import type { ComponentProps } from 'svelte';
	import { StoredCard } from '$lib/domain/cards/cardStore.svelte';
	import { cardTypes } from '$lib/domain/cards/cardTypes';

	type InputProps = ComponentProps<typeof InputGroup.Input>;

	let {
		searchTerm = $bindable(''),
		cards,
		onCardSelect,
		...restProps
	}: {
		searchTerm?: string;
		onCardSelect: (card: StoredCard) => void;
		cards: StoredCard[];
	} & InputProps = $props();

	let filteredCards = $derived.by(() => {
		// Fallback if no options
		if (!cards || cards.length === 0) return cards; // If not options are provided, return empty list
		if (!searchTerm || searchTerm.trim() === '') return cards; // If no search term, return all options

		const lowerSearch = searchTerm.toLowerCase();
		// Matches properties with higher relevance first
		const likelyMatches = cards.filter(
			(card) =>
				card.id.toLowerCase().includes(lowerSearch) || card.name.toLowerCase().includes(lowerSearch)
		);
		// Then include less relevant matches (filtering out those already included)
		const possibleMatches = cards
			.filter((card) => card.subtitle && card.subtitle.toLowerCase().includes(lowerSearch))
			.filter((card) => !likelyMatches.some((c) => c.id === card.id));

		// Finally include description matches (filtering out those already included)
		const farfetchedMatches = cards
			.filter((card) => card.description && card.description.toLowerCase().includes(lowerSearch))
			.filter((card) => ![...likelyMatches, ...possibleMatches].some((c) => c.id === card.id));
		// Merge sorted
		return [...likelyMatches, ...possibleMatches, ...farfetchedMatches];
	});

	// Holder for focussing
	let isFocussedOnInput: boolean = $state(false);
	let isFocussedOnDropdown: boolean = $state(false);

	// Proxy selector (hover but default to only one)
	let proxyCardSelector: number = $state(0);
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
				if (e.key === 'Enter' && filteredCards.length > 0) {
					if (filteredCards.length === 0) return;
					// Prevent form submission
					e.preventDefault();
					onCardSelect(filteredCards[proxyCardSelector]);
					searchTerm = '';
				}
				// Arrow key navigation
				else if (e.key === 'ArrowDown') {
					e.preventDefault();
					proxyCardSelector = Math.min(proxyCardSelector + 1, filteredCards.length - 1);
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
			{#if filteredCards.length > 0}
				{#each filteredCards as card, index}
					{@const cardType = cardTypes.find((type) => type.name === card.type) || cardTypes[0]}
					{@const icon = card.icon && iconExists(card.icon) ? card.icon : cardType.icon}
					<button
						class="
						grid w-full cursor-pointer grid-cols-[auto_1fr] items-center
						justify-items-start gap-x-1 rounded-md py-2
                        {proxyCardSelector === index ? 'bg-obsidian-500/10' : ''}
						"
						onclick={() => {
							onCardSelect(card);
							searchTerm = '';
						}}
						onmouseenter={() => {
							proxyCardSelector = index;
						}}
						onmouseleave={() => {
							proxyCardSelector = 0;
						}}
					>
						<div class="row-span-2 p-2">
							<Icon {icon} class="h-6 w-6" style="color: {card.style.color.icon};" />
						</div>
						<p
							class=" w-full max-w-full overflow-hidden text-left leading-tight font-semibold overflow-ellipsis whitespace-nowrap"
							style="font-family: '{card.style.font.name}', 'Gotham', sans-serif;"
						>
							{card.name}
						</p>
						<p
							class=" max-w-full overflow-hidden text-left text-sm overflow-ellipsis whitespace-nowrap text-muted-foreground"
						>
							{card.subtitle}
						</p>
					</button>
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
	</InputGroup.Root>
</div>
