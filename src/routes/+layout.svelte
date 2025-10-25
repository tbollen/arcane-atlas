<script lang="ts">
	import '../app.css';
	// Import Style
	import '$lib/styles/main.css';
	import Navbar from '$lib/components/layout/Navbar.svelte';

	let { children, data } = $props();
</script>

<header class="sticky top-0 z-1">
	<Navbar {data} />
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
