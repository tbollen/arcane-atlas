<script lang="ts">
	// Types and modules
	import {
		StoredCharacter,
		type CharacterProperties
	} from '$lib/domain/characters/character.svelte';
	import {
		AR_KEY,
		characterMechanics,
		gameSystems,
		GENERIC_KEY,
		type CharacterMechanics
	} from '$lib/gameSystems';
	import { deckSystems, type DeckSystem } from '.';

	// WidgetMap things
	import { widgetMap, widgetIDs, getWidget } from '.';

	// Import UI components
	import { Label } from '$lib/components/ui/label';
	import { Header } from '$lib/components/typography';
	import Icon from '@iconify/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { arcaneRiftCharacterMechanics } from '$lib/gameSystems/ArcaneRift/ar_characters';

	let {
		character = $bindable(),
		open = $bindable(false),
		componentID
	}: {
		character: StoredCharacter;
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

	///////////////////////////////////
	// VARS FOR INPUTS
	let newAspectInput: string = $state('');
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
		class="grid h-[calc(100vh-2rem)] min-w-fit grid-rows-[max-content_1fr_max-content]"
	>
		<Dialog.Header>
			<Dialog.Title><Header variant="h2">Edit {widget?.name}</Header></Dialog.Title>
			<Dialog.Description>
				{#if showMultipleSystems}
					<!-- TABS -->
					{#each deckSystems as system}
						<Button
							variant={editSystemTab === system ? 'bold' : 'secondary'}
							onclick={() => (editSystemTab = system)}>{gameSystems[system].name}</Button
						>
					{/each}
				{/if}
				<!-- END TABS -->
			</Dialog.Description>
		</Dialog.Header>
		<div
			id="inputWrapper"
			class="
                flex flex-col
                gap-2 overflow-y-scroll px-2 text-start
                [&>Label:not(:first-child)]:mt-6
                "
		>
			<!-- Generic system properties -->
			{#if editSystemTab == GENERIC_KEY}
				{#if isProperty('name')}
					<Label for="name">Character Name</Label>
					<Input bind:value={character.name} placeholder="Character Name" />
				{/if}
				{#if isProperty('subtitle')}
					<Label for="subtitle">Subtitle</Label>
					<Input bind:value={character.subtitle} placeholder="Subtitle" />
				{/if}
				{#if isProperty('imageUrl')}
					<Label for="image">Image URL</Label>
					<Input bind:value={character.imageUrl} placeholder="Image URL" />
				{/if}
				{#if isProperty('description')}
					<Label for="description">Description</Label>
					<Textarea
						class="h-max !resize-y"
						bind:value={character.description}
						placeholder="Description"
					/>
				{/if}
			{/if}
			<!-- Arcane Rift -->
			{#if editSystemTab == AR_KEY}
				{#if !hasMechanics(AR_KEY)}
					Character does not have Arcane Rift mechanics
					<Button
						onclick={() => {
							character.mechanics[AR_KEY] = arcaneRiftCharacterMechanics;
						}}
					>
						Add Arcane Rift
					</Button>
				{:else if isProperty('aspects', AR_KEY)}
					<!-- ASPECTS -->
					{#if character.mechanics[AR_KEY]?.aspects && character.mechanics[AR_KEY]?.aspects?.length > 0}
						{#each character.mechanics[AR_KEY]?.aspects || [] as aspect}
							{aspect}
						{/each}
					{/if}
					<div id="addAspect" class="flex flex-row gap-2 p-2">
						<Input
							placeholder="Add new aspect..."
							bind:value={newAspectInput}
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									alert('TODO: Add new aspect');
									newAspectInput = '';
								}
							}}
						/>
						<Button
							type="submit"
							onclick={() => {
								alert('TODO: Add new aspect');
								newAspectInput = '';
							}}><Icon icon="mdi:plus" /></Button
						>
					</div>
				{/if}
			{/if}
			<!-- WIDGET -->
			{#if widget}
				<Label for="previewComponent">Preview</Label>
				<div
					id="previewComponent"
					class="max-h-[600px] max-w-[450px]"
					style="aspect-ratio: {widget.initialLayout.w}/{widget.initialLayout.h}"
				>
					<widget.component bind:character edit={false} />
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

<Button
	onclick={() => {
		open = true;
	}}>OPEN</Button
>
