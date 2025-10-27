<script lang="ts">
	import '$lib/styles/cardStyle.css';
	import { Card } from '$lib/domain/cards/card.svelte';
	import { StoredCard } from '$lib/domain/cards/cardStore.svelte';
	interface Props {
		card: StoredCard | Card;
		nameOnBack?: boolean;
	}

	let { card, nameOnBack = false }: Props = $props();

	const fallbackImageUrl = '/images/pixel_sword.png';
	let src = $derived(card.image?.url || fallbackImageUrl);
	let alt = $derived(card.name || 'Sword PNGs by Vecteezy');
</script>

<div
	class="card"
	style="border-color: {card.style.color.cardBorder}; background-color: {card.style.color
		.background};"
>
	<div
		class="imgWrapper"
		style="border-color: {card.style.color.cardBorder}; background-color: {card.style.color
			.imageBackground}; "
	>
		{#if nameOnBack}
			<div class="cardName">{card.name}</div>
		{/if}
		<div
			class="imgEditBox"
			style="height: {card.image?.scale}%; width: {card.image?.scale}%; top: calc(50% + {card.image
				?.y_offset}%); left: calc(50% + {card.image
				?.x_offset}%);  transform: translate(-50%, -50%) rotate({card.image.rotation}deg);"
		>
			<img {src} alt={card.name} />
			{#if src === fallbackImageUrl}
				<a
					target="_blank"
					class=" absolute right-0 bottom-0 text-[9px] text-muted-foreground hover:underline"
					href="https://www.vecteezy.com/free-png/sword">Sword PNGs by Vecteezy</a
				>
			{/if}
		</div>
	</div>
</div>

<style>
	.imgWrapper {
		position: relative;
		border: var(--border);
		height: 100%;
		width: 100%;
		box-sizing: border-box;
		overflow: hidden;
	}

	.imgEditBox {
		--rotation: 0deg;
		position: absolute;
		top: 50%;
		left: 50%;
	}

	.cardName {
		position: absolute;
		bottom: top;
		padding: 0.3em;
		max-width: 100%;
		text-align: center;
		font-weight: bold;
		font-size: 14pt;
	}

	img {
		height: 100%;
		width: 100%;
		object-fit: contain;
	}
</style>
