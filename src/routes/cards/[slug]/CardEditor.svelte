<script lang="ts">
	// Core Components
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import Accordion from '$lib/components/coreComponents/Accordion.svelte';

	// ShadCN UI
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import * as Select from '$lib/components/ui/select';
	import * as Dialog from '$lib/components/ui/dialog';

	// Import StoredCard for reference
	import { type StoredCard } from '$lib/domain/cards/cardStore.svelte';

	// Popup & Tooltips
	import renderMarkdown from '$lib/utils/rendering/renderDiceIconsInText';

	// Import card types for editing options
	import { cardTypes } from '$lib/domain/cards/cardTypes';
	import Icon, { iconExists, loadIcon } from '@iconify/svelte';
	import { cardStylePresets, defaultCardStyle } from '$lib/domain/cards/cardStylePresets';
	import { suggestedColors } from '$lib/styles/script/colorScheme';
	import { availableFonts } from '$lib/styles/script/fonts';

	// Get charactersistics and skills
	import { skillList, characteristics } from '$lib/gameSystems/ArcaneRift/ar_skillCheckList';

	// Advanced Mode for more flexible editing
	import { advancedMode } from '$lib/stores/advancedMode';

	// Path for href
	import { base } from '$app/paths';

	// Iconify
	function loadIconFromIconify(icon: string | undefined) {
		//wait for mount
		if (icon == undefined) return;
		if (iconExists(icon)) return;
		loadIcon(icon);
	}

	//

	// Button to add new fields
	import { onMount } from 'svelte';

	///////////////////
	// Get Card here //
	///////////////////
	interface Props {
		card: StoredCard;
		isOwner: boolean;
	}
	let { card = $bindable(), isOwner = $bindable() }: Props = $props();

	// Get permissions

	///////////////////////////////////////
	// Get the Game System and Mechanics //
	///////////////////////////////////////
	import { gameSystems, type SystemKey } from '$lib/gameSystems';
	import { arcaneRiftMechanics } from '$lib/gameSystems/ArcaneRift/ar_cards';
	import { AR_KEY } from '$lib/gameSystems';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	// TODO: make dynamic and fix. Currently this is the only system so it works fine...
	let activeSystem: SystemKey = $state(card.systems.includes(AR_KEY) ? AR_KEY : 'generic'); //TODO: make dynamic based on a global value (store or session)
	let activeSystemInfo = $derived(Object.keys(gameSystems).find((sysId) => sysId === activeSystem));
	let _cardSystemsMessenger: SystemKey[] = $state(card.systems); // Used for selector and UI components
	//////////////////////////////

	function updateCardSystems() {
		// check if all values of the messenger are valid System Keys
		if (
			!_cardSystemsMessenger.every((system: SystemKey) =>
				Object.keys(gameSystems).find((sysId) => sysId === activeSystem)
			)
		)
			throw new Error('Invalid System Key');

		// Update the card systems identifiers
		card.systems = _cardSystemsMessenger;
		// Add necessary (empty) mechanics
		card.mechanics[AR_KEY] = arcaneRiftMechanics;
		// Set Active System to generic if current system is removed
		if (!card.systems.includes(activeSystem)) {
			activeSystem = card.systems[0];
		}
	}

	function updateCard() {
		// Tell parent to update item
	}

	function presetToCustom() {
		card.useStylePreset('custom');
	}

	////////////////////////////////////
	// Arcane Rift specific functions //
	////////////////////////////////////

	let hasCheck: boolean = $derived(card.mechanics[AR_KEY] !== undefined);

	let selectedSkill: (typeof characteristics)[number] | undefined = $state(
		card.mechanics[AR_KEY]?.check?.skill
	);
	let selectedChar: keyof typeof skillList | undefined = $state(
		card.mechanics[AR_KEY]?.check?.characteristic
	);

	function AR_updateSkill(priority?: 'char' | 'skill') {
		if (card.mechanics[AR_KEY] == undefined) throw new Error('Arcane Rift Mechanics not found');

		if (selectedChar == undefined && selectedSkill == undefined) {
			// Set to undefined (empty / none)
			return (card.mechanics[AR_KEY].check = { characteristic: undefined, skill: undefined });
		}
		if (priority == 'skill' && selectedSkill != undefined) {
			// Find the characteristic where one of the skills matches the selectedSkill
			selectedChar = Object.keys(skillList).find((char) =>
				skillList[char as keyof typeof skillList].some((skill) => skill == selectedSkill)
			) as keyof typeof skillList;
			// Set the characteristic
			return (card.mechanics[AR_KEY].check = {
				characteristic: selectedChar,
				skill: selectedSkill
			});
		}
		if (priority == 'char' && selectedChar != undefined) {
			// Check if the matched skill is already in the selected characteristic
			const skillMatches: boolean = skillList[selectedChar as keyof typeof skillList].includes(
				selectedSkill ?? ''
			);
			selectedSkill = skillMatches
				? selectedSkill
				: skillList[selectedChar as keyof typeof skillList][0];
			return (card.mechanics[AR_KEY].check = {
				characteristic: selectedChar,
				skill: selectedSkill
			});
		}
	}

	function resetSkill() {
		if (!hasCheck) return;
		Object.assign(card.mechanics, {
			[AR_KEY]: {
				check: { characteristic: undefined, skill: undefined }
			}
		});
	}

	// Style components for looping
	const availableColorOptions = Object.keys(card.style.color) as (keyof typeof card.style.color)[];
	const availableFontOptions = Object.keys(card.style.font) as (keyof typeof card.style.font)[];
	const availableFontSizeOptions = Object.keys(
		card.style.fontsize
	) as (keyof typeof card.style.fontsize)[];

	let mounted = false;
	onMount(() => {
		loadIconFromIconify(card.icon);
		mounted = true;
	});
