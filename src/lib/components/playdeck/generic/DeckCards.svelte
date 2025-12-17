<script lang="ts">
	import { type WidgetComponentProps } from '../modules/widget';

	// Import partial wrapper
	import * as Block from '$lib/components/ui/block';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import Gamecard from '$lib/components/partials/gamecards/Gamecard.svelte';
	import GamecardBack from '$lib/components/partials/gamecards/GamecardBack.svelte';

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
		<ul>
			{#each cards as card}
				<li class="mb-4">
					{card.name}
				</li>
			{/each}
			{#if character.cardIds.length === 0}
				<p class="text-sm text-muted-foreground">No game cards available.</p>
			{/if}
		</ul>
	</Block.Content>
	<Block.Footer />
</Block.Root>
