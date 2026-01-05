<script lang="ts">
	// Types and modules
	import { verbose } from '$lib/utils/feedback/verbose';
	import {
		StoredCharacter,
		type CharacterProperties
	} from '$lib/domain/characters/character.svelte';
	import type { StoredCard } from '$lib/domain/cards/cardStore.svelte';

	import {
		AR_KEY,
		characterMechanics,
		gameSystems,
		GENERIC_KEY,
		type CharacterMechanics,
		type CharacterSystems
	} from '$lib/gameSystems';
	import { deckSystems, type DeckSystem } from '..';

	// API
	import CARD_API from '$lib/utils/api/cards_api';

	// WidgetMap things
	import { widgetMap, widgetIDs, getWidget } from '..';

	// Import UI components
	import { Label } from '$lib/components/ui/label';
	import { Header } from '$lib/components/typography';
	import Icon from '@iconify/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as ButtonGroup from '$lib/components/ui/button-group/';
	import * as Accordion from '$lib/components/ui/accordion/';
	import Mastery from '$lib/components/partials/arcaneRift/Mastery.svelte';
	import CardSearchbox from '$lib/components/partials/gamecards/CardSearchbox.svelte';
	import EditList from '$lib/components/ui/edit-list/edit-list.svelte';

	// Character Edit Partials
	import {
		CharacterGeneralFields,
		CharacterCards,
		CharacterAspects
	} from '$lib/components/partials/character/edit';
	import { characterEditComponentDict } from '$lib/components/partials/character/edit'; // As component dictionary
	import type { CharacterEditProps } from '$lib/components/partials/character/edit/propsType';

	// Svelte
	import { invalidateAll } from '$app/navigation';
	import ListItem from '$lib/components/partials/ListItem.svelte';
	import type { Component } from 'svelte';
	import InfoTooltip from '$lib/components/partials/InfoTooltip.svelte';

	let {
		character = $bindable(),
		cards,
		open = $bindable(false),
		componentID
	}: {
		character: StoredCharacter;
		cards?: StoredCard[];
		open: boolean;
		componentID: string;
	} = $props();

	// Properties that actually exist on the character
	function isProperty(p: string, systemKey: DeckSystem = GENERIC_KEY): boolean {
		// If no editable properties, return true (all properties are rendered)
		if (!propertiesToShow) return true;

		// Check if property is allowed
		const allowed = propertiesToShow[systemKey] as readonly string[] | undefined;
		if (!allowed || !allowed.includes(p)) return false;

		// Check if system exists for non-generic keys
		// if (systemKey !== GENERIC_KEY && !hasMechanics(systemKey)) return false;

		// If the system is generic, return true
		if (systemKey === GENERIC_KEY) return true;

		// Check if property exists on characterMechanics
		const systemMechanics = characterMechanics[systemKey];
		if (!systemMechanics) return false;

		// Check if the property 'p' is an existing propert in the chosen system
		const keys = Object.keys(systemMechanics);
		return keys.includes(p);
	}

	function hasMechanics(systemKey: DeckSystem): boolean {
		if (!character) return false;
		return systemKey in character.mechanics;
	}

	function getWidgetOrUndefined(componentID: string) {
		try {
			return getWidget(componentID);
		} catch (e) {
			return undefined;
		}
	}
	let widget: ReturnType<typeof getWidgetOrUndefined> = $derived(getWidgetOrUndefined(componentID));
	let propertiesToShow: CharacterProperties | undefined = $derived(widget?.characterProperties);

	// TABS AND SHOWING
	let derivedSystemTab: DeckSystem = $derived(
		propertiesToShow ? (Object.keys(propertiesToShow)[0] as DeckSystem) : GENERIC_KEY
	);
	let editSystemTab: DeckSystem = $state(derivedSystemTab);
	let showMultipleSystems: boolean = $derived(
		propertiesToShow == undefined || // undefined means show all
			Object.keys(propertiesToShow).length > 1 // if only one system, don't show tabs
	);

	// FILTERED COMPONENT DICT
	let filteredCharacterEditComponentDict = $derived.by(() => {
		// If no properties are defined, return full dict
		if (!propertiesToShow) return characterEditComponentDict;
		// Set empty dict to populate
		const filteredDict: typeof characterEditComponentDict = {};
		// Per system, add in the entires that are set in propertiesToShow
		for (const systemKey in propertiesToShow) {
			const props = propertiesToShow[systemKey as DeckSystem];
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
		let count = 0;
		for (const systemKey in filteredCharacterEditComponentDict) {
			const properties = filteredCharacterEditComponentDict[systemKey as DeckSystem];
			count += properties ? Object.keys(properties).length : 0;
			if (count > 1) return true;
		}
		return false;
	});

	// ACCORDION MANAGEMENT
	let openAccordionItems: string[] = $derived.by(() => {
		// Close all tabs if no properties are specified
		if (!propertiesToShow) return [];
		const props = propertiesToShow[editSystemTab];
		if (!props) return [];
		return props.map((p) => `${editSystemTab}:${p}`);
	});
</script>

<Dialog.Root
	bind:open
	onOpenChange={() => {
		// on:close, reset componentID
		componentID = '';
	}}
	onOpenChangeComplete={() => {
		// Basically on:open (and on:close)
		editSystemTab = derivedSystemTab; // update tab
	}}
>
	<Dialog.Content
		class="grid h-[calc(100vh-2rem)] w-full max-w-4xl! min-w-fit grid-rows-[max-content_1fr_max-content]"
	>
		<Dialog.Header>
			<Dialog.Title><Header variant="h2">Edit {widget?.name}</Header></Dialog.Title>
			<Dialog.Description>
				{#if showMultipleSystems}
					<ButtonGroup.Root>
						<!-- TABS -->
						{#each deckSystems as system}
							<Button
								variant={editSystemTab === system ? 'bold' : 'secondary'}
								onclick={() => (editSystemTab = system)}>{gameSystems[system].name}</Button
							>
						{/each}
					</ButtonGroup.Root>
				{/if}
				<!-- END TABS -->
			</Dialog.Description>
		</Dialog.Header>

		<!-- NEW, DYNAMIC COMPONENT RENDERING -->
		<div class="flex flex-col overflow-y-auto px-2">
			{#if showMultipleHeaders}
				<Accordion.Root type="multiple" value={openAccordionItems} class="mb-2">
					{#each Object.entries(filteredCharacterEditComponentDict) as [systemKey, properties]}
						{#if systemKey == editSystemTab}
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
								{#each Object.entries(properties) as [propertyKey, content]}
									{@const Component = content.component}
									<Accordion.Item value="{systemKey}:{propertyKey}">
										<Accordion.Trigger>
											<Header variant="h3">
												<InfoTooltip
													icon="mdi:information-outline"
													class="ml-2 inline-block align-middle text-muted-foreground"
												>
													{content.description}
												</InfoTooltip>
												{content.name}
											</Header>
										</Accordion.Trigger>
										<Accordion.Content class="overflow-visible">
											<Component {character} {cards} />
										</Accordion.Content>
									</Accordion.Item>
								{/each}
							{/if}
						{/if}
					{/each}
				</Accordion.Root>
			{:else}
				<!-- Render first available component (and only one) -->
				{@const Component = Object.values(Object.values(filteredCharacterEditComponentDict)[0])[0]
					.component}
				<Component {character} {cards} />
			{/if}
		</div>

		<!-- WIDGET -->
		{#if widget}
			<div class="flex w-full flex-col items-center justify-center gap-2 px-2 pb-4">
				<Label for="previewComponent">Preview</Label>
				<div
					id="previewComponent"
					class="max-h-[45vh]!"
					style="aspect-ratio: {widget.initialLayout.w}/{widget.initialLayout
						.h} !important; width: {widget.initialLayout.w * 150}px; height: {widget.initialLayout
						.h * 150}px; "
				>
					<widget.component bind:character {cards} />
				</div>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
