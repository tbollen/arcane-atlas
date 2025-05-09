<script lang="ts">
	// Import Style
	import '$lib/styles/main.css';
</script>

<slot />

<style>
	:global(main section) {
		padding: var(--padding);
	}
</style>
