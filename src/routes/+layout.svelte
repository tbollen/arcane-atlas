<script lang="ts" module>
	export type WidthLayout = 'mobile' | 'narrow' | 'desktop';
</script>

<script lang="ts">
	import '../app.css';

	// Svelte stuff
	import { onMount, setContext } from 'svelte';

	// Utils
	import { lsk, ck } from '$lib/utils/storage/keys';
	import { StoredCharacter } from '$lib/domain/characters/character.svelte';
	import type { User as PrismaUser } from '@prisma/client';

	// Import Style
	import '$lib/styles';
	import Navbar from '$lib/components/layout/Navbar.svelte';

	// Sonner for Toasts
	import { Toaster } from '$lib/components/ui/sonner';

	// SPINNER STUFF
	import { spinner } from '$lib/stores/loadingSpinner.svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';

	let { children, data } = $props();

	// Layout
	let viewportWidth: number = $state(0);
	let mobileLayout: boolean = $derived(viewportWidth <= 640); // Tailwind 'sm' breakpoint
	let narrowLayout: boolean = $derived(viewportWidth > 640 && viewportWidth <= 1024); // Tailwind 'md' breakpoint
	let desktopLayout: boolean = $derived(viewportWidth > 1024); // Tailwind 'lg' breakpoint
	let layout: WidthLayout = $derived(mobileLayout ? 'mobile' : narrowLayout ? 'narrow' : 'desktop');

	let navbarBorderBoxSize: ResizeObserverSize[] = $state([]);
	let navbarHeight: number = $derived(navbarBorderBoxSize[0]?.blockSize ?? 0);

	onMount(() => {
		const updateWidth = () => {
			viewportWidth = window.innerWidth;
		};

		updateWidth();
		window.addEventListener('resize', updateWidth);

		return () => {
			window.removeEventListener('resize', updateWidth);
		};
	});

	onMount(() => {
		spinner.complete(); // Always remove loading spinner when page mounts
	});
</script>

<!-- TOASTER -->
<Toaster richColors />

<!-- NAVBAR -->
<Navbar {data} {layout} bind:borderBoxSize={navbarBorderBoxSize} />
<!-- CONTENT -->
<section class="flex-grow">
	{@render children?.()}
</section>
<!-- FULL PAGE SPINNER -->
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
<!-- FOOTER -->
<footer
	class="border-t-2 border-threat-500 bg-obsidian-50 px-4 py-2
	text-center print:hidden"
	style="margin-top: {navbarHeight}px;"
>
	<p class="text-sm text-muted-foreground">© 2025 Arcane Atlas. All rights reserved.</p>
</footer>

<style>
	:global(main section) {
		padding: var(--padding);
	}

	:global(body) {
		margin: 0;
		position: relative;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
