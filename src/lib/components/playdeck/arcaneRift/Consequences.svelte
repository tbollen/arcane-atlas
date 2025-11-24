<script lang="ts">
	import { AR_KEY } from '$lib/gameSystems';
	import { type WidgetComponentProps } from '../widget';

	// UI components
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import DiceIcon from '$lib/components/partials/arcaneRift/DiceIcon.svelte';

	import { toast } from 'svelte-sonner';

	// Wrapper block
	import * as Block from '$lib/components/ui/block';

	import {
		arcaneRiftDefaultCharacterRules,
		type Consequence
	} from '$lib/gameSystems/ArcaneRift/ar_characters';

	let { character = $bindable() }: WidgetComponentProps = $props();

	// HEIGHT CALCULATIONS

	let rules = $derived(
		character.rules[AR_KEY]?.consequences || arcaneRiftDefaultCharacterRules.consequences
	);

	let characterConsequences: Array<Consequence> = $derived(
		rules.map(
			(c, index) => character.mechanics[AR_KEY]?.consequences?.[index] ?? { ...c, text: '' }
		)
	);

	// DIALOG VARS
	let openAddDialog = $state(false);

	let rollNum = $state(0);
	let consequenceRoll: Consequence['roll'] = $derived(rollNum > 4 ? 'Despair' : rollNum);

	let consequenceText: Consequence['text'] = $state('');
</script>

<!-- Safeguard to make sure the character has Arcane Rift mechanics -->
{#if character.mechanics.hasOwnProperty(AR_KEY)}
	<Block.Root>
		<Block.Title title="Consequences">
			<Button variant="ghost" onclick={() => (openAddDialog = true)}>
				<Icon icon="mdi:plus" /> Add
			</Button>
		</Block.Title>
		<Block.Listcontent>
			<!-- {#if character.mechanics[AR_KEY]?.aspects?.length == 0} -->
			{#each characterConsequences as consequence, i}
				{@const rule = rules[i]}
				{@const isNotEmpty = consequence.text.length > 0}
				<div
					id="consequence-{i}"
					class=" relative grid w-full grid-cols-[auto_1fr] grid-rows-2 gap-x-4"
				>
					<div
						id="editHandle-{i}"
						class="row-span-2 w-2 overflow-hidden rounded-lg transition-all {isNotEmpty
							? 'bg-threat-500 text-transparent hover:w-8 hover:text-white'
							: 'bg-muted-foreground/20'}
                        "
					>
						{#if isNotEmpty}
							<Button
								class="h-full w-full bg-inherit! text-inherit!"
								onclick={() => {
									const accept = window.confirm(
										'Are you sure you want to remove this consequence?'
									);
									if (!accept) return;
									try {
										character.fn?.[AR_KEY]?.removeConsequence(i);
										toast.success('Consequence removed');
									} catch (error) {
										const e = error as Error;
										toast.error(e.message);
									}
								}}><Icon icon="mdi:delete" /></Button
							>
						{/if}
					</div>

					<div id="consequence-{i}-text">
						{#if consequence.text.length == 0}
							<p class="text-muted-foreground">. . .</p>
						{:else}
							<p class="font-semibold">{consequence.text}</p>
							<!-- <p>{aspect.description}</p> -->
						{/if}
					</div>
					<p class="text-xs text-muted-foreground/50">{rule.variant}</p>
					<!-- ROLL -->
					<div class="absolute right-1 bottom-1 text-end text-muted-foreground/50">
						{#if rule.roll === 'Despair'}
							<DiceIcon symbol="despair" />
						{:else if typeof rule.roll === 'number'}
							{#each { length: rule.roll } as x}
								<DiceIcon symbol="failure" />
							{/each}
						{/if}
					</div>
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

<!-- ADD CONSEQUENCE DIALOG -->
<Dialog.Root bind:open={openAddDialog}>
	<Dialog.Content class="min-w-fit">
		<Dialog.Header>
			<Dialog.Title>Add new Consequence</Dialog.Title>
		</Dialog.Header>
		<div id="inputWrapper" class="flex flex-col gap-2 text-start [&>Label:not(:first-child)]:mt-6">
			<Label for="text">Text of your consequence</Label>
			<Input bind:value={consequenceText} placeholder="Stabwound in the leg" />
			<Label for="roll">Rolled result</Label>
			<div class="flex items-center gap-2">
				<Button variant="bold" disabled={rollNum <= 1} onclick={() => (rollNum -= 1)}
					><Icon icon="mdi:minus" /></Button
				>
				<span class="w-24 border-t-2 border-b-2 border-obsidian-500/20 px-3 text-center"
					>{#if consequenceRoll == 'Despair'}
						<DiceIcon symbol="despair" richColor />
					{:else}
						{#each { length: consequenceRoll } as x}
							<DiceIcon symbol="failure" richColor />
						{/each}
					{/if}</span
				>
				<Button variant="bold" disabled={rollNum >= 5} onclick={() => (rollNum += 1)}
					><Icon icon="mdi:plus" /></Button
				>
				<Button class="ml-auto" variant="destructive" onclick={() => (rollNum = 5)}>
					<Icon icon="mdi:cross-circle-outline" />
					Despair
				</Button>
			</div>
			<Button
				onclick={() => {
					try {
						if (consequenceText.length == 0) throw new Error('Consequence text cannot be empty');
						if (consequenceRoll === 0) throw new Error('Consequence roll cannot be 0');
						character.fn?.[AR_KEY]?.addConsequence({
							text: consequenceText,
							roll: consequenceRoll
						});
						// If successful, close the dialog
						openAddDialog = false;
					} catch (error) {
						const e = error as Error;
						toast.error(e.message);
					}
				}}
			>
				<Icon icon="mdi:plus" /> Add Consequence
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
