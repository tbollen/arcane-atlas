<script lang="ts">
	import { AR_KEY } from '$lib/gameSystems';
	import { type WidgetComponentProps } from '../widget';

	// UI components
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import Mastery from '$lib/components/partials/arcaneRift/Mastery.svelte';
	import InfoTooltip from '$lib/components/partials/InfoTooltip.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';

	import { toast } from 'svelte-sonner';

	// Wrapper block
	import * as Block from '$lib/components/ui/block';

	import {
		arcaneRiftDefaultCharacterRules,
		type Consequence,
		type Skill,
		type Characteristic
	} from '$lib/gameSystems/ArcaneRift/ar_characters';

	let { character = $bindable() }: WidgetComponentProps = $props();

	// HEIGHT CALCULATIONS

	let rules = $derived(character.rules?.[AR_KEY] || arcaneRiftDefaultCharacterRules);

	let characteristics: Record<string, Characteristic> | undefined = $derived(
		character.mechanics?.[AR_KEY]?.stats.characteristics
	);

	let skills: Record<string, Skill> | undefined = $derived(
		character.mechanics?.[AR_KEY]?.stats.skills
	);

	// SIZE & STYLE
	let borderBoxSize: ResizeObserverSize[] = $state([]);

	let height: number = $derived(borderBoxSize?.[0]?.blockSize ?? 0);
	let width: number = $derived(borderBoxSize?.[0]?.inlineSize ?? 0);

	let limitedList = $derived(height < 200);
	let compactList = $derived(height < 300);
</script>

<!-- Safeguard to make sure the character has Arcane Rift mechanics -->
{#if character.mechanics.hasOwnProperty(AR_KEY) && characteristics && skills}
	<Block.Root bind:borderBoxSize>
		<Block.Title title="Stats" />
		<Block.Content>
			<div id="Stats" class="grid grid-cols-[max-content_auto_1fr]">
				{#each Object.values(characteristics) as char}
					{@const skillAmount: number = Object.values(skills).filter((skill) => skill.characteristic == char.name).length}
					<hr class=" col-span-full my-2 border-obsidian-500 first:border-t-0" />
					<div class="col-span-full">
						<Tooltip.Provider>
							<Tooltip.Root>
								<Tooltip.Trigger class="cursor-help">
									<p class="font-semibold uppercase">{char.name}</p>
								</Tooltip.Trigger>
								<Tooltip.Content>{char.description}</Tooltip.Content>
							</Tooltip.Root>
						</Tooltip.Provider>
					</div>
					<div
						class="col-span-1 mr-4 aspect-square h-full p-2"
						style="grid-row: span {skillAmount} / span {skillAmount};"
					>
						<div
							class="flex h-full w-full items-center justify-center bg-obsidian-200 text-2xl font-semibold"
						>
							{char.value}
						</div>
					</div>
					{#each Object.values(skills) as skill}
						{#if skill.characteristic == char.name}
							<p class="pr-6 text-sm">
								<Tooltip.Provider>
									<Tooltip.Root>
										<Tooltip.Trigger class="cursor-help">
											{skill.name}
										</Tooltip.Trigger>
										<Tooltip.Content
											>{rules.stats.skills.find((s) => s.name == skill.name)
												?.description}</Tooltip.Content
										>
									</Tooltip.Root>
								</Tooltip.Provider>
							</p>
							<Mastery value={skill.value} max={rules.skills.maxMastery} />
						{/if}
					{/each}
				{/each}
			</div>
			<br class="flex-grow" />
		</Block.Content>
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
