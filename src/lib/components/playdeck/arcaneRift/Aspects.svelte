<script lang="ts">
	import { AR_KEY } from '$lib/gameSystems';
	import { type WidgetComponentProps } from '../widget';
	import type { Aspect } from '$lib/gameSystems/ArcaneRift/ar_characters';

	// UI components
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	// Wrapper block
	import * as Block from '$lib/components/ui/block';

	let { character = $bindable() }: WidgetComponentProps = $props();

	// HEIGHT CALCULATIONS

	let borderBoxSize: ResizeObserverSize[] = $state([]);

	let containerHeight: number = $derived(borderBoxSize?.[0]?.blockSize ?? Infinity);
	const shortOnlyRowHeight = 'h-[2.5em]';
	const fullRowHeight = 'h-[4em]';

	let maxAspects = $derived(Array(character.rules[AR_KEY]?.aspects.maxAmount || 5).fill(''));
</script>

<!-- Safeguard to make sure the character has Arcane Rift mechanics -->
{#if character.mechanics.hasOwnProperty(AR_KEY)}
	<Block.Root bind:borderBoxSize>
		<Block.Title title="Aspects" />
		<Block.Listcontent>
			<!-- {#if character.mechanics[AR_KEY]?.aspects?.length == 0} -->
			{#each maxAspects as _, i}
				{@const aspect = character.mechanics[AR_KEY]?.aspects[i]}
				<div
					id="aspect-{i}"
					class="w-full
					{aspect && aspect.description.length > 0 ? fullRowHeight : shortOnlyRowHeight}"
				>
					{#if !aspect}
						<div class={shortOnlyRowHeight}>. . .</div>
					{:else}
						<p class="font-semibold">{aspect.short}</p>
						<p>{aspect.description}</p>
					{/if}
				</div>
			{/each}
			<br class="flex-grow" />
		</Block.Listcontent>
		<Block.Footer />
	</Block.Root>
{:else}
	<div class="flex h-full w-full flex-col items-center justify-center gap-4" id="{AR_KEY}:aspects">
		<span class="text-muted-foreground">Arcane Rift not configured</span>
		<hr class="w-1/2 border-obsidian-500" />
		<Button onclick={() => character.addSystem(AR_KEY)}
			><Icon icon="mdi:plus" />Add Arcane Rift</Button
		>
	</div>
{/if}
