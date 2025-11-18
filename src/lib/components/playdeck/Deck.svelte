<script lang="ts">
	// Import UI components
	import Icon from '@iconify/svelte';

	// Import partials
	import GameSystemSelector from './GameSystemSelector.svelte';

	// Import necessary types and utils
	import { type DeckComponent, type DeckProps, DeckMap } from './';
	import { GENERIC_KEY } from '$lib/gameSystems';

	let {
		deck = $bindable(),
		character,
		system = $bindable(GENERIC_KEY),
		edit = $bindable(false)
	}: DeckProps = $props();

	// Wrapper styling
	const editStyle = $derived(edit ? 'outline-1 outline-threat-500 rounded-lg overflow-hidden' : '');
	const wrapperStyle = $derived(` ${editStyle} relative`);

	// Create an array of Components from the filtered keys
	const ComponentArray: DeckComponent[] = $derived(deck.map((comp) => DeckMap[comp].component));
</script>

{#if edit}
	<GameSystemSelector bind:character bind:edit bind:system />
{/if}
<div id="Deck" class="flex flex-row flex-wrap">
	{#each deck as widget}
		{@const Component = DeckMap[widget].component}
		<!-- Component in wrapper -->
		<div class={wrapperStyle}>
			{#if edit}
				<div
					id="editHandle"
					class=" absolute top-0 right-0 z-20 h-6 w-fit rounded-lg bg-obsidian-500/20"
				>
					<button id="dragHandle" class="flex cursor-pointer flex-row gap-1 pl-1">
						<span class="text-sm text-muted-foreground">drag</span>
						<Icon icon="mdi:drag" class="text-xl" />
					</button>
				</div>
			{/if}
			<Component bind:character bind:edit />
		</div>
	{/each}
</div>
