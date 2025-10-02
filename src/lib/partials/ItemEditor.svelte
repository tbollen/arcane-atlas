<script lang="ts">
	import { run } from 'svelte/legacy';

	// Core Components
	import Button from '$lib/components/coreComponents/Button.svelte';
	import Accordion from '$lib/components/coreComponents/Accordion.svelte';

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

	let selectedSkill: (typeof characteristics)[number] | undefined = $state(item.skillCheck?.skill);
	let selectedChar: keyof typeof skillList | undefined = $state(item.skillCheck?.characteristic);

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
		item.skillCheck = null;
	}

	// Button to add new fields
	import { onMount } from 'svelte';
	interface Props {
		item: StoredItem;
	}

	let { item = $bindable() }: Props = $props();

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
				<div >Name and Type</div>
			{/snippet}
		{#snippet content()}
				<div  class="inputGrid">
				<!-- Name -->
				<label for="name">Name</label>
				<input type="text" id="name" bind:value={item.name} placeholder="Name" />
				<!-- Subtitle -->
				<label for="subtitle">Subtitle</label>
				<input type="text" id="subtitle" bind:value={item.subtitle} placeholder="Subtitle" />

				<!-- Type -->
				<label for="type">Type</label>
				<select id="type" bind:value={item.type} placeholder="Type">
					{#each cardTypes as cardType}
						<option value={cardType.name}>{cardType.name}</option>
					{/each}
				</select>
				<!-- Icon Override -->
				{#if $advancedMode}
					<label for="iconOverride">
						Icon
						<Icon class="advancedIcon" icon="memory:anvil" />
					</label>
					<input
						type="text"
						id="iconOverride"
						class:warning={!iconExists(item?.icon || 'mdi:sack')}
						bind:value={item.icon}
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
	<Accordion>
		{#snippet head()}
				<div >Main Text</div>
			{/snippet}
		<!-- Description -->
		{#snippet content()}
				<div  class="mainFields">
				<label for="description">Description</label>
				<textarea
					name="description"
					id="description"
					rows="3"
					placeholder="Edit the description here"
					bind:value={item.description}
				></textarea>
				<small class="useTip"
					>You can add dice icons like such '[pr]'' = {@html renderMarkdown('[pr]')}
					<a href="{base}/about">click here</a> for more info
				</small>
				<!-- Aspects -->
				<label for="editorAspects" class="category buttonLine"> Aspects </label>
				{#if item.aspects?.length}
					<div class="fieldList">
						{#each item.aspects as aspect, i}
							<div class="fieldItem">
								<label for="aspect-{i}-name">Name</label>
								<input type="text" id="aspect-{i}-name" bind:value={aspect.name} />
								<label for="aspect-{i}-description">Description</label>
								<textarea
									name="description"
									id="editorAspects"
									rows="2"
									placeholder="Edit the description here"
									bind:value={aspect.description}
								></textarea>
								<div class="fieldButtons">
									<Button
										color="plain"
										icon="mdi:trash"
										size="small"
										click={() => item.removeField('aspects', i)}
									/>
								</div>
							</div>
						{/each}
					</div>
				{/if}
				<Button icon="mdi:plus" size="small" click={() => item.addEmptyField('aspects')}>Add</Button>
				<hr class="divider" />
				<!-- Specials -->
				<label for="editorSpecials" class="category buttonLine"> Specials </label>
				{#if item.specials?.length}
					<div class="fieldList">
						{#each item.specials as special, i}
							<div class="fieldItem">
								<label for="special-{i}-name">Name</label>
								<input type="text" id="special-{i}-name" bind:value={special.name} />
								<label for="special-{i}-description">Description</label>
								<textarea
									name="description"
									id="editorAspects"
									rows="2"
									placeholder="Edit the description here"
									bind:value={special.description}
								></textarea>
								<div class="fieldButtons">
									<Button
										color="plain"
										icon="mdi:trash"
										size="small"
										click={() => item.removeField('specials', i)}
									/>
								</div>
							</div>
						{/each}
					</div>
				{/if}
				<Button icon="mdi:plus" size="small" click={() => item.addEmptyField('specials')}>Add</Button>
			</div>
			{/snippet}
	</Accordion>
	<!-- Fields -->
	<hr class="divider" />
	<Accordion>
		{#snippet head()}
				<div >Fields</div>
			{/snippet}
		{#snippet content()}
				<div  class="mainFields">
				<!-- Fields -->
				<div class="fieldList">
					<div class="fieldItem">
						<label for="characteristic">Characteristic</label>
						<select id="characteristic" bind:value={selectedChar}>
							{#if !item.skillCheck || selectedChar == undefined}
								<option selected disabled value="">None selected</option>
							{/if}
							{#each characteristics as characteristic}
								<option value={characteristic}>{characteristic}</option>
							{/each}
						</select>
						<label for="skill">Skill</label>
						<select id="skill" bind:value={selectedSkill}>
							{#if !item.skillCheck || selectedChar == undefined}
								<option selected disabled value="">None selected</option>
							{/if}
							{#each Object.entries(skillList) as [charName, skills]}
								{#each skills as skill}
									<option
										class:preferredOption={selectedChar && skillList[selectedChar].includes(skill)}
										value={skill}>[{charName}]: {skill}</option
									>
								{/each}
							{/each}
						</select>
						<div class="fieldButtons">
							<Button color="plain" icon="mdi:trash" size="small" click={resetSkill} />
						</div>
					</div>
					<hr class="divider" />
					{#if item.fields?.length}
						{#each item.fields as field, i}
							<div class="fieldItem">
								<label for="special-{i}-name">Name</label>
								<input type="text" id="special-{i}-name" bind:value={field.name} />
								<div class="fieldButtons">
									<Button
										color="plain"
										icon="mdi:trash"
										size="small"
										click={() => item.removeField('fields', i)}
									/>
								</div>
								<label for="special-{i}-description">Value</label>
								<input type="text" id="special-{i}-description" bind:value={field.description} />
							</div>
						{/each}
					{/if}
				</div>
				<label for="editorSpecials" class="category buttonLine">
					<Button icon="mdi:plus" size="small" click={() => item.addEmptyField('fields')}
						>Add Field</Button
					>
				</label>
			</div>
			{/snippet}
	</Accordion>
	<!-- Image -->
	<hr class="divider" />
	<Accordion>
		{#snippet head()}
				<div >Image</div>
			{/snippet}
		{#snippet content()}
				<div  class="inputGrid">
				{#if $advancedMode}
					<!-- Image Name -->
					<label for="imgName">
						Name
						<Icon class="advancedIcon" icon="memory:anvil" />
					</label>
					<input type="text" id="imgName" bind:value={item.image.name} placeholder={item.name} />
				{/if}

				<!-- URL -->
				<label for="url">URL</label>
				<input type="text" id="url" bind:value={item.image.url} placeholder="Paste image URL here" />

				<!-- Position X -->
				<label for="xPosition">X Offset: {Math.round(item.image.x_offset || 0)}</label>
				<input
					type="range"
					name="xPosition"
					id="xPosition"
					bind:value={item.image.x_offset}
					min="-50"
					max="50"
					list="positions"
				/>
				<!-- Position Y -->
				<label for="yPosition">Y Offset: {Math.round(item.image.y_offset || 0)}</label>
				<input
					type="range"
					name="yPosition"
					id="yPosition"
					bind:value={item.image.y_offset}
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
				<label for="rotation">Rotation: {Math.round(item.image.rotation || 0)}°</label>
				<input
					type="range"
					name="rotation"
					id="rotation"
					bind:value={item.image.rotation}
					min="-180"
					max="180"
					list="rotations"
				/>
				<!-- Scale -->
				<label for="scale">Scale: {item.image.scale}%</label>
				<input
					type="range"
					name="scale"
					id="scale"
					list="scales"
					bind:value={item.image.scale}
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
				<Button color="plain" icon="mdi:refresh" size="small" click={() => item.resetImagePosition()}>
					Reset Position</Button
				>
			</div>
			{/snippet}
	</Accordion>
	<!-- Styling -->
	<hr class="divider" />
	<Accordion>
		{#snippet head()}
				<div >Styling</div>
			{/snippet}
		{#snippet content()}
				<div  class="inputGrid">
				<!-- Preset -->
				<label for="preset"> Style Preset </label>
				<div class="buttonLine">
					<select
						style="height: 2em;"
						id="preset"
						bind:value={item.stylePreset}
						onchange={(e) => item.useStylePreset(item.stylePreset || 'custom')}
						placeholder="Preset"
					>
						{#each Object.keys(cardStylePresets) as preset}
							<option value={preset}>{preset}</option>
						{/each}
					</select>
					{#if item.stylePreset !== 'default'}
						<Button
							color="plain"
							icon="mdi:backup-restore"
							size="small"
							click={() => item.useStylePreset('default')}
						/>
					{:else}
						<Button
							color="plain"
							icon="mdi:dice"
							size="small"
							click={() => {
								item.useStylePreset('random');
							}}
						/>
					{/if}
				</div>
				<div></div>
				{#if $advancedMode}
					<div class="fullLine headerLine">
						<Icon class="advancedIcon" icon="memory:anvil" />
						Custom Styling Options
					</div>

					<!-- Color Options -->
					<div class="fullLine headerLine">Color</div>
					{#each availableColorOptions as colorType}
						<label for="color-{colorType}">{colorType}</label>
						<div class="buttonLine">
							<div class="colorPickerLine">
								<input
									type="color"
									id="color-{colorType}"
									bind:value={item.style.color[colorType]}
									onchange={presetToCustom}
									list="colorSuggestions"
								/>
								<span>{item.style.color[colorType]}</span>
							</div>
							{#if item.stylePreset === 'custom'}
								<Button
									color="plain"
									icon="mdi:restore"
									size="small"
									click={() => {
										item.style.color[colorType] = defaultCardStyle.color[colorType];
										presetToCustom();
									}}
								/>
							{/if}
							<Button
								color="plain"
								icon="mdi:dice"
								size="small"
								click={() => {
									presetToCustom();
									const randomHex = Math.floor(Math.random() * 16777215).toString(16);
									item.style.color[colorType] = `#${randomHex}`;
								}}
							/>
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
					<div class="fullLine headerLine">Text Size</div>
					{#each availableFontSizeOptions as fontSizeOption}
						<label for="fontSize-{fontSizeOption}">{fontSizeOption}</label>
						<div class="buttonLine">
							<input
								type="number"
								id="fontSize-{fontSizeOption}"
								bind:value={item.style.fontsize[fontSizeOption]}
								onchange={presetToCustom}
							/>
							<Button
								color="plain"
								icon="mdi:restore"
								size="small"
								click={() => {
									item.style.fontsize[fontSizeOption] = defaultCardStyle.fontsize[fontSizeOption];
								}}
							/>
						</div>
					{/each}

					<!-- Font Options -->
					<div class="fullLine headerLine">Fonts</div>
					{#each availableFontOptions as fontOption}
						<label for="font-{fontOption}">{fontOption}</label>
						<div class="buttonLine">
							<select
								id="font-{fontOption}"
								bind:value={item.style.font[fontOption]}
								onchange={presetToCustom}
							>
								{#each availableFonts as font}
									<option value={font}>{font}</option>
								{/each}
							</select>
							<Button
								color="plain"
								icon="mdi:restore"
								size="small"
								click={() => {
									item.style.font[fontOption] = defaultCardStyle.font[fontOption];
								}}
							/>
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
		grid-template-columns: 6em minmax(0, 16em);
		align-items: center;
		gap: 0.2em;
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
	}

	.buttonLine {
		display: flex;
		gap: 1em;
		align-items: center;
		justify-content: space-between;
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
		display: flex;
		gap: 0.5em;
		align-items: center;
	}

	.colorPickerLine > span {
		font-size: 0.8em;
		color: var(--color-text-1);

		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
