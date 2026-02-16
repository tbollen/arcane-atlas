<script lang="ts">
	/**
	 * CharacterEditAccordion - Reusable accordion for editing character properties
	 *
	 * @example
	 * ``` svelte
	 * Basic usage:
	 * <CharacterEditAccordion bind:character cards={userCards} />
	 *
	 * With specific properties to show:
	 * <CharacterEditAccordion
	 *   bind:character
	 *   cards={userCards}
	 *   properties={{ generic: ['general', 'cards'], arcaneRift: ['aspects', 'stats'] }}
	 * />
	 *
	 * With external navigation (declare currentSystem and openSections as $state):
	 * <CharacterEditAccordion
	 *   bind:character
	 *   bind:activeSystemTab={currentSystem}
	 *   bind:openItems={openSections}
	 *   autoOpenItems={false}
	 * />
	 * ```
	 *
	 * @prop character - The character to edit
	 * @prop cards - Optional list of cards for card-related components
	 * @prop properties - Optional filter for which properties to show per system
	 * @prop activeSystemTab - The currently active system tab (bindable)
	 * @prop openItems - The currently open accordion items (bindable)
	 * @prop showHeaders - Whether to show accordion headers (default: true)
	 *  @prop autoOpenItems - Whether to auto-open items based on properties and activeSystemTab (default: true)
	 */
	// Types and modules
	import { verbose } from '$lib/utils/feedback/verbose';
	import {
		StoredCharacter,
		type CharacterProperties
	} from '$lib/domain/characters/character.svelte';
	import type { StoredCard } from '$lib/domain/cards/cardStore.svelte';

	import { gameSystems, GENERIC_KEY, type CharacterSystems } from '$lib/gameSystems';
	import type { DeckSystem } from '$lib/components/playdeck';

	// Import UI components
	import { Header } from '$lib/components/typography';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Accordion from '$lib/components/ui/accordion/';
	import InfoTooltip from '$lib/components/partials/InfoTooltip.svelte';

	// Character Edit Partials
	import { characterEditComponentDict } from '$lib/components/partials/character/edit';

	let {
		character = $bindable(),
		cards,
		properties,
		activeSystemTab = $bindable(),
		openItems = $bindable([]),
		listedItems = $bindable({}),
		showHeaders = true,
		autoOpenItems = true
	}: {
		character: StoredCharacter;
		cards?: StoredCard[];
		properties?: CharacterProperties;
		activeSystemTab?: DeckSystem | undefined;
		openItems?: string[];
		listedItems?: typeof characterEditComponentDict;
		showHeaders?: boolean;
		autoOpenItems?: boolean;
	} = $props();

	// FILTERED COMPONENT DICT
	let filteredCharacterEditComponentDict = $derived.by(() => {
		// If no properties are defined, return full dict
		if (!properties) return characterEditComponentDict;
		// Set empty dict to populate
		const filteredDict: typeof characterEditComponentDict = {};
		// Per system, add in the entries that are set in properties
		for (const systemKey in properties) {
			const props = properties[systemKey as DeckSystem];
			if (!props) continue;
			const systemComponents: (typeof characterEditComponentDict)[DeckSystem] = {};
			for (const propertyKey of props) {
				const _key = propertyKey as keyof (typeof characterEditComponentDict)[DeckSystem];
				const component = characterEditComponentDict[systemKey as DeckSystem]?.[_key];
				if (component) {
					systemComponents[_key] = component;
				}
			}
			if (Object.keys(systemComponents).length > 0) {
				filteredDict[systemKey as DeckSystem] = systemComponents;
			}
		}
		return filteredDict;
	});

	// Checks if there are multiple "properties" to show from the filtered dict, which toggles accordion headers
	let showMultipleHeaders: boolean = $derived.by(() => {
		if (!showHeaders) return false;
		let count = 0;
		for (const systemKey in filteredCharacterEditComponentDict) {
			const props = filteredCharacterEditComponentDict[systemKey as DeckSystem];
			count += props ? Object.keys(props).length : 0;
			if (count > 1) return true;
		}
		return false;
	});

	// ACCORDION MANAGEMENT - auto-open items based on properties and activeSystemTab
	$effect(() => {
		if (!autoOpenItems || !properties) {
			openItems = [];
			return;
		}

		// If activeSystemTab is undefined or not in properties, show all systems
		if (!activeSystemTab || !properties[activeSystemTab]) {
			const allItems: string[] = [];
			for (const [systemKey, props] of Object.entries(properties)) {
				allItems.push(...props.map((p) => `${systemKey}:${p}`));
			}
			openItems = allItems;
		} else {
			// If activeSystemTab is specified in properties, only open items for that system
			const props = properties[activeSystemTab];
			openItems = props.map((p) => `${activeSystemTab}:${p}`);
		}
	});

	// Expose filtered dict to parent
	$effect(() => {
		listedItems = filteredCharacterEditComponentDict;
	});
</script>

<div class="flex flex-col">
	{#if showMultipleHeaders}
		<Accordion.Root type="multiple" bind:value={openItems} class="mb-2">
			{#each Object.entries(filteredCharacterEditComponentDict) as [systemKey, propertyComponents]}
				{#if !character.systems.includes(systemKey as CharacterSystems)}
					{@const systemInfo = gameSystems[systemKey as CharacterSystems]}
					<!-- System adding -->
					<div class="flex flex-col items-center gap-4 p-4">
						Character does not have {systemInfo.name} mechanics
						<Button
							variant="bold"
							onclick={() => {
								verbose(() => character.addSystem(systemKey as CharacterSystems));
							}}
						>
							<Icon icon="mdi:plus" /> Add {systemInfo.name}
						</Button>
					</div>
				{:else}
					{#each Object.entries(propertyComponents) as [propertyKey, content]}
						{@const Component = content.component}
						{@const tooltipIcon =
							activeSystemTab === undefined
								? gameSystems[systemKey as CharacterSystems].icon
								: 'mdi:information-outline'}
						<Accordion.Item value="{systemKey}:{propertyKey}" id="{systemKey}:{propertyKey}">
							<Accordion.Trigger>
								<Header variant="h3">
									<InfoTooltip
										icon={tooltipIcon}
										class="ml-2 inline-block align-middle text-muted-foreground"
									>
										{content.description}
									</InfoTooltip>
									{content.name}
								</Header>
							</Accordion.Trigger>
							<Accordion.Content class="overflow-visible">
								<Component bind:character {cards} />
							</Accordion.Content>
						</Accordion.Item>
					{/each}
				{/if}
			{/each}
		</Accordion.Root>
	{:else}
		<!-- Render first available component (and only one) without accordion -->
		{@const firstSystem = Object.values(filteredCharacterEditComponentDict)[0]}
		{#if firstSystem}
			{@const Component = Object.values(firstSystem)[0].component}
			<Component bind:character {cards} />
		{/if}
	{/if}
</div>
