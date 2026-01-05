<script lang="ts">
	import { AR_KEY } from '$lib/gameSystems';
	import { type WidgetComponentProps } from '../modules/widget';
	import { verbose } from '$lib/utils/feedback/verbose';

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
		type Consequence,
		consequenceSeverityExamples
	} from '$lib/gameSystems/ArcaneRift/ar_characters';
	import InfoTooltip from '$lib/components/partials/InfoTooltip.svelte';

	let { character = $bindable() }: WidgetComponentProps = $props();

	// DERIVED VALUES from RULES
	let minRoll = character.fn?.[AR_KEY]?.getMinMaxConsequenceRolls().min ?? 1;
	let maxRoll = character.fn?.[AR_KEY]?.getMinMaxConsequenceRolls().max ?? 4;
	let despairValue = maxRoll + 1;

	// HEIGHT CALCULATIONS

	let rules = $derived(
		character.rules[AR_KEY]?.consequences || arcaneRiftDefaultCharacterRules.consequences
	);

	let characterConsequences: Array<Consequence> = $derived(
		rules.map(
			(c, index) => character.mechanics[AR_KEY]?.consequences?.[index] ?? { ...c, text: '' }
		)
	);

	// SIZE & STYLE
	let borderBoxSize: ResizeObserverSize[] = $state([]);

	let height: number = $derived(borderBoxSize?.[0]?.blockSize ?? 0);
	let width: number = $derived(borderBoxSize?.[0]?.inlineSize ?? 0);

	let limitedList = $derived(height < 200);
	let compactList = $derived(height < 300);

	// DIALOG VARS
	let openAddDialog = $state(false);

	let rollNum = $state(minRoll);

	// Severity calculated from roll

	let _calcSeverity = $derived(calcSeverity(rollNum));
	let calculatedSeverity: Consequence['variant'] = $derived(_calcSeverity.variant);
	let slotsAreFull: boolean = $derived(_calcSeverity.canPlace !== true);
	let severityPlaceholder: string = $derived(
		calculatedSeverity
			? `e.g. ${
					consequenceSeverityExamples[calculatedSeverity][
						Math.floor(Math.random() * consequenceSeverityExamples[calculatedSeverity].length)
					]
				}`
			: 'Set your roll first'
	);
	let severityIndex: number | undefined = $derived(_calcSeverity.index);

	// HELPER --> NULL functions as a flag for when slots are full
	function calcSeverity(roll: number) {
		if (!character.fn?.[AR_KEY]?.findConsequenceSlotFromRoll)
			throw new Error('Character not configured for Arcane Rift properly');
		// Calculate severity
		return character.fn[AR_KEY].findConsequenceSlotFromRoll(roll);
	}

	let consequenceRoll: Consequence['roll'] = $derived(
		rollNum >= despairValue ? 'Despair' : rollNum
	);

	let consequenceText: Consequence['text'] = $state(''); // also used for Aspect Short when needed
	let aspectDescriptionText: string = $state(''); // only used when slots are full
</script>

