<script lang="ts">
	// Import UI components
	import { Header } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';

	// Import Partials
	import KofiButton from '$lib/components/partials/branded/kofiButton.svelte';
	import GithubRepoButton from '$lib/components/partials/branded/GithubRepoButton.svelte';

	let { data } = $props();
</script>

<main class="content" id="main">
	<Header variant="h1" class="displayText bg-obsidian-800 p-4 text-center text-5xl text-secondary"
		>Arcane Atlas</Header
	>
	<Header variant="subtitle" class="mb-4">An open-source companion app for TTRPGs</Header>
	<p>
		Arcane Atlas is an open-source companion app for TTRPGs by
		<em>Thomas Bollen</em>. It is designed to help players and game masters during play.
	</p>
	<br />
	<p class="mb-8">
		It began as an online tools for creating standardized spell, weapon and item cards, but is
		growing to be much more! The goal is to create a simple and easy-to-use app that can be used
		during game sessions to quickly access important information, or prepare for the next adventure.
	</p>
	{#if data.user === null}
		<p class="mb-4">To get started, please log in or create an account.</p>
		<Button href="/login" variant="bold" class="mr-4">Log in</Button>
		<Button href="/login?register=true" variant="secondary">Create account</Button>
	{/if}
	<Header variant="h2" id="supportUs">Support this project</Header>
	<p class="mb-4">
		If you like this project, conside supporting it by donating or contributing on Github! Any
		ideas, suggestions or feedback is welcome!
	</p>
	<div class="mb-8 flex flex-row gap-4">
		<KofiButton />
		<GithubRepoButton />
	</div>
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
