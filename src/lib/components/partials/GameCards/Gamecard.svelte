<script lang="ts">
	// Import Stored Card type
	import { type StoredCard } from '$lib/domain/cards/cardStore.svelte';
	import type { Card } from '$lib/domain/cards/card.svelte';
	//

	// Card Components

	import '$lib/styles/cardStyle.css';

	import Icon, { iconExists } from '@iconify/svelte';

	// import card type options and icons
	import { cardTypes } from '$lib/domain/cards/cardTypes';

	// Update the card description for renderering
	import renderMarkdown from '$lib/utils/rendering/renderDiceIconsInText';
	interface Props {
		card: StoredCard | Card;
		print?: boolean;
	}

	let { card: card, print = true }: Props = $props();

	let _card = $derived(card);

	// Get card type, if not found use default [0]
	let cardType = $derived(cardTypes.find((type) => type.name === _card.type) || cardTypes[0]);
	let renderedCardDescription = $derived(renderMarkdown(_card.description));
	// Check for icon
	let iconOverride = $derived(_card?.icon && iconExists(_card.icon) ? _card.icon : undefined);

	// Arcane Rift specific functions
	import { AR_KEY } from '$lib/gameSystems';
	let hasArcaneRift: boolean = $derived(_card.systems.includes(AR_KEY));
	// Check if the card has a skillCheck
	let hasSkillCheck: boolean = $derived(
		hasArcaneRift &&
			_card.mechanics[AR_KEY]?.check?.characteristic !== undefined &&
			_card.mechanics?.arcaneRift?.check?.skill !== undefined
	);
	let ar_mechanics = $derived(_card.mechanics[AR_KEY]);
</script>

<div
	class="card"
	style="border-color: {_card.style.color.cardBorder};color: {_card.style.color
		.text}; background-color: {_card.style.color.background};"
	class:print
>
	<div id="topbanner">
		<div
			class="typeIcon left-{cardType.iconOrientation}"
			style="color: {_card.style.color.icon}; font-size: {_card.style.fontsize.icon}pt;"
		>
			<Icon icon={iconOverride || cardType.icon} />
		</div>
		<h1
			class="name"
			style={`font-size: ${_card.style.fontsize.name}pt; font-family: '${_card.style.font.name}', 'Gotham', sans-serif;`}
		>
			{_card.name}
		</h1>
		<div
			class="typeIcon right-{cardType.iconOrientation}"
			style="color: {_card.style.color.icon}; font-size: {_card.style.fontsize.icon}pt;"
		>
			<Icon icon={iconOverride || cardType.icon} />
		</div>
		{#if _card?.subtitle}
			<h3
				class="subtitle"
				style="color: {_card.style.color.text};font-size: {_card.style.fontsize
					.subtitle}pt; font-family: '{_card.style.font.subtitle}', 'Gotham', sans-serif;"
			>
				{_card.subtitle}
			</h3>
		{/if}
	</div>
	<p
		class="description"
		style="font-size: {_card.style.fontsize.text}pt; font-family: '{_card.style.font
			.text}', 'Gotham', sans-serif;"
	>
		{@html renderedCardDescription}
	</p>

	<!-- ARCANE RIFT MECHANICS -->
	{#if hasArcaneRift}
		<!-- Aspects (in description) -->
		{#if ar_mechanics !== undefined && ar_mechanics.aspects}
			{#each ar_mechanics.aspects as aspect}
				<div
					class="aspect"
					style="font-size: {_card.style.fontsize.text}pt; font-family: '{_card.style.font
						.text}', 'Gotham', sans-serif;"
				>
					<div class="aspectDescription description">
						{#if aspect?.short && aspect?.description}
							<span class="aspectName inTextName">{aspect.short}</span>
							{@html renderMarkdown(aspect.description)}
						{/if}
					</div>
				</div>
			{/each}
		{/if}

		<!-- Fields -->
		{#if ar_mechanics?.fields || hasSkillCheck}
			<div
				id="fields"
				data-field-number={_card?.mechanics?.arcaneRift?.fields.length}
				class:hasSkillCheck
			>
				{#if (ar_mechanics?.fields && ar_mechanics?.fields.length > 0) || hasSkillCheck}
					<div class="fieldDivider"></div>
				{/if}
				{#if ar_mechanics?.fields && ar_mechanics?.fields.length > 0}
					{#each ar_mechanics.fields as field, i}
						<div class="field" id="field-{i}">
							<div class="fieldName">{field.label}</div>
							<div class="fieldValue">{@html renderMarkdown(field.value)}</div>
						</div>
					{/each}
				{/if}
				<!-- Skill Check -->
				{#if hasSkillCheck}
					<div id="skillcheck" class="field">
						<div id="characteristic" style="font-size: {_card.style.fontsize.check / 1.4}pt;">
							{ar_mechanics?.check.characteristic}
						</div>
						<div
							id="skill"
							style="
						background: {_card.style.color.accent};
						font-size: {_card.style.fontsize.check}pt;
						font-family: '{_card.style.font.accents}', 'Gotham', sans-serif;"
						>
							{ar_mechanics?.check.skill}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
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
		row-gap: 0.1em;
		column-gap: 0.3em;
	}

	.name {
		/* Font */
		text-align: center;
		font-weight: 500;
		font-size: var(--name-size);
		line-height: 1em;
		overflow: hidden;
		/* Position */
		grid-column: 2;
		/* Clear margins */
		margin: 0;
		/* Overflow */
		width: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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
		/* Spacing */
		line-height: 1em;
		padding-bottom: 0.4em;
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
