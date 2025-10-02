<script lang="ts">
	// Import Style
	import '$lib/styles/main.css';
	import Navbar from '$lib/partials/Navbar.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<header>
	<Navbar />
</header>
{@render children?.()}

<style>
	:global(main section) {
		padding: var(--padding);
	}

	:global(body) {
		margin: 0;
	}
</style>
