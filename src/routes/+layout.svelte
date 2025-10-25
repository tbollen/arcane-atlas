<script lang="ts">
	import '../app.css';
	// Import Style
	import '$lib/styles';
	import Navbar from '$lib/components/layout/Navbar.svelte';

	// SPINNER STUFF
	import { spinner } from '$lib/stores/loadingSpinner.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { onMount } from 'svelte';

	let { children, data } = $props();

	onMount(() => {
		spinner.complete(); // Always remove loading spinner when page mounts
	});
</script>

<header class="sticky top-0 z-1">
	<Navbar {data} />
</header>
{@render children?.()}
{#if spinner.isLoading && spinner.id === 'full'}
	<div
		class="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3.5 bg-primary/80"
		aria-busy="true"
	>
		<Spinner class="size-36 text-background" />
		{#if spinner.message}
			<p class="text-3xl text-background">{spinner.message}</p>
		{/if}
	</div>
{/if}

<style>
	:global(main section) {
		padding: var(--padding);
	}

	:global(body) {
		margin: 0;
	}
</style>
