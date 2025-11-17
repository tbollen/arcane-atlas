<script lang="ts">
	import { type DeckProps } from '../types';

	// Import UI components
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Header } from '$lib/components/typography';
	import Icon from '@iconify/svelte';
	import * as Dialog from '$lib/components/ui/dialog';

	let { character = $bindable(), edit = $bindable() }: DeckProps = $props();

	// Dialog
	let openEditDialog: boolean = $state(false);
</script>

{#snippet banner()}
	<div
		id="banner"
		class="flex h-24 w-lg max-w-full min-w-fit flex-row items-center gap-4 bg-obsidian-500/5 px-4 py-2 text-start"
	>
		<div id="nameBlock" class="flex flex-col">
			<p class="displayText text-3xl">{character.name}</p>
			<p class="text-md text-muted-foreground">{character.subtitle}</p>
		</div>
		<img class="h-full rounded-full object-contain" src={character.imageUrl} alt={character.name} />
	</div>
{/snippet}

<div id="playerBanner" class=" relative">
	{#if edit}
		<button
			id="overlay"
			class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-transparent text-3xl text-transparent transition-colors hover:bg-foreground/50 hover:text-background"
			onclick={() => {
				openEditDialog = true;
			}}
		>
			<Icon icon="mdi:pencil" />
		</button>
	{/if}

	{@render banner()}
</div>

<!-- EDIT DIALOG -->
<Dialog.Root bind:open={openEditDialog}>
	<Dialog.Content class="min-w-fit">
		<Dialog.Header>
			<Dialog.Title><Header variant="h2">Player Banner</Header></Dialog.Title>
		</Dialog.Header>
		<div id="inputWrapper" class="flex flex-col gap-2 text-start">
			<Label for="name">Character Name</Label>
			<Input bind:value={character.name} placeholder="Character Name" />
			<br />
			<Label for="subtitle">Subtitle</Label>
			<Input bind:value={character.subtitle} placeholder="Subtitle" />
			<br />
			<Label for="image">Image URL</Label>
			<Input bind:value={character.imageUrl} placeholder="Image URL" />
			<br />
			<Label for="description">Preview</Label>
			{@render banner()}
		</div>
	</Dialog.Content>
</Dialog.Root>

<!-- {#if edit}
	<div id="playerBanner" class=" flex w-lg flex-col gap-2 bg-obsidian-500/5 px-4 py-2 text-start">
		<Header variant="h2">Player Banner</Header>
		<Label for="name">Character Name</Label>
		<Input bind:value={character.name} placeholder="Character Name" />
		<br />
		<Label for="subtitle">Subtitle</Label>
		<Input bind:value={character.subtitle} placeholder="Subtitle" />
		<br />
		<Label for="image">Image URL</Label>
		<Input bind:value={character.imageUrl} placeholder="Image URL" />
		<br />
		<Label for="description">Preview</Label>
		<img class="h-full rounded-full object-contain" src={character.imageUrl} alt={character.name} />
	</div>
{:else}
	<div
		id="playerBanner"
		class=" flex h-24 w-lg flex-row items-center gap-3 bg-obsidian-500/5 px-4 py-2 text-start"
	>
		<div id="nameBlock" class="flex flex-col">
			<p class="displayText text-3xl">{character.name}</p>
			<p class="text-md text-muted-foreground">{character.subtitle}</p>
		</div>
		<img class="h-full rounded-full object-contain" src={character.imageUrl} alt={character.name} />
	</div>
{/if} -->
