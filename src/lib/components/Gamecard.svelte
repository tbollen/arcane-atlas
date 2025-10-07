<script lang="ts">
	// Import Item Store
	import { type Item } from '$lib/types/Item.svelte';
	//

	// Card Components
	import Skill from './Skill.svelte';

	import '$lib/styles/cardStyle.css';

	import Icon, { iconExists } from '@iconify/svelte';
	import { updated } from '$app/state';

	// import card type options and icons
	import { cardTypes } from '$lib/modules/cardTypes';

	// Update the item description for renderering
	import renderMarkdown from '$lib/modules/renderDiceIconsInText';
	import { skillList } from '$lib/modules/skillCheckList';
	interface Props {
		item: Item;
		print?: boolean;
	}

	let { item, print = true }: Props = $props();

	// Get card type, if not found use default [0]
	let cardType = $derived(cardTypes.find((type) => type.name === item.type) || cardTypes[0]);
	let renderedItemDescription = $derived(renderMarkdown(item.description));
	// Check for icon
	let iconOverride = $derived(item?.icon && iconExists(item.icon) ? item.icon : undefined);

	// Check if the item has a skillCheck
	let hasSkillCheck = $derived(false);

	$effect(() => console.log('hasSkillCheck', hasSkillCheck));
</script>

<div
	class="card"
	style="border-color: {item.style.color.cardBorder};color: {item.style.color
		.text}; background-color: {item.style.color.background};"
	class:print
