<script lang="ts">
	// Types and Utils
	import { StoredCharacter } from '$lib/domain/characters/character.svelte';
	import { GENERIC_KEY, type CharacterSystems } from '$lib/gameSystems';
	import { gameSystems } from '$lib/gameSystems';

	// UI Components
	import { Button } from '$lib/components/ui/button';
	import ListItem from '$lib/components/partials/ListItem.svelte';
	import SystemBadge from '$lib/components/ui/badge/systemBadge.svelte';
	import * as InputGroup from '$lib/components/ui/input-group/';
	import Icon from '@iconify/svelte';

	// Uitls
	import { verbose } from '$lib/utils/feedback/verbose';

	let { character }: { character: StoredCharacter } = $props();

	let selectedSystems: CharacterSystems[] = $state(character.systems);
	let selectedSystemsText = $derived.by(() => {
		const characterSystemsWithoutGeneric = selectedSystems.filter(
			(system) => system !== GENERIC_KEY
		);
		if (characterSystemsWithoutGeneric.length === 0) return 'No Game System Selected';
		if (characterSystemsWithoutGeneric.length === 1)
			return gameSystems[characterSystemsWithoutGeneric[0]].name;
		return `${characterSystemsWithoutGeneric.length} Systems Selected`;
	});

	// String that tells the user which new systems are selected, and which ones are removed when pressing "Save"
	let systemDiffText = $derived.by(() => {
		const addedSystems = selectedSystems.filter((system) => !character.systems.includes(system));
		const removedSystems = character.systems.filter(
			(system) => !selectedSystems.includes(system) && system !== GENERIC_KEY
		);
		return [addedSystems, removedSystems];
	});

	// GENERIC is always present in every character,
	let systemsWithoutGeneric = $derived(
		Object.fromEntries(Object.entries(gameSystems).filter(([key, _]) => key !== GENERIC_KEY))
	);

	// Searchbox stuff
	let searchTerm: string = $state('');
	let isFocussedOnInput: boolean = $state(false);
	let proxySystemSelector: number = $state(0);

	// Saving and staging (only 1 system can be staged at a time)
	let stagedSystems: CharacterSystems[] = $state(character.systems);
	function setStagedSystem(system: CharacterSystems) {
		if (stagedSystems.includes(system)) {
			// Remove system
			stagedSystems = stagedSystems.filter((s) => s !== system);
		} else {
			// Set staged system (plus Generic)
			stagedSystems = [GENERIC_KEY, system];
		}
	}

	// Diff of staged systems vs character systems (saved as tuple [addedSystems, removedSystems])
	let stagedSystemDiff = $derived.by(() => {
		const addedSystems = stagedSystems.filter((system) => !character.systems.includes(system));
		const removedSystems = character.systems.filter(
			(system) => !stagedSystems.includes(system) && system !== GENERIC_KEY
		);
		return [addedSystems, removedSystems];
	});

	// Searched and filtered systems
	let searchedSystems = $derived.by(() => {
		const _searchTerm = searchTerm.trim().toLowerCase();
		if (_searchTerm === '') return systemsWithoutGeneric;
		// Filter by name
		const systemsByName = Object.entries(systemsWithoutGeneric).filter(([key, system]) =>
			system.name.toLowerCase().includes(_searchTerm)
		);
		// Filter by creator
		const systemsByCreator = Object.entries(systemsWithoutGeneric)
			.filter(
				([key, system]) => system.creator && system.creator.toLowerCase().includes(_searchTerm)
			)
			.filter(
				// Avoid duplicates
				([key, _]) => !systemsByName.some(([k, _]) => k === key)
			);
		// Filter by description
		const systemsByDescription = Object.entries(systemsWithoutGeneric)
			.filter(
				([key, system]) =>
					system.description && system.description.toLowerCase().includes(_searchTerm)
			)
			.filter(
				// Avoid duplicates
				([key, _]) =>
					!systemsByName.some(([k, _]) => k === key) &&
					!systemsByCreator.some(([k, _]) => k === key)
			);
		// Combine (sorted) and remove duplicates
		return {
			...Object.fromEntries(systemsByName),
			...Object.fromEntries(systemsByCreator),
			...Object.fromEntries(systemsByDescription)
		};
	});
</script>

