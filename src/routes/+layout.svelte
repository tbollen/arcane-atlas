<script lang="ts">
	// Import Style
	import '$lib/styles/main.css';
	import Navbar from '$lib/partials/Navbar.svelte';
</script>

<header>
	<Navbar />
</header>
<slot />

<style>
	:global(main section) {
		padding: var(--padding);
	}
</style>
