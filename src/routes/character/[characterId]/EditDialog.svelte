<script lang="ts">
	// Types and modules
	import {
		StoredCharacter,
		type CharacterProperties
	} from '$lib/domain/characters/character.svelte';
	import type { StoredCard } from '$lib/domain/cards/cardStore.svelte';

	import { AR_KEY, gameSystems, GENERIC_KEY, type CharacterSystems } from '$lib/gameSystems';
	import { deckSystems, type DeckSystem } from '../../../lib/components/playdeck';

	// WidgetMap things
	import { getWidget } from '../../../lib/components/playdeck';

	// Import UI components
	import { Label } from '$lib/components/ui/label';
	import { Header } from '$lib/components/typography';
	import Icon from '@iconify/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import * as ButtonGroup from '$lib/components/ui/button-group/';

	// Character Edit Partials
	import { CharacterEditAccordion } from '$lib/components/partials/character/edit';

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
	let editSystemTab: DeckSystem = $state(GENERIC_KEY);
	let showMultipleSystems: boolean = $derived(
		propertiesToShow == undefined || // undefined means show all
			Object.keys(propertiesToShow).length > 1 // if only one system, don't show tabs
	);

	// Update editSystemTab when derivedSystemTab changes
	$effect(() => {
		editSystemTab = derivedSystemTab;
	});

	// Accordion state - bindable for external control
	let openAccordionItems: string[] = $state([]);
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
			<CharacterEditAccordion
				bind:character
				{cards}
				properties={propertiesToShow}
				bind:activeSystemTab={editSystemTab}
				bind:openItems={openAccordionItems}
				showHeaders={true}
				autoOpenItems={true}
			/>
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
