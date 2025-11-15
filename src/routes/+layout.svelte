<script lang="ts">
	import '../app.css';

	// Svelte stuff
	import { onMount, setContext } from 'svelte';

	// Utils
	import { lsk, ck } from '$lib/utils/storage/keys';
	import type { CharacterID } from '$lib/domain/';
	import { StoredCharacter } from '$lib/domain/characters/character.svelte';
	import type { PrismaCharacterExtended } from '$lib/domain/characters/character.svelte.js';
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

	onMount(() => {
		spinner.complete(); // Always remove loading spinner when page mounts

		// Set active character in Context
		// If user is logged in
		if (data.user) {
			const user = data.user as PrismaUser;
			// Format all user's characters
			const clientCharacters: StoredCharacter[] = data.characters.map((c) =>
				StoredCharacter.fromPrisma({ character: c, user })
			);
			// Get active character from localStorage (perisitent)
			const activeCharacterID = localStorage.getItem(lsk.activeCharacter);

			// Set active character
			const activeCharacter: StoredCharacter | undefined = clientCharacters.find(
				(c) => c.id === activeCharacterID
			);

			// Set in Context
			setContext<StoredCharacter | undefined>(ck.activeCharacter, activeCharacter);
		}
	});
</script>

<!-- TOASTER -->
<Toaster richColors />

<!-- CONTENT -->
<header class="sticky top-0 z-1 print:hidden">
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
