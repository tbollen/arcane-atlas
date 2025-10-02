<script lang="ts">

	import '$lib/styles/cardStyle.css';
	interface Props {
		item: any;
		nameOnBack?: boolean;
	}

	let { item, nameOnBack = false }: Props = $props();

	let src =
		$derived(item.image?.url ||
		'https://64.media.tumblr.com/6d54812f7cd2e4ef1edce4b0f4c2ea2f/d234e2e2d3d0be5b-3d/s1280x1920/7db18f6c90f00e81f45f79ba20a30c464528b85e.jpg');
</script>

<div
	class="card"
	style="border-color: {item.style.color.cardBorder}; background-color: {item.style.color
		.background};"
>
	<div
		class="imgWrapper"
		style="border-color: {item.style.color.cardBorder}; background-color: {item.style.color
			.imageBackground}; "
	>
		{#if nameOnBack}
			<div class="cardName">{item.name}</div>
		{/if}
		<div
			class="imgEditBox"
			style="height: {item.image?.scale}%; width: {item.image?.scale}%; top: calc(50% + {item.image
				?.y_offset}%); left: calc(50% + {item.image
				?.x_offset}%);  transform: translate(-50%, -50%) rotate({item.image.rotation}deg);"
		>
			<img {src} alt={item.name} />
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
