<script lang="ts">
	import { type DeckItemProps } from './.';

	// Import UI components
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Header } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';

	// Game system info
	import { gameSystems, type CharacterSystems, characterMechanics } from '$lib/gameSystems';
	const characterSystems = Object.keys(gameSystems) as CharacterSystems[];

	let {
		character = $bindable(),
		edit = $bindable(),
		system = $bindable()
	}: DeckItemProps & { system: CharacterSystems } = $props();

	let gameSystemInfo = gameSystems[system];
	function addGameSystem() {
		console.log('Character', character.mechanics);
		character = character.addSystem(system);
	}
	const characterEnabledSystems = $derived(character.systems);
	function handleSystemSelect(_system: CharacterSystems) {
		console.error('HANDLING SYSTEM CHANGE');
		console.log('Character Systems', characterEnabledSystems);
		console.log('Selected System', _system);
		system = _system;
	}
</script>

{#if edit}
	<Select.Root
		type="single"
		name="selectedSystem"
		onValueChange={(value) => handleSystemSelect(value as CharacterSystems)}
	>
		<Select.Trigger class="w-full">
			{gameSystems[system].name}
		</Select.Trigger>
		<Select.Content>
			{#each characterSystems as system}
				<Select.Item value={system}>{gameSystems[system].name}</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
	{#each characterSystems as system}
		||{gameSystems[system].name}||
	{/each}
	<Button variant="advanced" onclick={addGameSystem}>Add {gameSystemInfo?.name}</Button>
{/if}
