<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import Icon from '@iconify/svelte';
	import { iconExists } from '@iconify/svelte';
	import type { ComponentProps } from 'svelte';
	import { StoredCard } from '$lib/domain/cards/cardStore.svelte';
	import { cardTypes } from '$lib/domain/cards/cardTypes';

	type InputProps = ComponentProps<typeof InputGroup.Input>;

	let {
		searchTerm: _searchTerm = $bindable(''),
		cards,
		onCardSelect,
		...restProps
	}: {
		searchTerm?: string;
		onCardSelect: (card: StoredCard) => void;
		cards: StoredCard[];
	} & InputProps = $props();

	let searchTerm = $derived(_searchTerm);

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

	// Proxy selector (hover but default to only one)
	let proxyCardSelector: number = $state(0);

	$effect(() => {
		console.group('SearchInput Debug');
		console.log('searchTerm:', searchTerm);
		console.log('Given cards:', cards);
		console.log('filteredOptions:', filteredCards);
		console.groupEnd();
	});
</script>

<InputGroup.Root>
	<InputGroup.Input
		value={searchTerm}
		placeholder={restProps?.placeholder ?? 'Search for cards...'}
		disabled={!cards || cards.length === 0}
		oninput={(e) => {
			// @ts-ignore
			const _value = e.target?.value || '';
			searchTerm = _value;
		}}
		list="search-options"
		onfocus={() => {
			isFocussedOnInput = true;
		}}
		onkeydown={(e) => {
			// If Enter is pressed and there is at least one filtered card, select the first one
			if (e.key === 'Enter' && filteredCards.length > 0) {
				if (filteredCards.length === 0) return;
				// Prevent form submission
				e.preventDefault();
				onCardSelect(filteredCards[0]);
				searchTerm = '';
			}
		}}
		onblurcapture={() => {
			// Minor delay to allow click event to register
			setTimeout(() => {
				isFocussedOnInput = false;
			}, 200);
		}}
		{...restProps}
	/>
	<!-- If searching, show the custom datalist -->
	{#if searchTerm.trim() !== '' || isFocussedOnInput}
		<div
			id="customDatalist"
			class=" absolute top-[100%] right-0 left-0 z-50 mt-2 max-h-[50vh] overflow-y-auto rounded-xl border border-foreground/10 bg-background p-2 shadow-lg"
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
	{/if}
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
