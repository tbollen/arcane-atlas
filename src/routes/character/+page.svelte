<script lang="ts">
	// UI Components
	import { Header } from '$lib/components/typography/';
	import { Button } from '$lib/components/ui/button/';
	import UnderConstruction from '$lib/components/partials/UnderConstruction.svelte';
	import CharacterCard from '$lib/components/partials/character/CharacterCard.svelte';
	import '$lib/styles';

	// Utils
	import { onMount, getContext, setContext } from 'svelte';
	import { ck, lsk } from '$lib/utils/storage/keys.js';
	import { CharacterStore, StoredCharacter } from '$lib/domain/characters/character.svelte.js';
	import type { UserID } from '$lib/domain/';

	// Stores

	const characterStore = getContext<CharacterStore>(ck.characterStore);

	let { data } = $props();

	// FUNCTIONS //

	function addNewCharacter(template?: Partial<StoredCharacter>) {
		if (!data.user) {
			alert('You must be logged in to create a character.');
			throw new Error('Client not logged in');
		}
		const userId = data.user.id as UserID;

		const newCharacter = characterStore.addNew({ userId, data: template });
		console.log('newCharacter', newCharacter);
	}

	onMount(async () => {
		// DO LATER
	});
</script>

<main class="px-4">
	<Button onclick={() => addNewCharacter()}>Add Character</Button>
	<div class="characterCardGrid">
		{#each characterStore.characters as character}
			<CharacterCard {character} />
		{/each}
	</div>

	<!-- UNDER CONSTRUCTION PART -->
	<Header variant="h1" class="mb-8">Character</Header>
	<UnderConstruction class="h-36">
		<Header variant="h3" tag="h2">Planned Features</Header>
		<ul class="list">
			<li>Character creation</li>
			<li>Sheets and statblocks</li>
			<li>Creating character card sets</li>
			<li>Play Deck for on-the-go overview of characters during sessions</li>
		</ul>
		<Header variant="h3" tag="h2">Feature Wishlist</Header>
		<ul class="list">
			<li>Backstories</li>
			<li>Game logbooks</li>
			<li>
				...submit your ideas to <a
					class="text-threat-600 hover:underline"
					target="_blank"
					href="https://github.com/tbollen/arcane-rift-companion/issues/new">GitHub</a
				>
			</li>
		</ul>
	</UnderConstruction>
</main>

<style>
	.characterCardGrid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(var(--container-lg), min-content));
		gap: 2rem;
		justify-content: center;
	}
</style>
