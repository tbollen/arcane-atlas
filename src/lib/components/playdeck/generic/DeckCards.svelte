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
	import { StoredCard } from '$lib/domain/cards/cardStore.svelte';

	// API
	import CARD_API from '$lib/utils/api/cards_api';

	// Svelte
	import { onMount, type ComponentProps } from 'svelte';
	import { goto } from '$app/navigation';

	// Dialog vars
	let dialogCard: ComponentProps<typeof GamecardModal>['card'] = $state(undefined);
	let open: boolean = $state(false);

	let { character = $bindable(), cards }: WidgetComponentProps = $props();

	// Filter cards to only those belonging to this character
	let characterCards = $derived(cards ? cards.filter((card) => card?.isCharacterCard) : []);

	// Layout and size
	let borderBoxSize: ResizeObserverSize[] = $state([]);
	let height: number = $derived(borderBoxSize?.[0]?.blockSize ?? Infinity);

	let showCompact: boolean = $derived(cards ? cards.length > 1 && height < 200 : height < 300);

	// Remove function
	function removeCardFromCharacter(card: StoredCard) {
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
					toast.error(`Failed to remove card from character: ${error.message}`);
				});
			toast.success(`Removed card from character.`);
			// Close dialog if open
			open = false;
		}
	}
</script>

<Block.Root bind:borderBoxSize>
	<Block.Title title="Cards" />
	<Block.Content>
		{#if !characterCards || characterCards.length === 0}
			<div class="mb-4 flex h-full flex-col items-center justify-center gap-2">
				<p class="text-sm text-muted-foreground">
					No cards assigned to <strong>{character.name}</strong>.
				</p>
				<Button href="/cards" variant="bold" size="sm">
					<Icon icon="mdi:cards-outline" class="mr-2" /> Manage Cards
				</Button>
			</div>
		{:else}
			<div class="mb-4 flex flex-row flex-wrap gap-1 overflow-y-auto">
				{#each characterCards as card, index}
					{@const cardType = cardTypes.find((type) => type.name === card.type) || cardTypes[0]}
					{@const icon = card.icon && iconExists(card.icon) ? card.icon : cardType.icon}
					{#if index > 0}
						<hr class="w-full border-t border-obsidian-500/20" />
					{/if}
					{#if showCompact}
						<button
							class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md py-1 hover:bg-obsidian-500/10"
							onclick={() => {
								dialogCard = card;
								open = true;
							}}
						>
							<Icon {icon} class="h-5 w-5" style="color: {card.style.color.icon};" />
							<p
								class=" w-full max-w-full overflow-hidden text-left leading-tight font-semibold overflow-ellipsis whitespace-nowrap"
								style="font-family: '{card.style.font.name}', 'Gotham', sans-serif;"
							>
								{card.name}
							</p>
						</button>
					{:else}
						<div class="flex w-full items-center py-1">
							<button
								class="
						grid
						w-full cursor-pointer grid-cols-[auto_1fr] items-center
						justify-items-start
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
								onclick={() => {
									removeCardFromCharacter(card);
								}}
							>
								<Icon icon="mdi:remove" />
							</Button>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</Block.Content>
	<Block.Footer />
</Block.Root>

<!-- Modal for enlarging -->
<GamecardModal
	bind:open
	card={dialogCard}
	functions={{
		removeFromCharacter:
			dialogCard instanceof StoredCard
				? (dialogCard) => removeCardFromCharacter(dialogCard as StoredCard)
				: undefined,
		edit:
			dialogCard instanceof StoredCard
				? (dialogCard) => {
						goto(`/cards/${dialogCard.id}?edit=true`);
					}
				: undefined,
		navigate:
			dialogCard instanceof StoredCard
				? (dialogCard) => {
						goto(`/cards/${dialogCard.id}`);
					}
				: undefined
	}}
/>
