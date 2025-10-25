<script lang="ts">
	// UI Components
	import { Header } from '$lib/components/typography/';
	import UnderConstruction from '$lib/components/partials/UnderConstruction.svelte';
	import '$lib/styles';

	import { onMount } from 'svelte';

	let { data } = $props();

	onMount(async () => {
		// DO LATER
	});
</script>

<main class="content">
	<Header variant="h1" class="mb-8">Campaign</Header>
	<UnderConstruction class="h-36">
		<Header variant="h3" tag="h2">Planned Features</Header>
		<ul class="list">
			<li>Overview of GMs and Players</li>
			<li>Game-specific cards and decks</li>
			<li>Game-specific rules</li>
		</ul>
		<Header variant="h3" tag="h2">Feature Wishlist</Header>
		<ul class="list">
			<li>Bestiary / Adversaries catalog</li>
			<li>
				...submit your ideas to <a
					class="text-threat-600 hover:underline"
					target="_blank"
					href="https://github.com/tbollen/arcane-rift-companion/issues/new">GitHub</a
				>
			</li>
		</ul>
	</UnderConstruction>
</main>