>
	<div id="topbanner">
		<div
			class="typeIcon left-{cardType.iconOrientation}"
			style="color: {item.style.color.icon}; font-size: {item.style.fontsize.icon}pt;"
		>
			<Icon icon={iconOverride || cardType.icon} />
		</div>
		<h1
			class="name"
			style={`font-size: ${item.style.fontsize.name}pt; font-family: '${item.style.font.name}', 'Gotham', sans-serif;`}
		>
			{item.name}
		</h1>
		<div
			class="typeIcon right-{cardType.iconOrientation}"
			style="color: {item.style.color.icon}; font-size: {item.style.fontsize.icon}pt;"
		>
			<Icon icon={iconOverride || cardType.icon} />
		</div>
		{#if item?.subtitle}
			<h3
				class="subtitle"
				style="color: {item.style.color.text};font-size: {item.style.fontsize
					.subtitle}pt; font-family: '{item.style.font.subtitle}', 'Gotham', sans-serif;"
			>
				{item.subtitle}
			</h3>
		{/if}
	</div>
	<p
		class="description"
		style="font-size: {item.style.fontsize.text}pt; font-family: '{item.style.font
			.text}', 'Gotham', sans-serif;"
	>
		{@html renderedItemDescription}
	</p>

	{#if item?.aspects}
		{#each item?.aspects as aspect}
			<div
				class="aspect"
				style="font-size: {item.style.fontsize.text}pt; font-family: '{item.style.font
					.text}', 'Gotham', sans-serif;"
			>
				<div class="aspectDescription description">
					{#if aspect?.name && aspect?.description}
						<span class="aspectName inTextName">{aspect.name}</span>
						{@html renderMarkdown(aspect.description)}
					{/if}
				</div>
			</div>
		{/each}
	{/if}

	{#if item?.specials}
		{#each item?.specials as special}
			<div
				class="aspect"
				style="font-size: {item.style.fontsize.text}pt; font-family: '{item.style.font
					.text}', 'Gotham', sans-serif;"
			>
				<div class="aspectDescription description">
					{#if special?.name && special?.description}
						<span class="aspectName inTextName">{special.name}</span>
						{@html renderMarkdown(special.description)}
					{/if}
				</div>
			</div>
		{/each}
	{/if}

	<div id="fields" data-field-number={item?.fields?.length} class:hasSkillCheck>
		{#if (item?.fields && item?.fields?.length > 0) || hasSkillCheck}
			<div class="fieldDivider"></div>
		{/if}
		{#if item?.fields}
			{#each item.fields as field, i}
				<div class="field" id="field-{i}">
					<div class="fieldName">{field.name}</div>
					<div class="fieldValue">{@html renderMarkdown(field.description)}</div>
				</div>
			{/each}
		{/if}
		<!-- Skill Check -->
		{#if hasSkillCheck}
			<div id="skillcheck" class="field">
				<div id="characteristic" style="font-size: {item.style.fontsize.check / 1.4}pt;">
					{item.skillCheck.characteristic}
				</div>
				<div
					id="skill"
					style="
						background: {item.style.color.accent};
						font-size: {item.style.fontsize.check}pt;
						font-family: '{item.style.font.accents}', 'Gotham', sans-serif;"
				>
					{item.skillCheck.skill}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Card */
	.card {
		/* Layout */
		display: flex;
		flex-direction: column;
		/* Bring last child to bottom */
		& > :last-child {
			margin-top: auto;
		}
	}

	.description {
		flex: 1 1 0;
		overflow: hidden;
		margin-bottom: 0.5em;
	}

	.editInCardField {
		all: unset;
		/* Sizing */
		display: block;
		width: 100%;
		height: fit-content;
	}

	.editInCardField.editing {
		border: solid 1px var(--weave);
	}

	.editInCardField.editing:hover,
	.editInCardField.editing:focus {
		background-color: var(--color-text-3);
	}

	#topbanner {
		display: grid;
		grid-template-columns: var(--icon-size) auto var(--icon-size);
		grid-template-rows: auto auto;
		align-items: center;
		justify-items: center;
		font-size: var(--icon-size);
	}

	.name {
		/* Font */
		text-align: center;
		font-weight: 500;
		font-size: var(--name-size);
		/* Position */
		grid-column: 2;
		/* Clear margins */
		margin: 0;
	}

	.inTextName {
		font-weight: 600;
	}
	.inTextName::after {
		content: ': ';
	}

	.typeIcon {
		grid-row: span 2;
	}

	.subtitle {
		/* Font */
		text-align: center;
		font-weight: 400;
		font-size: var(--subname-size);
		color: var(--obsidian);
		/* Position */
		grid-column: 2;
		/* Clear margins */
		margin: 0;
	}

	.description {
		font-size: 8pt;
	}

	.dice {
		color: red;
	}

	.aspectDescription {
		font-size: inherit;
		font-family: inherit;
	}

	/* Fields */
	#fields {
		display: grid;
		grid-template-rows: repeat(auto, 1fr);
		gap: 4pt;
		grid-auto-flow: dense;
		grid-template-columns: 1fr 1fr 1fr;
	}

	#fields[data-field-number='1']:not(.hasSkillCheck) {
		grid-template-columns: 1fr;
	}
	#fields[data-field-number='2'] {
		grid-template-columns: 1fr 1fr;
	}

	#fields[data-field-number='4']:not(.hasSkillCheck) {
		grid-template-columns: 1fr 1fr;
	}

	/* Puts the last skill check field at the end, when skillcheck is present */
	#fields.hasSkillCheck > :nth-last-child(2) {
		grid-column-end: -1;
	}

	.fieldDivider {
		grid-column: span 3;
		border-top: 1px solid var(--obsidian);
	}

	.field {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		font-size: 9pt;
	}

	.fieldName {
		font-size: 0.9em;
		color: color-mix(in srgb, currentColor 70%, transparent);
	}

	.fieldValue {
		font-size: 1em;
	}

	#skillcheck > * {
		-webkit-print-color-adjust: exact; /* For WebKit browsers */
		print-color-adjust: exact; /* For WebKit browsers */
		color-adjust: exact; /* Standard property */
	}

	#skillcheck {
		display: flex;
		flex-direction: column;
		/* Placement */
		align-items: flex-start;
		grid-column-start: 1;
		grid-column-end: 3;
	}

	#skillcheck > #characteristic {
		font-size: 10pt;
		font-weight: 500;
	}

	#skillcheck > #skill {
		font-size: 14pt;
		font-weight: 600;
		color: white;
		padding: 0.18em;
	}
</style>