{#snippet consequencesList(preview?: { isPreview: boolean; index?: number; advanced?: boolean })}
	<!-- {#if character.mechanics[AR_KEY]?.aspects?.length == 0} -->
	{#each characterConsequences as _consequence, i}
		<!-- Reverse order when limitedList (very low height) -->
		{@const index = characterConsequences.length - 1 - i}
		{@const consequence = characterConsequences[index]}
		{@const rule = rules[index]}

		{@const demoteInfo = character.fn?.[AR_KEY]?.checkDemoteConsequenceSlot(index)}
		{@const isNotEmpty = consequence.text.length > 0}
		{#if isNotEmpty || !limitedList}
			<div
				id="consequence-{index}"
				class=" relative grid w-full grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-x-4"
			>
				{#if preview && preview.advanced}
					<div class="row-span-2 flex flex-row gap-2">
						<!-- Remove Button -->
						<Button
							variant="destructive"
							class="aspect-square h-full"
							onclick={() => {
								const accept = window.confirm('Are you sure you want to remove this consequence?');
								if (!accept) return;
								verbose(
									() => {
										character.fn?.[AR_KEY]?.removeConsequence(index);
									},
									{
										successMessage: 'Consequence removed'
									}
								);
							}}><Icon icon="mdi:delete" /></Button
						>
						<!-- Demote Button -->
						<Button
							variant="bold"
							class="aspect-square h-full"
							disabled={!demoteInfo?.canDemote}
							tooltip={demoteInfo?.canDemote
								? `Demote consequence to "${demoteInfo?.nextVariant}"`
								: 'Cannot demote this consequence!'}
							onclick={() => {
								verbose(
									() => {
										character.fn?.[AR_KEY]?.demoteConsequence(index);
									},
									{
										successMessage: `Consequence demoted to "${demoteInfo?.nextVariant}"`
									}
								);
							}}><Icon icon="mdi:arrow-down-bold" /></Button
						>
					</div>
				{:else}
					<!-- HANDLE -->
					<div
						id="editHandle-{index}"
						class="row-span-2 w-2 overflow-hidden rounded-lg transition-all
					{preview && preview.index == index ? 'w-8 bg-threat-500 text-transparent hover:text-white' : ''}
					{isNotEmpty
							? preview?.isPreview
								? 'bg-threat-500/30 text-transparent hover:w-8 hover:bg-threat-600 hover:text-white'
								: 'bg-threat-500 text-transparent hover:w-8 hover:text-white'
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
									verbose(
										() => {
											character.fn?.[AR_KEY]?.removeConsequence(index);
										},
										{
											successMessage: 'Consequence removed'
										}
									);
								}}><Icon icon="mdi:delete" /></Button
							>
						{/if}
					</div>
				{/if}
				<!-- If compact list and consequence is empty, show a different view -->
				{#if isNotEmpty || !compactList || preview?.advanced}
					<div id="consequence-{index}-text">
						{#if isNotEmpty}
							<p class="font-semibold">{consequence.text}</p>
						{:else}
							<p class="text-muted-foreground/25">. . .</p>
						{/if}
					</div>
				{/if}
				<p
					class="text-xs
					{preview && preview.index == index
						? 'font-medium text-threat-700 underline'
						: 'text-muted-foreground/50'}"
				>
					{rule.variant}
				</p>
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
		{/if}
	{/each}
	<br class="flex-grow" />
{/snippet}

<!-- Safeguard to make sure the character has Arcane Rift mechanics -->
{#if character.mechanics.hasOwnProperty(AR_KEY)}
	<Block.Root bind:borderBoxSize>
		<Block.Title title="Consequences">
			<Button variant="ghost" onclick={() => (openAddDialog = true)}>
				<Icon icon="mdi:plus" /> Add
			</Button>
		</Block.Title>
		<Block.Listcontent>
			{@render consequencesList()}
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
			<!-- ROLL -->
			<Label for="roll">Rolled result</Label>
			<div class="flex items-center gap-2">
				<Button variant="bold" disabled={rollNum <= minRoll} onclick={() => (rollNum -= 1)}
					><Icon icon="mdi:minus" /></Button
				>
				<span class="w-28 border-t-2 border-b-2 border-obsidian-500/20 px-3 text-center"
					>{#if rollNum == despairValue}
						<DiceIcon symbol="despair" richColor />
					{:else}
						{#each { length: rollNum } as x}
							<DiceIcon symbol="failure" richColor />
						{/each}
					{/if}</span
				>
				<Button variant="bold" disabled={rollNum >= despairValue} onclick={() => (rollNum += 1)}
					><Icon icon="mdi:plus" /></Button
				>
				<Button class="ml-auto" variant="destructive" onclick={() => (rollNum = despairValue)}>
					<Icon icon="mdi:cross-circle-outline" />
					Despair
				</Button>
			</div>
			<!-- CALCULATED SEVERITY -->
			<Label for="severity">Calculated Severity</Label>
			<p class="font-semibold">
				{#if slotsAreFull}
					<!-- If slots are full! -->
					<InfoTooltip class="align-middle text-threat-500" icon="mdi:alert-circle-outline"
						>Consequence must be added as a permanent aspect instead</InfoTooltip
					>
					<span class="align-middle capitalize">{calculatedSeverity}</span> <br />

					<span class="text-sm font-medium text-threat-300">
						All valid slots are full! Add an Aspect instead</span
					>
				{:else}
					<InfoTooltip class="align-middle text-blossom-500" icon="mdi:check-circle-outline"
						>The consequence can be placed</InfoTooltip
					>
					<span class="align-middle capitalize">{calculatedSeverity}</span>
				{/if}
			</p>
			{#if !slotsAreFull}
				<!-- TEXT -->
				<Label for="text"
					>Text of your consequence <InfoTooltip
						>Write a description that matches the severity and works with your scenario</InfoTooltip
					></Label
				>
				<Input bind:value={consequenceText} placeholder={severityPlaceholder} />
			{:else}
				<!-- ADD ASPECT TEXTS -->
				<Label for="aspectShort">Aspect Short</Label>
				<Input
					bind:value={consequenceText}
					placeholder="A lasting condition that shapes your future"
				/>
				<Label for="aspectDescription"
					>Aspect Description<InfoTooltip
						>Describe how this aspect affects your character and gameplay</InfoTooltip
					></Label
				>
				<Input bind:value={aspectDescriptionText} placeholder="Description" />
			{/if}

			<!-- WIDGET PREVIEW -->
			{@render consequencesList({ isPreview: true, index: severityIndex, advanced: true })}

			{#if slotsAreFull}
				<!-- ADD ASPECT BUTTON -->
				<Button
					variant="destructive"
					disabled={consequenceText.length == 0 || aspectDescriptionText.length == 0}
					tooltip={consequenceText.length !== 0
						? aspectDescriptionText.length !== 0
							? 'Add Aspect'
							: 'Enter aspect description text'
						: 'Enter aspect short text'}
					onclick={() =>
						verbose(
							() => {
								// Add aspect to character
								character.fn?.[AR_KEY]?.addAspect({
									short: consequenceText,
									description: aspectDescriptionText
								});
								// Reset dialog values
								rollNum = minRoll;
								consequenceText = '';
								aspectDescriptionText = '';
								// Close dialog
								openAddDialog = false;
							},
							{
								successMessage: `Aspect added: ${consequenceText}`
							}
						)}
				>
					<Icon icon="mdi:plus" /> Add Aspect
				</Button>
			{:else}
				<!-- ADD BUTTON -->
				<Button
					variant="default"
					tooltip={consequenceText.length !== 0
						? calculatedSeverity
							? 'Add Consequence'
							: 'Set a valid roll first'
						: 'Enter consequence text'}
					onclick={() =>
						verbose(
							() => {
								// Add consequence to character
								character.fn?.[AR_KEY]?.addConsequenceByRoll({
									roll: consequenceRoll,
									text: consequenceText
								});
								// Reset dialog values
								rollNum = minRoll;
								consequenceText = '';
								// Close dialog
								openAddDialog = false;
							},
							{
								successMessage: `Consequence added: ${consequenceText}`
							}
						)}
					disabled={consequenceText.length == 0 || calculatedSeverity === undefined}
				>
					<Icon icon="mdi:plus" /> Add Consequence
				</Button>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
