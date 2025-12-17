<script lang="ts">
	import { type WidgetComponentProps } from '../modules/widget';

	// Import partial wrapper
	import * as Block from '$lib/components/ui/block';

	// UI components
	import Gamecard from '$lib/components/partials/gamecards/Gamecard.svelte';
	import GamecardBack from '$lib/components/partials/gamecards/GamecardBack.svelte';
	import { Button } from '$lib/components/ui/button';
	import Icon, { iconExists } from '@iconify/svelte';

	// Dialog
	import GamecardModal from '$lib/components/partials/gamecards/GamecardModal.svelte';

	// Toast
	import { toast } from 'svelte-sonner';

	// Domains, classes and more...
	import { cardTypes } from '$lib/domain/cards/cardTypes';

	// API
	import CARD_API from '$lib/utils/api/cards_api';

	// Svelte
	import { onMount, type ComponentProps } from 'svelte';

	// Dialog vars
	let dialogCard: ComponentProps<typeof GamecardModal>['card'] = $state(undefined);
	let open: boolean = $state(false);

	let { character = $bindable(), cards }: WidgetComponentProps = $props();
</script>

<!-- 
<div class="flex h-full w-full flex-col gap-1 overflow-auto bg-obsidian-500/5">
	<Header variant="h3">Description</Header>
	<p class="overflow-auto text-muted-foreground">{character.description}</p>
</div> -->

<Block.Root>
	<Block.Title title="Cards" />
	<Block.Content>
		<div class="mb-4 flex flex-row flex-wrap gap-1 overflow-y-auto">
			{#if !cards || cards.length === 0}
				<p class="text-sm text-muted-foreground">No game cards available.</p>
			{:else}
				{#each cards as card, index}
					{@const cardType = cardTypes.find((type) => type.name === card.type) || cardTypes[0]}
					{@const icon = card.icon && iconExists(card.icon) ? card.icon : cardType.icon}
					{#if index > 0}
						<hr class="w-full border-t border-obsidian-500/20" />
					{/if}
					<div class="flex w-full items-center py-1">
						<button
							class="
						grid
						w-full
						cursor-pointer grid-cols-[auto_1fr] items-center justify-items-start
						gap-x-1
						rounded-md
						hover:bg-obsidian-500/10
						"
							onclick={() => {
								dialogCard = card;
								open = true;
							}}
						>
							<div class="row-span-2 p-2">
								<Icon {icon} class="h-6 w-6" style="color: {card.style.color.icon};" />
							</div>
							<p
								class=" w-full max-w-full overflow-hidden text-left leading-tight font-semibold overflow-ellipsis whitespace-nowrap"
								style="font-family: '{card.style.font.name}', 'Gotham', sans-serif;"
							>
								{card.name}
							</p>
							<p
								class=" max-w-full overflow-hidden text-left text-sm overflow-ellipsis whitespace-nowrap text-muted-foreground"
							>
								{card.subtitle}
							</p>
						</button>
						<Button
							class="
						not-hover:w-4!
						not-hover:p-0!
						not-hover:text-transparent
						hover:w-8
						hover:text-white
						"
							variant="destructive"
							onclick={(e: Event) => {
								const confirmed = confirm(
									`Are you sure you want to remove the card "${card.name}" from character "${character.name}"?`
								);
								if (confirmed) {
									CARD_API.removeFromCharacter({
										characterId: character.id,
										cards: [card.id]
									})
										.then(() => {
											// Remove card from local list
											cards && (cards = cards.filter((c) => c.id !== card.id));
										})
										.catch((error) => {
											toast.error(
												`Failed to remove card "${card.name}" from character: ${error.message}`
											);
										});
									toast.success(`Removed card "${card.name}" from character.`);
								}
							}}
						>
							<Icon icon="mdi:remove" />
						</Button>
					</div>
				{/each}
			{/if}
		</div>
	</Block.Content>
	<Block.Footer />
</Block.Root>

<GamecardModal bind:open card={dialogCard} />
