<script lang="ts">
	import '../app.css';
	// Import Style
	import '$lib/styles/main.css';
	import Navbar from '$lib/components/layout/Navbar.svelte';

	let { children, data } = $props();
</script>

<header>
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
