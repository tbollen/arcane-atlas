<script lang="ts">
	import { goto } from '$app/navigation';
	import { getContext, onMount } from 'svelte';
	import { base } from '$app/paths';
	// Svelte Components
	import Gamecard from '$lib/components/Gamecard.svelte';
	import GamecardBack from '$lib/components/GamecardBack.svelte';
	// Stores
	import { items } from '$lib/stores/Items';
	import { selectedItems } from '$lib/stores/selectedItems';
	//
	let cards = $selectedItems;
	let cardSet: typeof items.items = [];
	// Set Cards
	cardSet = items.items.filter((item) => cards.has(item.id));

	// Get info from url parameter
	const urlParams = new URLSearchParams(window.location.search);
	const printMode = urlParams.get('printMode');
	let cardPrint: boolean = printMode != 'A4';

	const cardHeight = 88;
	const cardWidth = 63;
	const pageHeight = 210;
	const pageWidth = 297;
	const pageMargin = 6;
	const cardGap = 5;

	const spaceY = (pageHeight - pageMargin) % cardHeight;
	const spaceX = (pageWidth - pageMargin) % cardWidth;
	const cardAmountY = Math.floor(pageHeight / cardHeight);
	const cardAmountX = Math.floor(pageWidth / cardWidth);
	const printMarginX = (pageWidth - cardWidth * cardAmountX - cardGap * (cardAmountX - 1)) / 2;
	const printMarginY = (pageHeight - cardHeight * cardAmountY - cardGap * (cardAmountY - 1)) / 2;

	const cardsPerPage = (cardAmountX * cardAmountY) / 2;

	// Create multiple sets from cardSet, each split by the amount of cards per page
	const cardSetSplit = Array.from({ length: Math.ceil(cardSet.length / cardsPerPage) }, (_, i) =>
		cardSet.slice(i * cardsPerPage, (i + 1) * cardsPerPage)
	);

	onMount(() => {
		console.debug('printing cards...', cards);
		setCssPage();
		// print
		window.print();
		window.onafterprint = () => {
			// go back
			goto(`${base}/collection`);
		};
		// go back
		goto(`${base}/collection`);
	});

	// Set css @page variables
	function setCssPage() {
		const pageSize = cardPrint
			? `${cardWidth + cardGap}mm ${cardHeight + cardGap}mm`
			: 'A4 landscape';
		const style = document.createElement('style');
		style.innerHTML = `
            @page {
                size: ${pageSize};
                margin: 0;
                padding: 0;
            }
        `;
		document.head.appendChild(style);
	}
</script>

{#if cardPrint}
	{#each cardSet as card, i}
		<div
			class="singleCardPrint"
			style="
				height: {cardHeight + cardGap}mm;
				width: {cardWidth + cardGap}mm;
				padding: {cardGap / 2}mm;"
		>
			<Gamecard item={card} />
		</div>
		<div
			class="singleCardPrint"
			style="
				height: {cardHeight + cardGap}mm;
				width: {cardWidth + cardGap}mm;
				padding: {cardGap / 2}mm;"
		>
			<GamecardBack item={card} />
		</div>
	{/each}
{:else}
	{#each cardSetSplit as _cardSet, i}
		<div
			class="printArea"
			style="--borderX: solid {printMarginX}mm transparent; --borderY: solid {printMarginY}mm transparent;"
		>
			<div class="pageMarker">{i + 1}/{cardSetSplit.length}</div>
			{#each _cardSet as card, i}
				<Gamecard item={card} />
				<GamecardBack item={card} />
			{/each}
		</div>
	{/each}
{/if}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
	@page {
		margin: 0;
		page-size: 210mm 50mm;
	}

	div.printArea {
		/* Page */
		--page-width: 297mm;
		--page-height: 209mm;
		width: var(--page-width) !important;
		height: var(--page-height) !important;
		box-sizing: border-box;
		padding: 0;
		position: relative;

		/* Card Layout */
		display: grid;
		grid-template-columns: repeat(auto-fill, 60mm);
		grid-template-rows: repeat(auto-fill, 90mm);
		justify-content: space-between;
		justify-items: center;

		/* Print Color Adjust */
		-webkit-print-color-adjust: exact; /* For WebKit browsers */
		print-color-adjust: exact; /* For WebKit browsers */
		color-adjust: exact; /* Standard property */
		border-top: var(--borderY);
		border-left: var(--borderX);
		border-right: var(--borderX);
		border-bottom: var(--borderY);
	}

	div.pageMarker {
		position: absolute;
		top: -8mm;
		left: -8mm;
	}

	div.singleCardPrint {
		display: grid;
		place-items: center;
		box-sizing: border-box;

		/* Page */
		page-break-before: always;

		/* Debugging */
		/* background-color: aqua; */

		/* Print Color Adjust */
		-webkit-print-color-adjust: exact; /* For WebKit browsers */
		print-color-adjust: exact; /* For WebKit browsers */
		color-adjust: exact; /* Standard property */
	}
</style>
