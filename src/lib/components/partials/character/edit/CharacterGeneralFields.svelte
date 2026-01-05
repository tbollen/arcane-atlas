<script lang="ts">
	// UI Components
	import { Label } from '$lib/components/ui/label/';
	import { Input } from '$lib/components/ui/input/';
	import { Textarea } from '$lib/components/ui/textarea/';
	import { Button } from '$lib/components/ui/button/';
	import * as Avatar from '$lib/components/ui/avatar/';
	import * as Dialog from '$lib/components/ui/dialog/';

	// Types and Utils
	import { StoredCharacter } from '$lib/domain/characters/character.svelte';
	import type { CharacterEditProps } from './propsType';

	let { character }: CharacterEditProps = $props();

	let openAvatarDialog = $state(false);
</script>

<div class="flex flex-col [&>*:not(:first-child)]:mt-4">
	<!-- Name -->
	<div class="[&>*:not(:first-child)]:mt-1">
		<Label for="name">Character Name</Label>
		<Input bind:value={character.name} placeholder="Character Name" />
	</div>
	<!-- Subtitle -->
	<div class="[&>*:not(:first-child)]:mt-1">
		<Label for="subtitle">Subtitle</Label>
		<Input bind:value={character.subtitle} placeholder="Subtitle" />
	</div>
	<!-- Description -->
	<div class="[&>*:not(:first-child)]:mt-1">
		<Label for="description">Description</Label>
		<Textarea
			class="h-max !resize-y"
			bind:value={character.description}
			placeholder="Description"
		/>
	</div>
	<!-- Image URL / Avatar -->
	<div class="grid grid-cols-[max-content_1fr] items-start gap-4 gap-x-3 gap-y-1">
		<Button
			class=" col-start-1 row-span-2 h-16 w-16 cursor-pointer rounded-full p-0 outline-1 outline-obsidian-500"
			onclick={() => (openAvatarDialog = true)}
			variant="ghost"
		>
			{@render avatar()}
		</Button>
		<Label class="mt-auto" for="image">Image URL</Label>
		<Input class="align-start" bind:value={character.imageUrl} placeholder="Image URL" />
	</div>
	<!-- Avatar Dialog -->
	<Dialog.Root bind:open={openAvatarDialog}>
		<Dialog.Portal>
			<Dialog.Content class="justify-items-center">
				<Dialog.Title class="mb-4 text-center text-2xl font-semibold">Character Avatar</Dialog.Title
				>
				<div class="h-82 w-82 overflow-hidden rounded-full outline-2 outline-obsidian-500">
					{@render avatar()}
				</div>
				<div class="flex w-full flex-col gap-2">
					<Label for="image">Image URL</Label>
					<Input bind:value={character.imageUrl} placeholder="Image URL" />
				</div>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
</div>

{#snippet avatar()}
	<Avatar.Root class="h-full w-full">
		<Avatar.AvatarImage src={character.imageUrl} alt={character.name} />
		<Avatar.AvatarFallback>
			{character.name ? character.name.charAt(0) : '?'}
		</Avatar.AvatarFallback>
	</Avatar.Root>
{/snippet}
