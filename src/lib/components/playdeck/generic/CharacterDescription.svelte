<script lang="ts">
	import { type DeckProps } from '../.';

	// Import UI components
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Header } from '$lib/components/typography';
	import Icon from '@iconify/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';

	let { character = $bindable(), edit = $bindable() }: DeckProps = $props();

	// Dialog
	let openEditDialog: boolean = $state(false);
</script>

{#snippet banner()}
	<div id="banner" class="w-lg max-w-full min-w-fit gap-4 bg-obsidian-500/5 px-4 py-2 text-start">
		<Header variant="h3">Description</Header>
		<p>{character.description}</p>
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
			<Dialog.Title><Header variant="h2">Character Description</Header></Dialog.Title>
		</Dialog.Header>
		<div id="inputWrapper" class="flex flex-col gap-2 text-start">
			<Label for="description">Description</Label>
			<Textarea bind:value={character.description} placeholder="Description" />
			<br />
			<Label for="description">Preview</Label>
			{@render banner()}
		</div>
	</Dialog.Content>
</Dialog.Root>
