<script lang="ts">
	// Types and modules
	import { StoredCharacter } from '$lib/domain/characters/character.svelte';
	import type { CharacterMechanics } from '$lib/gameSystems';

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

	let {
		character = $bindable(),
		editableProperties,
		open = $bindable(false),
		componentID
	}: {
		character: StoredCharacter;
		editableProperties: string[];
		open: boolean;
		componentID: string;
	} = $props();

	// Properties that actually exist on the character
	let _properties: string[] = $derived(
		editableProperties.filter((p) => Object.keys(character).includes(p))
	);

	function isProperty(p: string): boolean {
		return editableProperties[0] == '*' || editableProperties.includes(p);
	}

	function getWidgetOrUndefined(componentID: string) {
		try {
			return getWidget(componentID);
		} catch (e) {
			return undefined;
		}
	}
	let widget: ReturnType<typeof getWidgetOrUndefined> = $derived(getWidgetOrUndefined(componentID));
</script>

<Dialog.Root
	bind:open
	onOpenChange={() => {
		componentID = '';
		editableProperties = [];
	}}
>
	<Dialog.Content
		class="grid h-[calc(100vh-2rem)] min-w-fit grid-rows-[max-content_1fr_max-content]"
	>
		<Dialog.Header>
			<Dialog.Title><Header variant="h2">Edit {widget?.name}</Header></Dialog.Title>
		</Dialog.Header>
		<div
			id="inputWrapper"
			class="
                flex flex-col
                gap-2 overflow-y-scroll px-2 text-start
                [&>Label:not(:first-child)]:mt-6
                "
		>
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
		editableProperties = ['*'];
	}}>OPEN</Button
>
