<script lang="ts">
	// TYPES
	import { StoredCard } from '$lib/domain/cards/cardStore.svelte';
	import type { Card } from '$lib/domain/cards/card.svelte';
	import { type User as PrismaUser } from '@prisma/client';

	// UI components
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Header } from '$lib/components/typography';

	// Gamecard components
	import Gamecard from '$lib/components/partials/gamecards/Gamecard.svelte';
	import GamecardBack from '$lib/components/partials/gamecards/GamecardBack.svelte';
	import EditButtons from '$lib/components/partials/gamecards/EditButtons.svelte';

	// Svelte
	import { goto } from '$app/navigation';
	import type { ComponentProps } from 'svelte';

	// Improted functions
	import { downloadCards } from '$lib/utils/cards/download';

	// PROPS
	let {
		card,
		open = $bindable(false),
		user,
		functions
	}: {
		card: StoredCard | Card | undefined;
		open: boolean;
		user: PrismaUser | null;
		functions?: ComponentProps<typeof EditButtons>['functions'];
	} = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
		<Dialog.Content class="w-max! max-w-[90vw]! border-0 bg-transparent shadow-none">
			{#if card}
				<header class="border-b-4 border-threat-500 bg-background/80 p-3">
					<Header variant="h2">{card.name}</Header>
					{#if card instanceof StoredCard}
						<code class="text-sm text-muted-foreground">{card.id}</code>
					{/if}
				</header>
				<div id="cardWrapper" class="flex flex-row flex-wrap gap-10">
					<Gamecard {card} />
					<GamecardBack {card} />
				</div>
				{#if card instanceof StoredCard}
					<footer>
						<!-- BUTTONS -->
						<EditButtons
							class="m-4 flex justify-end"
							{card}
							functions={{
								navigate: (card) => {
									goto(`/cards/${card.id}`);
								},
								download: (card) => {
									downloadCards([card]);
								},
								edit: (card) => {
									goto(`/cards/${card.id}?edit=1`);
								}
							}}
							{user}
						/>
					</footer>
				{/if}
			{:else}
				<div class="p-4">
					<p class="text-center">No card data available.</p>
					<div class="mt-4 flex justify-center">
						<Button onclick={() => (open = false)}>Close</Button>
					</div>
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
