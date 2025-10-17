<script lang="ts">
	import { getImageData } from '$lib/metadata/imageAttributionList';

	let firstTimeVisit = $derived(true);
	const welcomeImage = getImageData('Pixel Art Village');
</script>

<main id="main">
	<section id="welcome">
		<div id="titleWrapper" class="">
			<h1 id="title" class="displayText bg-obsidian-800 text-secondary">Arcane Companion</h1>
			<div id="subtitle">A digital companion for building TTRPG cards</div>
		</div>
	</section>
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

	#titleWrapper {
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
		/* Styling */
		overflow: hidden;
	}

	#title {
		font-size: 3rem;
		text-align: center;
		padding: 0.2em;
		width: 100%;
	}
</style>
