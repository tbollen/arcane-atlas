<script lang="ts">
	import AbsoluteBackground from '$lib/components/coreComponents/AbsoluteBackground.svelte';
	import { getImageData } from '$lib/metadata/imageAttributionList';

	$: firstTimeVisit = true;
	const welcomeImage = getImageData('Pixel Art Village');
</script>

<main id="main">
	{#if firstTimeVisit}
		<section id="welcome">
			<AbsoluteBackground
				image={welcomeImage}
				background="linear-gradient(90deg, var(--color-threat-2), var(--color-weave-2))"
				colorOpacity={0.5}
				blendMode="multiply"
				opacity={0.2}
				class="ab_welcome"
			>
				<div class="displayText welcomeMessage">Welcome to the Card Builder</div>
				<div class="subText">A digital companion for building TTRPG cards</div>
			</AbsoluteBackground>
		</section>
	{/if}
</main>

<!-- Styles -->
<style>
	:global(body) {
		margin: 0;
	}

	:global(.ab_welcome) {
		/* General Layout */
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		gap: 0.5em;
		position: relative;
		/* Sizing */
		max-width: min(80svw, 800px);
		margin: 0 auto;
		padding: 2rem;
		/* Styling */
		--ab-border-radius: 2em;
		overflow: hidden;
	}

	.welcomeMessage {
		font-size: 3rem;
		text-align: center;
	}

	.subText {
		text-align: center;
	}
</style>
