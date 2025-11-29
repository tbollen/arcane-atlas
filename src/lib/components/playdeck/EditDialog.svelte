<script lang="ts">
	// Types and modules
	import { verbose } from '$lib/utils/feedback/verbose';
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
	import InfoTooltip from '../partials/InfoTooltip.svelte';
	import Mastery from '../partials/arcaneRift/Mastery.svelte';

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
	let newAspectInput = $state({ short: '', description: '' });
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
				{#if !hasMechanics(AR_KEY) || !character.mechanics[AR_KEY] || !character.fn[AR_KEY]}
					Character does not have Arcane Rift mechanics
					<Button
						onclick={() => {
							character.addSystem(AR_KEY);
						}}
					>
						Add Arcane Rift
					</Button>
				{:else}
					{#if isProperty('aspects', AR_KEY)}
						<!-- ASPECTS -->
						<Header variant="h3">Aspects</Header>
						{#if character.mechanics[AR_KEY]?.aspects && character.mechanics[AR_KEY]?.aspects?.length > 0}
							<div id="aspects" class="flex flex-col gap-0">
								{#each character.mechanics[AR_KEY]?.aspects || [] as aspect, index}
									<div
										class="flex flex-row items-center gap-4 border-obsidian-500 py-2 [:not(:first-child)]:border-t-2"
									>
										<div class="flex grow flex-col justify-center gap-1">
											<p class="font-bold">{aspect.short}</p>
											<p>{aspect.description}</p>
										</div>

										<Button
											size="icon"
											disabled={index == 0}
											onclick={() =>
												verbose(() => character.fn[AR_KEY]!.moveAspect(index, index - 1))}
										>
											<Icon icon="mdi:arrow-up" /></Button
										>
										<Button
											size="icon"
											disabled={index == character.mechanics[AR_KEY]?.aspects?.length - 1}
											onclick={() =>
												verbose(() => character.fn[AR_KEY]!.moveAspect(index, index + 1))}
										>
											<Icon icon="mdi:arrow-down" /></Button
										>
										<Button
											size="icon"
											onclick={() => verbose(() => character.fn[AR_KEY]!.removeAspect(index))}
											><Icon icon="mdi:close" /></Button
										>
									</div>
								{/each}
							</div>
						{/if}
						<div id="addAspect" class="flex flex-col gap-2 p-2">
							<Input placeholder="Short name..." bind:value={newAspectInput.short} />
							<Textarea
								placeholder="Aspect Description..."
								bind:value={newAspectInput.description}
							/>
							<Button
								onclick={() => {
									verbose(() => {
										character.fn[AR_KEY]!.addAspect(newAspectInput);
										newAspectInput = { short: '', description: '' };
									});
								}}><Icon icon="mdi:plus" /> Add</Button
							>
						</div>
					{/if}
					{#if isProperty('consequences', AR_KEY)}
						<!-- CONSEQUENCES -->
						<Header variant="h3">Consequences</Header>
						<p class="text-sm text-muted-foreground">
							Consequences are added and removed on the go. You can edit them in the widget itself
						</p>
					{/if}
					{#if isProperty('stats', AR_KEY)}
						<!-- STATS -->
						<Header variant="h3">Stats</Header>
						<Header variant="h4">Characteristics</Header>
						{#if character.mechanics[AR_KEY]}
							<!-- SUM INDICATOR -->
							<p class="text-sm text-muted-foreground">
								Total sum: {Object.values(character.mechanics[AR_KEY].stats.characteristics)
									.map((c) => c.value)
									.reduce((sum, val) => sum + val, 0)} /
								{character.mechanics[AR_KEY].rules.characteristics.maxSum}
							</p>
							<!-- CHARACTERISTICS -->
							<div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-8">
								{#each Object.values(character.mechanics[AR_KEY].stats.characteristics) as char, index}
									{@const rules = character.mechanics[AR_KEY].rules.characteristics}
									{@const maxSumReached =
										Object.values(character.mechanics[AR_KEY].stats.characteristics)
											.map((c) => c.value)
											.reduce((sum, val) => sum + val, 0) >= rules.maxSum}
									<div class="grid grid-cols-2 gap-x-2 gap-y-0.5">
										<p
											id="char-{char.name}"
											class=" col-span-full text-center font-semibold uppercase"
										>
											{char.name}
										</p>
										<div
											id="char-{char.name}-value"
											class=" col-span-full rounded-lg bg-obsidian-200 py-3 text-center text-xl"
										>
											{char.value}
										</div>
										<Button
											variant={char.value <= rules.minValue ? 'ghost' : 'secondary'}
											disabled={char.value <= rules.minValue}
											onclick={() =>
												verbose(() =>
													character.fn[AR_KEY]!.updateCharacteristic(char.name, char.value - 1)
												)}
										>
											<Icon icon="mdi:minus" />
										</Button>
										<Button
											variant={char.value >= rules.maxValue || maxSumReached
												? 'ghost'
												: 'secondary'}
											disabled={char.value >= rules.maxValue || maxSumReached}
											onclick={() =>
												verbose(() =>
													character.fn[AR_KEY]!.updateCharacteristic(char.name, char.value + 1)
												)}
										>
											<Icon icon="mdi:plus" />
										</Button>
									</div>
								{/each}
							</div>
							<!-- SKILLS -->
							<div id="Skills">
								<Header variant="h4">Stats</Header>
								<!-- SUM INDICATOR -->
								<p class="text-sm text-muted-foreground">
									Total sum: {Object.values(character.mechanics[AR_KEY].stats.skills)
										.map((c) => c.value)
										.reduce((sum, val) => sum + val, 0)} /
									{character.mechanics[AR_KEY].rules.skills.maxSum}
								</p>
								<section class="mb-4 grid grid-cols-[repeat(auto-fill,minmax(22rem,1fr))] gap-8">
									{#each Object.values(character.mechanics[AR_KEY].stats.characteristics) as char, index}
										{@const rules = character.mechanics[AR_KEY].rules.skills}
										{@const sum = Object.values(character.mechanics[AR_KEY].stats.skills)
											.map((s) => s.value)
											.reduce((sum, val) => sum + val, 0)}
										{@const maxSumReached = sum >= rules.maxSum}
										<!-- GO THROUGH SKILLS FOR EACH CHARACTERISTIC -->
										<div
											id="charskills-{char.name}"
											class="grid grid-cols-[1fr_2fr] gap-x-4 gap-y-1"
										>
											<h5
												class="col-span-2 bg-obsidian-800 pl-3 font-semibold text-white uppercase"
											>
												{char.name}
											</h5>
											{#each Object.values(character.mechanics[AR_KEY].stats.skills) as skill, skillIndex}
												{#if skill.characteristic == char.name}
													<!-- Name -->
													<p class="font-semibold">{skill.name}</p>
													<!-- Value controls -->
													<div
														id="char-{skill.name}-valuecontrol"
														class="flex w-max items-center gap-2"
													>
														<Button
															variant="bold"
															disabled={skill.value <= 0}
															onclick={() =>
																verbose(() =>
																	character.fn[AR_KEY]!.updateSkill(skill, skill.value - 1)
																)}><Icon icon="mdi:minus" /></Button
														>
														<Mastery
															value={skill.value}
															max={rules.maxMastery}
															class="h-8 w-max border-t-2 border-b-2 border-obsidian-500/20 px-3 text-center"
														/>
														<Button
															variant="bold"
															disabled={skill.value >= rules.maxMastery || maxSumReached}
															onclick={() =>
																verbose(() =>
																	character.fn[AR_KEY]!.updateSkill(skill, skill.value + 1)
																)}><Icon icon="mdi:plus" /></Button
														>
													</div>
												{/if}
											{/each}
										</div>
									{/each}
								</section>
							</div>
						{/if}
					{/if}
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
					<widget.component bind:character />
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
