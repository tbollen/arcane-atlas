<!-- Component that adds a background to any div by placing it behind it -->
<!-- 
    @component
    Component that acts as a wrapper with a background color and image.
    #### Styling:
    You can add a custom class by using the `class` prop and adding :global(`.customClass`) to the styles.
    If you want to change the border radius, use the css variable `--ab-border-radius`.
 -->

<script lang="ts">
	import { type ImageAttribution } from '$lib/types/imageAttribution';
	
	interface Props {
		image?: ImageAttribution | undefined;
		class?: string | undefined;
		background?: string;
		colorOpacity?: number;
		opacity?: number;
		imagePosition?: string;
		blendMode?: 
		| 'normal'
		| 'multiply'
		| 'screen'
		| 'overlay'
		| 'darken'
		| 'lighten'
		| 'color-dodge'
		| 'color-burn'
		| 'hard-light'
		| 'soft-light'
		| 'difference'
		| 'exclusion'
		| 'hue'
		| 'saturation'
		| 'color'
		| 'luminosity';
		children?: import('svelte').Snippet;
	}

	let {
		image = undefined,
		class: classModifier = undefined,
		background = 'transparent',
		colorOpacity = 0.5,
		opacity = 0.5,
		imagePosition = 'initial',
		blendMode = 'normal',
		children
	}: Props = $props();

	const imageList: any = import.meta.glob(['$lib/images/*'], { as: 'url', eager: true });
	const imagePath = '/src/lib/images/' + image?.fileUrl;

	const attributionList = ['cc', 'unknown'];
	const requiresAttribution = image && attributionList.includes(image.license);
</script>

<div class="{classModifier || ''} absoluteBackground">
	{@render children?.()}
	<div class="absoluteBackground_wrapper" style:opacity>
		<div
			class="absoluteBackground_bg"
			style:mix-blend-mode={blendMode}
			style:background
			style:opacity={colorOpacity}
		></div>
		{#if image}
			<img
				class="absoluteBackground_img"
				style:object-position={imagePosition}
				src={imageList[imagePath]}
				alt={image.name}
			/>
		{/if}
	</div>
	{#if requiresAttribution && image}
		<div class="absoluteBackground_attribution">
			{#if image.webUrl}
				<svelte:element this={"a"} href={image.webUrl} target="_blank">
					image by <span class="absoluteBackground_creator">{image.creator}</span>
					<span class="absoluteBackground_license">({image.license})</span>
				</svelte:element>
			{:else}
				image by {image.creator} <span class="absoluteBackground_license">({image.license})</span>
			{/if}
		</div>
	{/if}
</div>

<style>
	.absoluteBackground {
		/* Wrapper */
		position: relative;
		min-width: 5rem;
		min-height: 2rem;
		border-radius: var(--ab-border-radius);
	}

	.absoluteBackground_bg {
		position: absolute;
		inset: 0;
		height: 100%;
		width: 100%;
		z-index: -2;
	}

	.absoluteBackground_img {
		position: absolute;
		inset: 0;
		z-index: -3;
		/* Image settings and sizing */
		object-fit: cover;
		width: 100%;
		height: 100%;
	}

	.absoluteBackground_attribution {
		position: absolute;
		content: ' ';
		z-index: 1;
		width: fit-content;
		bottom: 0.3em;
		right: calc(0.3em + var(--ab-border-radius) * 1.2);
		font-size: 0.5em;
		color: var(--color-text-2);
	}

	.absoluteBackground_attribution a {
		color: inherit;
		text-decoration: none;
	}
	span.absoluteBackground_creator {
		font-weight: bold;
	}
</style>
