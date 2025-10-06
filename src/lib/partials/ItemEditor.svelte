<script lang="ts">
	import { run } from 'svelte/legacy';

	// Core Components
	import Button from '$lib/components/ui/button/button.svelte';
	import Accordion from '$lib/components/coreComponents/Accordion.svelte';

	// ShadCN UI
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import * as Select from '$lib/components/ui/select';

	// Ask for an StoredItem to edit
	import { type StoredItem } from '$lib/stores/Items';

	// Load selected item
	import { items } from '$lib/stores/Items';

	// Popup & Tooltips
	import { tooltip } from '$lib/modules/tooltip';
	import renderMarkdown from '$lib/modules/renderDiceIconsInText';

	// Import card types for editing options
	import { cardTypes } from '$lib/modules/cardTypes';
	import Icon, { iconExists, loadIcon } from '@iconify/svelte';
	import { cardStylePresets, defaultCardStyle } from '$lib/core/cards/cardStylePresets';
	import { suggestedColors } from '$lib/styles/colorScheme';
	import { availableFonts } from '$lib/types/fonts';

	// Get charactersistics and skills
	import { skillList, characteristics } from '$lib/modules/skillCheckList';

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

	let selectedSkill: (typeof characteristics)[number] | undefined = $state();
	let selectedChar: keyof typeof skillList | undefined = $state();

	function updateSkill(priority?: 'char' | 'skill') {
		if (
			(priority == 'char' && selectedChar == undefined) ||
			(priority == 'skill' && selectedSkill == undefined)
		) {
			item.skillCheck = undefined;
			return;
		}
		console.debug('Updating skill', selectedChar, selectedSkill);
		if (selectedChar == undefined && selectedSkill == undefined) {
			item.skillCheck = undefined;
			return;
		}
		if (
			priority == 'char' &&
			selectedChar != undefined &&
			//the selected skill is not part of the selected characteristic
			skillList[selectedChar].some((skill) => skill != selectedSkill)
		) {
			selectedSkill = skillList[selectedChar][0];
		} else if (
			priority == 'skill' &&
			selectedSkill != undefined &&
			//the selected characteristic matches the selected skill
			Object.values(skillList).some((charSkills) =>
				charSkills.some((skill) => skill == selectedSkill)
			)
		) {
			selectedChar = Object.keys(skillList).find((char) =>
				skillList[char as keyof typeof skillList].some((skill) => skill == selectedSkill)
			) as keyof typeof skillList;
		}
		item.skillCheck = { characteristic: selectedChar, skill: selectedSkill };
	}

	function resetSkill() {
		selectedChar = undefined;
		selectedSkill = undefined;
	}

	// Button to add new fields
	import { onMount } from 'svelte';
	interface Props {
		item: StoredItem;
	}

	///////////////////////////////////////
	// Get the Game System and Mechanics //
	///////////////////////////////////////
	import { gameCardSystems } from '$lib/system/gameSystems';
	import { Root } from '$lib/components/ui/button';
	const system: keyof typeof gameCardSystems = 'arcaneRift';
	let availableSystems = Object.keys(gameCardSystems);

	///////////////////
	// Get Item here //
	///////////////////
	let { item = $bindable() }: Props = $props();
	let _localItem = $derived(item);

	$effect(() => {
		console.log('Item updated [ITEM EDITOR]', item);
	});

	function updateItem() {
		// Tell parent to update item
	}

	function presetToCustom() {
		// item.stylePreset = 'custom';
		item.useStylePreset('custom');
	}

	// Style components for looping
	const availableColorOptions = Object.keys(item.style.color) as (keyof typeof item.style.color)[];
	const availableFontOptions = Object.keys(item.style.font) as (keyof typeof item.style.font)[];
	const availableFontSizeOptions = Object.keys(
		item.style.fontsize
	) as (keyof typeof item.style.fontsize)[];

	let mounted = false;
	onMount(() => {
		loadIconFromIconify(item.icon);
		mounted = true;
	});
	run(() => {
		selectedChar && updateSkill('char');
	});
	run(() => {
		selectedSkill && updateSkill('skill');
	});
	run(() => {
		console.debug('Logging the editItem', item);
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
					oninput={updateItem}
					bind:value={item.name}
					placeholder="Name"
				/>
				<hr />
				<!-- Subtitle -->
				<Label for="subtitle">Subtitle</Label>
				<Input type="text" id="subtitle" bind:value={item.subtitle} placeholder="Subtitle" />
				<hr />
				<!-- Description -->
				<Label for="description">Description</Label>
				<Textarea
					name="description"
					id="description"
					rows={3}
					placeholder="Edit the description here"
					bind:value={item.description}
				></Textarea>
				<p class="useTip col-span-full text-sm text-muted-foreground">
					You can add dice icons like such '[pr]'' = {@html renderMarkdown('[pr]')}
					<a href="{base}/about">click here</a> for more info
				</p>
				<hr />
				<!-- Type -->
				<Label for="type">Type</Label>
				<Select.Root type="single" name="type" bind:value={_localItem.type}>
					<Select.Trigger class="w-[180px]">{item.type}</Select.Trigger>
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
						class={!iconExists(item?.icon || '') ? 'warning' : ''}
						bind:value={_localItem.icon}
						oninput={() => loadIconFromIconify(item.icon)}
						placeholder={cardTypes.find((type) => type.name == item.type)?.icon ||
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
		<!-- Description -->
		{#snippet content()}
			<div class="mainFields">
				<!-- Aspects -->
				<h1 class="category">Aspects</h1>
				{#if item.aspects?.length}
					<div class="fieldList">
						{#each item.aspects as aspect, i}
							<div class="fieldItem">
								<Label for="aspect-{i}-name">Name</Label>
								<Input type="text" id="aspect-{i}-name" bind:value={aspect.name} />
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
										onclick={() => item.removeField('aspects', i)}
									>
										<Icon icon="mdi:trash" />
									</Button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
				<hr />
				<Button onclick={() => item.addEmptyField('aspects')}>
					<Icon icon="mdi:plus" />
					Add aspect
				</Button>
				<h1 class="category">Skill Check</h1>
				<div class="fieldItem">
					<!-- Characteristic -->
					<Label for="characteristic">Characteristic</Label>
					<Select.Root type="single" name="characteristic" bind:value={selectedChar}>
						<Select.Trigger class="w-full">{selectedChar || 'None'}</Select.Trigger>
						<Select.Content>
							{#each characteristics as characteristic}
								<Select.Item value={characteristic}>{characteristic}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<!-- Skill -->
					<Label for="skill">Skill</Label>
					<Select.Root type="single" name="skill" bind:value={selectedSkill}>
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
					{#if item.fields?.length}
						{#each item.fields as field, i}
							<div class="fieldItem">
								<Label for="special-{i}-name">Name</Label>
								<Input type="text" id="special-{i}-name" bind:value={field.name} />
								<div class="fieldButtons">
									<Button
										variant="destructive"
										size="icon"
										onclick={() => item.removeField('fields', i)}
									>
										<Icon icon="mdi:trash" />
									</Button>
								</div>
								<Label for="special-{i}-description">Value</Label>
								<Input type="text" id="special-{i}-description" bind:value={field.description} />
							</div>
						{/each}
					{/if}
				</div>
				<div class="fullLine">
					<Button size="sm" onclick={() => item.addEmptyField('fields')}>
						<Icon icon="mdi:plus" />
						Add Field</Button
					>
				</div>
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
					<Input
						type="text"
						id="imgName"
						bind:value={_localItem.image.name}
						placeholder={item.name}
					/>
				{/if}

				<!-- URL -->
				<Label for="url">URL</Label>
				<Input
					type="text"
					id="url"
					bind:value={_localItem.image.url}
					placeholder="Paste image URL here"
				/>

				<!-- Position X -->
				<Label for="xPosition">X Offset: {Math.round(item.image.x_offset || 0)}</Label>
				<Input
					type="range"
					name="xPosition"
					id="xPosition"
					bind:value={_localItem.image.x_offset}
					min="-50"
					max="50"
					list="positions"
				/>
				<!-- Position Y -->
				<Label for="yPosition">Y Offset: {Math.round(item.image.y_offset || 0)}</Label>
				<Input
					type="range"
					name="yPosition"
					id="yPosition"
					bind:value={_localItem.image.y_offset}
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
				<Label for="rotation">Rotation: {Math.round(item.image.rotation || 0)}°</Label>
				<Input
					type="range"
					name="rotation"
					id="rotation"
					bind:value={_localItem.image.rotation}
					min="-180"
					max="180"
					list="rotations"
				/>
				<!-- Scale -->
				<Label for="scale">Scale: {item.image.scale}%</Label>
				<Input
					type="range"
					name="scale"
					id="scale"
					list="scales"
					bind:value={_localItem.image.scale}
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
					<Button color="plain" class="w-full" onclick={() => item.resetImagePosition()}>
						<Icon icon="mdi:refresh" />
						Reset Position</Button
					>
					<Button color="plain" class="w-full" onclick={() => {}}>
						<Icon icon="mdi:upload" />
						Upload Image</Button
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
						bind:value={_localItem.stylePreset}
						onOpenChange={(e) => item.useStylePreset(item.stylePreset || 'custom')}
					>
						<Select.Trigger class="w-full">{_localItem.stylePreset || 'Custom'}</Select.Trigger>
						<Select.Content>
							{#each Object.keys(cardStylePresets) as preset}
								<Select.Item value={preset}>{preset}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if item.stylePreset !== 'default'}
						<Button variant="destructive" size="icon" onclick={() => item.useStylePreset('default')}
							><Icon icon="mdi:backup-restore" /></Button
						>
					{:else}
						<Button
							size="sm"
							onclick={() => {
								item.useStylePreset('random');
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
									bind:value={_localItem.style.color[colorType]}
									onchange={presetToCustom}
									list="colorSuggestions"
								/>
								<span>{item.style.color[colorType]}</span>
							</div>
							{#if item.stylePreset === 'custom'}
								<Button
									color="plain"
									size="sm"
									onclick={() => {
										item.style.color[colorType] = defaultCardStyle.color[colorType];
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
									item.style.color[colorType] = `#${randomHex}`;
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
								bind:value={_localItem.style.fontsize[fontSizeOption]}
								onchange={presetToCustom}
							/>
							<Button
								color="plain"
								size="sm"
								onclick={() => {
									item.style.fontsize[fontSizeOption] = defaultCardStyle.fontsize[fontSizeOption];
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
								bind:value={_localItem.style.font[fontOption]}
							>
								<Select.Trigger class="w-full">{_localItem.style.font[fontOption]}</Select.Trigger>
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
									item.style.font[fontOption] = defaultCardStyle.font[fontOption];
								}}><Icon icon="mdi:restore" /></Button
							>
						</div>
					{/each}
				{/if}
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