<div class="flex flex-col gap-4">
	<!-- BADGES -->
	<div class="flex flex-row gap-1">
		<div class="flex flex-row items-center gap-1">
			<span class="mr-2 border-b-2 border-blossom-500">Character Systems: </span>
			{#each stagedSystems as gameSystem}
				{#if gameSystem !== GENERIC_KEY}
					<SystemBadge
						{gameSystem}
						tooltip="Click to remove system"
						class="cursor-pointer  hover:bg-obsidian-500/10 hover:text-obsidian-500"
						onclick={() => setStagedSystem(gameSystem)}
					/>
				{:else}
					<SystemBadge {gameSystem} tooltip="Generic system is (always enabled)" />
				{/if}
			{/each}
		</div>
	</div>

	<div class="group relative">
		<InputGroup.Root
			onfocusin={() => {
				isFocussedOnInput = true;
			}}
			onfocusout={() => {
				isFocussedOnInput = false;
			}}
		>
			<InputGroup.Input
				value={searchTerm}
				oninput={(e) => {
					searchTerm = e.currentTarget.value;
				}}
				placeholder={'Search for game systems...'}
				list="search-options"
				onkeydown={(e) => {
					// If Enter is pressed and there is at least one filtered card, select the first one
					if (e.key === 'Enter' && Object.entries(searchedSystems).length > 0) {
						// Prevent form submission
						e.preventDefault();
						setStagedSystem(Object.keys(searchedSystems)[proxySystemSelector] as CharacterSystems);
					}
					// Arrow key navigation
					else if (e.key === 'ArrowDown') {
						e.preventDefault();
						proxySystemSelector = Math.min(
							proxySystemSelector + 1,
							Object.keys(searchedSystems).length - 1
						);
					} else if (e.key === 'ArrowUp') {
						e.preventDefault();
						proxySystemSelector = Math.max(proxySystemSelector - 1, 0);
					}
				}}
			/>
			<!-- Custom datalist - shown when focused within group and has search term -->
			<div
				id="customDatalist"
				tabindex="-1"
				class="pointer-events-none absolute top-[100%] right-0 left-0 z-50 mt-2 max-h-[50vh] overflow-y-auto rounded-xl border border-foreground/10 bg-background p-2 opacity-0 shadow-lg transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100"
				class:hidden={searchTerm.trim() === '' && !isFocussedOnInput}
			>
			{#if Object.keys(searchedSystems).length > 0}
				{@const g_info = gameSystems[GENERIC_KEY]}
				<ListItem
					icon={g_info.icon}
					class="opacity-50"
					mainText={g_info.name}
					subText="{g_info.description} (always enabled)"
				/>
				{#each Object.entries(searchedSystems) as [key, system], index}
					{@const isEnabled = character.systems.includes(key as CharacterSystems)}
					{@const isStagedToAdd = stagedSystems.includes(key as CharacterSystems) && !isEnabled}
					{@const isStagedToRemove = !stagedSystems.includes(key as CharacterSystems) && isEnabled}
					{@const twBackground = () => {
						if (isStagedToAdd) return 'bg-success-500/10';
						if (isStagedToRemove) return 'bg-threat-500/10';
						if (isEnabled) return 'bg-blossom-500/10';
						return '';
					}}
					<ListItem
						class="hover:bg-unset
						{twBackground()}
						{proxySystemSelector === index ? 'outline-2 outline-obsidian-500/10' : ''}"
						icon={{ icon: system.icon, class: isEnabled ? 'text-blossom-500' : '' }}
						onclick={() => {
							setStagedSystem(key as CharacterSystems);
						}}
						handle={{
							click: () => {
								setStagedSystem(key as CharacterSystems);
							},
							extended: true,
							variant: isStagedToAdd
								? 'success'
								: isStagedToRemove
									? 'destructive'
									: isEnabled
										? 'blossom'
										: 'outline',
							icon: isStagedToAdd
								? 'mdi:plus-circle'
								: isStagedToRemove
									? 'mdi:minus-circle'
									: isEnabled
										? 'mdi:check-circle-outline'
										: 'mdi:plus-circle-outline'
						}}
						mainText={system.name}
						subText={system.description}
						onmouseenter={() => {
							proxySystemSelector = index;
						}}
					/>
				{/each}
			{:else}
					<ListItem
						mainText="No results"
						subText="Try a different search term"
						class="opacity-50"
					/>
				{/if}
			</div>
		</InputGroup.Root>
	</div>

	<!-- DIFFERENCES -->
	<div class="grid grid-cols-[auto_1fr] gap-y-2">
		{#if stagedSystemDiff[0].length > 0}
			<span class="mr-2 border-b-2 border-success-500">Adding: </span>
			<div class="flex flex-row items-center gap-1">
				{#each stagedSystemDiff[0] as gameSystem}
					<SystemBadge {gameSystem} />
				{/each}
			</div>
		{/if}
		{#if stagedSystemDiff[1].length > 0}
			<span class="mr-2 border-b-2 border-threat-500">Removing: </span>
			<div class="flex flex-row items-center gap-1">
				{#each stagedSystemDiff[1] as gameSystem}
					<SystemBadge
						{gameSystem}
						class="cursor-pointer hover:bg-obsidian-500/10 hover:text-obsidian-500"
						tooltip="Discard changes"
						onclick={() => {
							setStagedSystem(gameSystem);
						}}
					/>
				{/each}
			</div>
		{/if}
	</div>
	<!-- CONFIRM BUTTONS -->
	<div class="flex flex-row">
		{#if stagedSystemDiff[0].length > 0 || stagedSystemDiff[1].length > 0}
			<Button
				class="mt-2"
				variant="bold"
				onclick={() => {
					verbose(() => {
						// Add staged systems
						stagedSystemDiff[0].forEach((sys) => {
							character.addSystem(sys);
						});
						// Remove staged systems
						stagedSystemDiff[1].forEach((sys) => {
							character.removeSystem(sys);
						});
						// Reset staged systems
						stagedSystems = character.systems;
					});
				}}>Save Changes</Button
			>
		{/if}
		{#if stagedSystemDiff[0].length > 0 || stagedSystemDiff[1].length > 0}
			<Button
				class="mt-2 ml-2"
				variant="ghost"
				onclick={() => {
					stagedSystems = character.systems;
				}}>Discard Changes</Button
			>
		{/if}
	</div>
</div>
