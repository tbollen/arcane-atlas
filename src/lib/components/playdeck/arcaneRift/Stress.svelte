<script lang="ts">
	import { AR_KEY } from '$lib/gameSystems';
	import { type WidgetComponentProps } from '../widget';
	import { verbose } from '$lib/utils/feedback/verbose';

	// UI components
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import DiceIcon from '$lib/components/partials/arcaneRift/DiceIcon.svelte';

	// Wrapper block
	import * as Block from '$lib/components/ui/block';

	import {
		arcaneRiftDefaultCharacterRules,
		type Consequence
	} from '$lib/gameSystems/ArcaneRift/ar_characters';

	let { character = $bindable() }: WidgetComponentProps = $props();

	// HEIGHT CALCULATIONS

	let rules = $derived(
		character.rules[AR_KEY]?.stressTracks || arcaneRiftDefaultCharacterRules.stressTracks
	);

	// SIZE & STYLE
	let borderBoxSize: ResizeObserverSize[] = $state([]);

	let height: number = $derived(borderBoxSize?.[0]?.blockSize ?? 0);
	let width: number = $derived(borderBoxSize?.[0]?.inlineSize ?? 0);

	let superSlim = $derived(height < 100);
	let narrowLayout = $derived(width < 300 || superSlim);
</script>

<!-- Safeguard to make sure the character has Arcane Rift mechanics -->
{#if character.mechanics.hasOwnProperty(AR_KEY) && character.mechanics[AR_KEY]?.stressTracks}
	<Block.Root bind:borderBoxSize>
		{#if !superSlim}
			<Block.Title title="Stress" />
		{/if}
		<Block.Content>
			{@render stressTracks()}
		</Block.Content>
		{#if !superSlim}
			<Block.Footer />
		{/if}
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

{#snippet stressTracks()}
	{#if character.mechanics.hasOwnProperty(AR_KEY) && character.mechanics[AR_KEY]?.stressTracks}
		<div class="grid grid-cols-[max-content_auto] items-center gap-x-4 gap-y-2">
			{#each character.mechanics[AR_KEY].stressTracks as stressTrack}
				{@const isNotEmpty = stressTrack.value > 0}
				<p class="font-semibold uppercase">{stressTrack.variant}</p>
				<div id="trackButtons-{stressTrack.variant}" class="flex flex-row gap-1">
					{#each { length: rules.maxAllowed } as slot, index}
						{@const isFilled = stressTrack.value > index}
						<button
							aria-label="Toggle {stressTrack.variant} stress to {index + 1}"
							onclick={() =>
								verbose(() => {
									let targetValue = index + 1 === stressTrack.value ? index : index + 1;
									character.fn?.[AR_KEY]?.setStressTrackValue(stressTrack.variant, targetValue);
								})}
							disabled={index + 1 > stressTrack.max}
							class="m-1 flex aspect-square h-[0.8em] cursor-pointer flex-col items-center justify-center border-2 border-obsidian-500
								transition-all
								disabled:opacity-25
								{narrowLayout ? 'text-[1.5rem]' : 'text-[2.5em]'}
								{isFilled ? 'bg-threat-600/15 hover:bg-threat-600/25' : 'bg-transparent hover:bg-obsidian-500/10'}
								disabled:cursor-not-allowed
							"
						>
							<DiceIcon
								symbol="failure"
								class="leading-4 hover:text-threat-600/15
									{isFilled ? 'text-threat-600' : 'text-transparent'}"
								tooltip={false}
							/>
						</button>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
{/snippet}
