<script lang="ts">
	// Import UI components
	import * as Dialog from '$lib/components/ui/dialog';
	import { Header } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';

	// Deck types and consts
	import { type ValidDeckComponent, type DeckComponent, DeckMap } from '$lib/components/playdeck';
	import { type DeckProps } from '$lib/components/playdeck';

	// System Info
	import { gameSystems } from '$lib/gameSystems';

	let {
		open = $bindable(false),
		character,
		onAdd
	}: {
		open: boolean;
		onAdd: (widgets: ValidDeckComponent[]) => void;
	} & Pick<DeckProps, 'character'> = $props();

	let selectedWidgets: ValidDeckComponent[] = $state([]);
	//
	const ComponentArray: DeckComponent[] = Object.values(DeckMap).map((item) => item.component);

	function toggleWidget(key: string) {
		if (!Object.keys(DeckMap).includes(key)) throw new Error('Invalid widget key');
		const widget = key as ValidDeckComponent;
		if (selectedWidgets.includes(widget)) {
			selectedWidgets = selectedWidgets.filter((item) => item !== widget);
		} else {
			selectedWidgets = [...selectedWidgets, widget];
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger />
	<Dialog.Content class="min-w-fit">
		<Dialog.Header>
			<Header variant="h3">Add Widget</Header>
		</Dialog.Header>
		<!-- TEST WITH A SELECT ELEMENT -->
		<Select.Root type="multiple" name="selectedWidgets" bind:value={selectedWidgets}>
			<Select.Trigger
				>{selectedWidgets.length > 0
					? `Selected ${selectedWidgets.length} widgets`
					: 'Please select a widget'}</Select.Trigger
			>
			<Select.Content>
				{#each Object.entries(DeckMap) as [key, value]}
					<Select.Item value={key}>{value.name}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<!-- VIEWABLE SELECTOR -->
		<div id="widgetGrid" class="grid gap-2">
			{#each Object.entries(DeckMap) as [key, value]}
				{@const Component = value.component}
				{@const selected = selectedWidgets.includes(key as ValidDeckComponent)}
				<button
					id="widget"
					class="cursor-pointer overflow-hidden rounded-lg {selected
						? 'outline-2 outline-blossom-500'
						: 'outline-1 outline-obsidian-500/20'}"
					onclick={() => {
						toggleWidget(key);
					}}
				>
					<div id="component{key}">
						<Component bind:character edit={false} />
					</div>
					<div
						class=" flex w-full flex-row items-center gap-2 px-4 py-2 {selected
							? 'bg-blossom-500'
							: ''}"
					>
						<span class="text-sm">{value.name}</span>
						<Badge variant="default" class="ml-auto">{gameSystems[value.system].name}</Badge>
					</div>
				</button>
			{/each}
		</div>
		<!-- BUTTON -->
		<Dialog.Footer>
			<!-- Selected Widgets -->
			{#if selectedWidgets.length > 0}
				<span>Selected {selectedWidgets.length} widgets</span>
			{/if}
			<!-- Add button -->
			<Button
				variant="default"
				onclick={() => {
					selectedWidgets = selectedWidgets;
					onAdd($state.snapshot(selectedWidgets));
					open = false;
				}}
				><Icon icon="mdi:plus" />Add
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
