<script lang="ts">
	import { type WidgetComponentProps } from '../widget';

	// Import partial wrapper
	import * as Block from '$lib/components/ui/block';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import Gamecard from '$lib/components/partials/gamecards/Gamecard.svelte';
	import GamecardBack from '$lib/components/partials/gamecards/GamecardBack.svelte';

	let { character = $bindable() }: WidgetComponentProps = $props();
</script>

<!-- 
<div class="flex h-full w-full flex-col gap-1 overflow-auto bg-obsidian-500/5">
	<Header variant="h3">Description</Header>
	<p class="overflow-auto text-muted-foreground">{character.description}</p>
</div> -->

<Block.Root>
	<Block.Title title="Cards" />
	<Block.Content>
		<p class="overflow-auto text-muted-foreground">This is a placeholder</p>
		<ul>
			{#each character.cardIds as cardId}
				<li class="mb-4">
					{cardId}
				</li>
			{/each}
			{#if character.cardIds.length === 0}
				<p class="text-sm text-muted-foreground">No game cards available.</p>
			{/if}
		</ul>
	</Block.Content>
	<Block.Footer />
</Block.Root>
