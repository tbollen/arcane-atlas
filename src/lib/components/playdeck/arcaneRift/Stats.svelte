<script lang="ts">
	import { AR_KEY } from '$lib/gameSystems';
	import { type WidgetComponentProps } from '../widget';

	// UI components
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import Mastery from '$lib/components/partials/arcaneRift/Mastery.svelte';
	import InfoTooltip from '$lib/components/partials/InfoTooltip.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Dialog from '$lib/components/ui/dialog';

	import { toast } from 'svelte-sonner';

	// Wrapper block
	import * as Block from '$lib/components/ui/block';

	import {
		arcaneRiftDefaultCharacterRules,
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

	let singleRow = $derived(height < 200);

	// Get the amount of characters on the largest "skill" name in the character
	let longestSkillName: string = $derived.by(() => {
		if (!skills) return '';

		let longest = '';
		for (const skill of Object.values(skills)) {
			if (skill.name.length > longest.length) {
				longest = skill.name;
			}
		}
		return longest;
	});

	// Estimate the width needed for the skill name column. Use 16em as a minimum to avoid too small columns.
	// Approximate 0.5em per character + 1em padding
	let estimatedSkillNameWidth: string = $derived(
		`${Math.max(16, longestSkillName.length * 0.5 + 1)}em` // Approx. 0.5em per character + padding
	);

	// DIALOG
	let dialogOpen = $state(false);
</script>

<!-- SNIPPET FOR VALUE BOXES -->
{#snippet numBox(num: string | number, css: string = 'h-full aspect-square')}
	<div class="{css} flex items-center justify-center bg-obsidian-200 text-2xl font-semibold">
		{num}
	</div>
{/snippet}

<!-- Safeguard to make sure the character has Arcane Rift mechanics -->
{#if character.mechanics.hasOwnProperty(AR_KEY) && characteristics && skills}
	<!-- SNIPPET FOR CHARACTERISTIC DISPLAY /w TOOLTIP -->
	{#snippet characteristic_sn(characteristic: Characteristic)}
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger class="cursor-help">
					<p class="font-semibold uppercase">{characteristic.name}</p>
				</Tooltip.Trigger>
				<Tooltip.Content>{characteristic.description}</Tooltip.Content>
			</Tooltip.Root>
		</Tooltip.Provider>
	{/snippet}

	<!-- SNIPPET FOR SKILL DISPLAY /w TOOLTIP -->
	{#snippet skill_sn(skill: Skill)}
		<Tooltip.Provider>
			<Tooltip.Root>
				<Tooltip.Trigger class="cursor-help">
					{skill.name}
				</Tooltip.Trigger>
				<Tooltip.Content
					>{rules.stats.skills.find((s) => s.name == skill.name)?.description}</Tooltip.Content
				>
			</Tooltip.Root>
		</Tooltip.Provider>
	{/snippet}

	<!-- SNIPPET FOR FULL-STATS -->
	{#snippet fullStats()}
		<div
			id="Stats"
			class="grid gap-x-8"
			style="grid-template-columns: repeat(auto-fill,minmax({estimatedSkillNameWidth},1fr));"
		>
			{#each Object.values(characteristics) as char}
				{@const skillAmount: number = Object.values(skills).filter((skill) => skill.characteristic == char.name).length}
				<div class="grid grid-cols-[max-content_1fr_max-content] gap-x-3">
					<hr class="col-span-3 my-2 border-obsidian-500 first:border-t-0" />
					<div class="col-span-3">
						{@render characteristic_sn(char)}
					</div>
					<div
						class="col-span-1 mr-4 aspect-square h-full p-1"
						style="grid-row: span {skillAmount} / span {skillAmount};"
					>
						{@render numBox(char.value)}
					</div>
					{#each Object.values(skills) as skill}
						{#if skill.characteristic == char.name}
							<p class="block overflow-hidden pr-6 text-sm text-ellipsis whitespace-nowrap">
								{@render skill_sn(skill)}
							</p>
							<Mastery value={skill.value} max={rules.skills.maxMastery} />
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	{/snippet}

	<!-- WIDGET BLOCK -->
	<Block.Root bind:borderBoxSize>
		<Block.Title title="Stats">
			<Button variant="ghost" onclick={() => (dialogOpen = true)}>
				<Icon icon="mdi:arrow-expand" class="text-lg" />
			</Button>
		</Block.Title>
		<Block.Content>
			{#if singleRow}
				<div
					class="grid h-full w-full grid-flow-col gap-6 overflow-x-auto px-2"
					style="grid-auto-columns: minmax(max-content, 1fr);"
				>
					{#each Object.values(characteristics) as char}
						<div class="flex flex-col items-center">
							<p class="text-center text-sm">
								{@render characteristic_sn(char)}
							</p>
							{@render numBox(char.value, 'aspect-square h-16')}
						</div>
					{/each}
				</div>
			{:else}
				{@render fullStats()}
				<br class="flex-grow" />
			{/if}
		</Block.Content>
		<Block.Footer />
	</Block.Root>

	<!-- DIALOG -->
	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Content class="max-h-[95vh] min-w-fit overflow-y-auto">
			<Dialog.Header>
				<Dialog.Title>Character Stats</Dialog.Title>
			</Dialog.Header>
			{@render fullStats()}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<div class="flex h-full w-full flex-col items-center justify-center gap-4" id="{AR_KEY}:aspects">
		<span class="text-muted-foreground">Arcane Rift not configured</span>
		<hr class="w-1/2 border-obsidian-500" />
		<Button onclick={() => character.addSystem(AR_KEY)}
			><Icon icon="mdi:plus" />Add Arcane Rift</Button
		>
	</div>
{/if}