</script>

<div id="editFields">
	<!-- <hr class="divider" /> -->
	<!-- Editing Options -->
	<!-- Editing -->
	<!-- Main Fields -->
	<Accordion>
		{#snippet head()}
			<div>Card Info</div>
		{/snippet}
		{#snippet content()}
			<div class="inputGrid">
				<!-- Name -->
				<Label for="name">Name</Label>
				<Input
					type="text"
					id="name"
					oninput={updateCard}
					bind:value={card.name}
					placeholder="Name"
				/>
				<hr />
				<!-- Subtitle -->
				<Label for="subtitle">Subtitle</Label>
				<Input type="text" id="subtitle" bind:value={card.subtitle} placeholder="Subtitle" />
				<hr />
				<!-- Description -->
				<Label for="description">Description</Label>
				<Textarea
					name="description"
					id="description"
					rows={3}
					placeholder="Edit the description here"
					bind:value={card.description}
				></Textarea>
				<p class="useTip col-span-full text-sm text-muted-foreground">
					You can add dice icons like such '[pr]' = {@html renderMarkdown('[pr]')}
					<a href="{base}/about">click here</a> for more info
				</p>
				<hr />
				<!-- Type -->
				<Label for="type">Type</Label>
				<Select.Root type="single" name="type" bind:value={card.type}>
					<Select.Trigger class="w-[180px]">{card.type}</Select.Trigger>
					<Select.Content>
						{#each cardTypes as cardType}
							<Select.Item value={cardType.name}>{cardType.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<!-- Icon Override -->
				{#if $advancedMode}
					<hr />
					<Label for="iconOverride">
						<Icon class="advancedIcon" icon="memory:anvil" />
						Icon
					</Label>
					<Input
						type="text"
						id="iconOverride"
						class={!iconExists(card?.icon || '') ? 'warning' : ''}
						bind:value={card.icon}
						oninput={() => loadIconFromIconify(card.icon)}
						placeholder={cardTypes.find((type) => type.name == card.type)?.icon ||
							'Icon from Iconify'}
					/>
				{/if}
			</div>
		{/snippet}
	</Accordion>
	<!-- END -->
	<hr class="divider" />
	<!-- Mechanics -->
	<Accordion>
		{#snippet head()}
			<div>Mechanics</div>
		{/snippet}
		{#snippet content()}
			<div class="mainFields">
				<div class="columns-3xs gap-y-3">
					<!-- Active System Setter -->
					<Select.Root type="single" bind:value={activeSystem} name="systems">
						<Select.Trigger class="w-full justify-between"
							><span
								><small>System:</small>
								{gameSystems[activeSystem].name}
							</span>
						</Select.Trigger>
						<Select.Content>
							{#each Object.entries(gameSystems) as [id, sys]}
								<Select.Item disabled={!card.systems.includes(id as SystemKey)} value={id}
									>{sys.name}{!card.systems.includes(id as SystemKey)
										? ' (disabled)'
										: ''}</Select.Item
								>
							{/each}
						</Select.Content>
					</Select.Root>
					<!-- System enabler -->
					<Select.Root
						type="multiple"
						bind:value={_cardSystemsMessenger}
						name="systems"
						onOpenChange={updateCardSystems}
					>
						<Select.Trigger class="w-full">Enable game systems</Select.Trigger>
						<Select.Content>
							<Select.Group>
								{#each Object.entries(gameSystems) as [id, sys]}
									<Select.Item disabled={sys.locked} value={id}
										>{sys.name}{sys.locked ? ' (Always Enabled)' : ''}</Select.Item
									>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
				</div>
				<!-- Arcane Rift -->
				<!-- The card has AR as system, it is the active system and it is not undefined in the card mechanics -->
				{#if card.systems.includes(AR_KEY) && activeSystem == AR_KEY && typeof card.mechanics[AR_KEY] !== 'undefined'}
					<!-- If the active system is Arcane Rift -->
					<!-- Aspects -->
					{#if card.mechanics[AR_KEY].aspects?.length > 0}
						<h1 class="category">Aspects</h1>
						<div class="fieldList">
							{#each card.mechanics[AR_KEY].aspects as aspect, i}
								<div class="fieldItem">
									<Label for="aspect-{i}-name">Name</Label>
									<Input type="text" id="aspect-{i}-name" bind:value={aspect.short} />
									<Label for="aspect-{i}-description">Description</Label>
									<Textarea
										name="description"
										id="aspect-{i}-description"
										rows={2}
										placeholder="Edit the description here"
										bind:value={aspect.description}
									></Textarea>
									<div class="fieldButtons">
										<Button
											color="plain"
											size="icon"
											variant="destructive"
											onclick={() => card.mechanics[AR_KEY]?.aspects.splice(i, 1)}
										>
											<Icon icon="mdi:trash" />
										</Button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
					<hr />
					<Button
						onclick={() =>
							card.mechanics[AR_KEY]?.aspects.push({ short: 'aspect', description: 'edit me' })}
					>
						<Icon icon="mdi:plus" />
						Add aspect
					</Button>
					<h1 class="category">Skill Check</h1>
					<div class="fieldItem">
						<!-- Characteristic -->
						<Label for="characteristic">Characteristic</Label>
						<Select.Root
							type="single"
							name="characteristic"
							bind:value={selectedChar}
							onOpenChange={() => AR_updateSkill('char')}
						>
							<Select.Trigger class="w-full">{selectedChar || 'None'}</Select.Trigger>
							<Select.Content>
								{#each characteristics as characteristic}
									<Select.Item value={characteristic}>{characteristic}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<!-- Skill -->
						<Label for="skill">Skill</Label>
						<Select.Root
							type="single"
							name="skill"
							bind:value={selectedSkill}
							onOpenChange={() => AR_updateSkill('skill')}
						>
							<Select.Trigger class="w-full">{selectedSkill || 'None'}</Select.Trigger>
							<Select.Content>
								{#each Object.entries(skillList) as [charName, skills]}
									{#each skills as skill}
										<Select.Item value={skill}>[{charName}]: {skill}</Select.Item>
									{/each}
								{/each}
							</Select.Content>
						</Select.Root>
						<div class="fieldButtons">
							<Button
								disabled={!selectedChar || !selectedSkill}
								variant="destructive"
								onclick={resetSkill}><Icon icon="mdi:reload" /></Button
							>
						</div>
					</div>
					<h1 class="category">Card Fields</h1>
					<!-- Fields -->
					<div class="fieldList">
						{#if card.mechanics[AR_KEY]?.fields?.length}
							{#each card.mechanics[AR_KEY].fields as field, i}
								<div class="fieldItem">
									<Label for="special-{i}-name">Name</Label>
									<Input type="text" id="special-{i}-name" bind:value={field.label} />
									<div class="fieldButtons">
										<Button
											variant="destructive"
											size="icon"
											onclick={() => card.mechanics[AR_KEY]?.fields.splice(i, 1)}
										>
											<Icon icon="mdi:trash" />
										</Button>
									</div>
									<Label for="special-{i}-description">Value</Label>
									<Input type="text" id="special-{i}-description" bind:value={field.value} />
								</div>
							{/each}
						{/if}
					</div>
					<div class="fullLine">
						<Button
							size="sm"
							onclick={() =>
								card.mechanics[AR_KEY]?.fields.push({ label: 'new field', value: 'edit me' })}
						>
							<Icon icon="mdi:plus" />
							Add Field</Button
						>
					</div>
				{/if}
			</div>
		{/snippet}
	</Accordion>

	<!-- Fields -->
	<!-- Image -->
	<hr class="divider" />
	<Accordion>
		{#snippet head()}
			<div>Image</div>
		{/snippet}
		{#snippet content()}
			<div class="inputGrid">
				{#if $advancedMode}
					<!-- Image Name -->
					<Label for="imgName">
						<Icon class="advancedIcon" icon="memory:anvil" />
						Name
					</Label>
					<Input type="text" id="imgName" bind:value={card.image.name} placeholder={card.name} />
				{/if}

				<!-- URL -->
				<Label for="url">URL</Label>
				<Input
					type="text"
					id="url"
					bind:value={card.image.url}
					placeholder="Paste image URL here"
				/>

				<!-- Position X -->
				<Label for="xPosition">X Offset: {Math.round(card.image.x_offset || 0)}</Label>
				<Input
					type="range"
					name="xPosition"
					id="xPosition"
					bind:value={card.image.x_offset}
					min="-50"
					max="50"
					list="positions"
				/>
				<!-- Position Y -->
				<Label for="yPosition">Y Offset: {Math.round(card.image.y_offset || 0)}</Label>
				<Input
					type="range"
					name="yPosition"
					id="yPosition"
					bind:value={card.image.y_offset}
					min="-50"
					max="50"
					list="positions"
				/>
				<datalist id="positions">
					<option value="0"></option>
					<option value="-10"></option>
					<option value="10"></option>
				</datalist>
				<!-- Rotation -->
				<Label for="rotation">Rotation: {Math.round(card.image.rotation || 0)}°</Label>
				<Input
					type="range"
					name="rotation"
					id="rotation"
					bind:value={card.image.rotation}
					min="-180"
					max="180"
					list="rotations"
				/>
				<!-- Scale -->
				<Label for="scale">Scale: {card.image.scale}%</Label>
				<Input
					type="range"
					name="scale"
					id="scale"
					list="scales"
					bind:value={card.image.scale}
					min="25"
					max="300"
				/>
				<datalist id="scales">
					<option value="50"></option>
					<option value="100"></option>
					<option value="150"></option>
					<option value="200"></option>
					<option value="250"></option>
				</datalist>
				<datalist id="rotations">
					<option value="0"></option>
					<option value="90"></option>
					<option value="-90"></option>
				</datalist>
				<div class="fullLine mt-4 columns-2">
					<Button color="plain" class="w-full" onclick={() => card.resetImagePosition()}>
						<Icon icon="mdi:refresh" />
						Reset Position</Button
					>
				</div>
			</div>
		{/snippet}
	</Accordion>
	<!-- Styling -->
	<hr class="divider" />
	<Accordion>
		{#snippet head()}
			<div>Styling</div>
		{/snippet}
		{#snippet content()}
			<div class="inputGrid">
				<!-- Preset -->
				<Label for="preset">Style Preset</Label>
				<div class="buttonLine">
					<Select.Root
						type="single"
						name="preset"
						bind:value={card.stylePreset}
						onOpenChange={(e) => card.useStylePreset(card.stylePreset || 'custom')}
					>
						<Select.Trigger class="w-full">{card.stylePreset || 'Custom'}</Select.Trigger>
						<Select.Content>
							{#each Object.keys(cardStylePresets) as preset}
								<Select.Item value={preset}>{preset}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if card.stylePreset !== 'default'}
						<Button variant="destructive" size="icon" onclick={() => card.useStylePreset('default')}
							><Icon icon="mdi:backup-restore" /></Button
						>
					{:else}
						<Button
							size="sm"
							onclick={() => {
								card.useStylePreset('random');
							}}><Icon icon="mdi:dice" /></Button
						>
					{/if}
				</div>
				<div></div>
				{#if $advancedMode}
					<!-- Color Options -->
					<div class="fullLine headerLine">
						<Icon class="advancedIcon" icon="memory:anvil" />
						Color
					</div>
					{#each availableColorOptions as colorType}
						<Label for="color-{colorType}" style="text-transform: capitalize">{colorType}</Label>
						<div class="buttonLine">
							<div class="colorPickerLine">
								<Input
									type="color"
									id="color-{colorType}"
									bind:value={card.style.color[colorType]}
									onchange={presetToCustom}
									list="colorSuggestions"
								/>
								<span>{card.style.color[colorType]}</span>
							</div>
							{#if card.stylePreset === 'custom'}
								<Button
									color="plain"
									size="sm"
									onclick={() => {
										card.style.color[colorType] = defaultCardStyle.color[colorType];
										presetToCustom();
									}}
								>
									<Icon icon="mdi:restore" />
								</Button>
							{/if}
							<Button
								color="plain"
								size="sm"
								onclick={() => {
									presetToCustom();
									const randomHex = Math.floor(Math.random() * 16777215).toString(16);
									card.style.color[colorType] = `#${randomHex}`;
								}}><Icon icon="mdi:dice" /></Button
							>
						</div>
					{/each}

					<!-- Color Suggestions -->
					<datalist id="colorSuggestions">
						<option value="#ffffff"></option>
						{#each suggestedColors as c}
							<option value={c}></option>
						{/each}
					</datalist>

					<!-- Font Size Options -->
					<div class="fullLine headerLine">
						<Icon class="advancedIcon" icon="memory:anvil" />
						Text Size
					</div>
					{#each availableFontSizeOptions as fontSizeOption}
						<Label for="fontSize-{fontSizeOption}" style="text-transform: capitalize"
							>{fontSizeOption}</Label
						>
						<div class="buttonLine">
							<Input
								type="number"
								id="fontSize-{fontSizeOption}"
								bind:value={card.style.fontsize[fontSizeOption]}
								onchange={presetToCustom}
							/>
							<Button
								color="plain"
								size="sm"
								onclick={() => {
									card.style.fontsize[fontSizeOption] = defaultCardStyle.fontsize[fontSizeOption];
								}}><Icon icon="mdi:restore" /></Button
							>
						</div>
					{/each}

					<!-- Font Options -->
					<div class="fullLine headerLine">
						<Icon class="advancedIcon" icon="memory:anvil" />
						Fonts
					</div>
					{#each availableFontOptions as fontOption}
						<Label for="font-{fontOption}">{fontOption}</Label>
						<div class="buttonLine">
							<Select.Root
								type="single"
								name="font-{fontOption}"
								bind:value={card.style.font[fontOption]}
							>
								<Select.Trigger class="w-full">{card.style.font[fontOption]}</Select.Trigger>
								<Select.Content>
									{#each availableFonts as font}
										<Select.Item value={font}>{font}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<Button
								color="plain"
								size="sm"
								onclick={() => {
									card.style.font[fontOption] = defaultCardStyle.font[fontOption];
								}}><Icon icon="mdi:restore" /></Button
							>
						</div>
					{/each}
				{/if}
			</div>
		{/snippet}
	</Accordion>
	<hr class="divider" />
	<!-- Sharing -->
	<Accordion>
		{#snippet head()}
			<div>Sharing</div>
		{/snippet}
		{#snippet content()}
			<div class="mainFields">
				<h2 class="text-sm text-muted-foreground uppercase">under development</h2>
				<div class="flex flex-row items-center gap-2">
					<Checkbox
						checked={card.public}
						onCheckedChange={(state) => {
							card.public = state; // Somehow doesn't update card
							card.updatedAt = new Date(); //Stupid trick to force an update of the card
						}}
						name="public"
					/>
					<Label for="public">Make Public</Label>
				</div>
			</div>
		{/snippet}
	</Accordion>
</div>

<style>
	/*  */
	.editorRow {
		display: flex;
		align-items: center;
		gap: 0.5em;
		flex-wrap: wrap;
	}
	.inputGrid {
		display: grid;
		grid-template-columns: 7em minmax(0, 1fr);
		align-items: center;
		gap: 0.2em;
	}

	.inputGrid > hr,
	.mainFields > hr {
		all: unset;
		grid-column: span 1 / -1;
		height: 0.5em;
	}

	.fullLine {
		grid-column: 1 / -1;
	}

	.headerLine {
		font-weight: 500;
		font-size: 0.9rem;
		padding: 0.6em 0 0.2em 0;
		margin-bottom: 0.2em;
		border-bottom: 1px solid currentColor;
		/* Lay out in span */
		display: flex;
		gap: 0.5em;
	}

	.fieldList {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	.fieldItem {
		display: grid;
		gap: 0.2em;
		grid-template-columns: 6em 1fr min-content;
		grid-template-areas:
			'name nameInput fieldButtons'
			'desc descInput fieldButtons';
	}

	.fieldItem > .fieldButtons {
		grid-area: 'fieldButtons';
		grid-row: 1 / 3;
		grid-column: 3;
		justify-content: space-evenly;
		display: flex;
		flex-direction: column;
	}

	.mainFields {
		display: flex;
		flex-direction: column;
		gap: 0.2em;
	}

	.category {
		margin-top: 0.5em;
		column-span: all;
		margin: 1em 0 10px 0;
		border-bottom: var(--color-text-1, black) solid 1px;
	}

	.category:is(:first-child) {
		margin-top: 0;
	}

	.buttonLine {
		display: flex;
		gap: 1em;
		align-items: center;
		justify-content: space-between;
		border-bottom: solid 1px var(--color-obsidian-2);
	}

	label {
		font-weight: 600;
		font-size: 0.8em;
		justify-self: start;
		/* Overlfow Fix */
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.divider {
		width: 100%;
		border-top: 1px solid var(--obsidian);
	}

	/* Specific Styles */

	:global(.advancedIcon) {
		color: var(--color-weave-2);
		vertical-align: text-bottom;
		font-size: 1.2em;
	}

	option.preferredOption {
		font-weight: 600;
	}

	input.warning {
		background-color: var(--color-threat-4) !important;
	}

	.colorPickerLine {
		gap: 0.5em;
		align-items: center;
		width: 100%;
		columns: 2 auto;
	}

	.colorPickerLine > span {
		font-size: 0.8em;
		color: var(--color-text-1);

		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
