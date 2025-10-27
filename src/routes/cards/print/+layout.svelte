<script lang="ts">
	// Import Style
	import '$lib/styles/main.css';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

{@render children?.()}

<style>
	:global(main section) {
		padding: var(--padding);
	}
</style>
