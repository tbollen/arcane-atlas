<!-- Basic card component to display character information -->
<!-- Used for lists and overviews -->

<script lang="ts">
	// UI components
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button/';
	import { Badge } from '$lib/components/ui/badge';

	// Utils
	import type { StoredCharacter } from '$lib/domain/characters/character.svelte.js';

	// Active Character Store
	import { activeCharacter } from '$lib/stores/activeCharacter.svelte';

	// Props
	interface Props {
		character: StoredCharacter;
	}

	var { character }: Props = $props();

	let isActive = $derived(activeCharacter && activeCharacter.id == character.id);
</script>

<button id="characterCard" class="w-lg shrink-0">
	<header
		id="banner"
		class="relative mt-16 flex h-16 items-end-safe border-b-2 border-threat-500 pr-2 text-white
        {isActive ? 'bg-blossom-500' : 'bg-obsidian-900/50'}"
	>
		<img src={character.imageUrl} alt={character.name} class="absolute bottom-0 left-2 h-32" />
		<div id="mainInfo" class="ml-36 flex w-full flex-col items-start">
			<h1 id="name" class="displayText text-3xl font-bold">{character.name}</h1>
			<p id="subtitle">{character.subtitle}</p>
		</div>
		{#if character.clientPermissions.isOwner}
			<Button
				class="place-self-center text-inherit"
				variant="link"
				href="/character/{character.id}/edit"
			>
				Edit
				<Icon icon="mdi:pencil" />
			</Button>
		{/if}
	</header>
	<div id="content" class="'bg-obsidian-500/5' px-4 py-2 text-start">
		<h2 id="descriptionTitle" class="text-sm font-semibold">Description</h2>
		<p id="description" class="">
			{character.description}
		</p>
	</div>
	<footer
		id="footer"
		class="flex flex-row flex-wrap items-center bg-obsidian-500/5 px-1 py-2 text-start"
	>
		{#each character.systems as system}
			<Badge variant="bold" class="h-min">{system}</Badge>
		{/each}
		<Button
			class="ml-auto"
			variant="ghost"
			onclick={() => {
				$activeCharacter = character;
			}}>Set Active</Button
		>
	</footer>
</button>

<style>
	.characterCard {
		background: red;
	}
</style>
