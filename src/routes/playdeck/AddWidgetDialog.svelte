<script lang="ts">
	// Import UI components
	import * as Dialog from '$lib/components/ui/dialog';
	import { Header } from '$lib/components/typography';
	import { Button } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';

	// Deck types and consts
	import { widgetMap } from '$lib/components/playdeck';
	import { type WidgetComponentProps } from '$lib/components/playdeck/widget';

	// System Info
	import { gameSystems } from '$lib/gameSystems';

	let {
		open = $bindable(false),
		character,
		onAdd
	}: {
		open: boolean;
		onAdd: (widgets: string[]) => void;
	} & Pick<WidgetComponentProps, 'character'> = $props();

	let selectedWidgets: string[] = $state([]);
	//

	function toggleWidget(key: string) {
		if (!Object.keys(widgetMap).includes(key)) throw new Error('Invalid widget key');
		const widget = key as string;
		if (selectedWidgets.includes(widget)) {
			selectedWidgets = selectedWidgets.filter((item) => item !== widget);
		} else {
			selectedWidgets = [...selectedWidgets, widget];
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger />
	<Dialog.Content
		class="
		max-h-[90vh]
		!max-w-[min(calc(100%-2rem),60rem)]
		grid-rows-[max-content_max-content_1fr_max-content]
		"
	>
		<Dialog.Header>
			<Header variant="h3">Add Widget</Header>
		</Dialog.Header>
		<Dialog.Description>
			Select widgets to add to your deck. You can select multiple widgets at once.
		</Dialog.Description>
		<!-- VIEWABLE SELECTOR -->
		<div id="widgetWrapper" class="overflow-y-scroll">
			<div
				id="widgetGrid"
				class="columns-1 gap-6 space-y-6 overflow-y-auto p-4 text-center md:columns-2"
			>
				{#each Object.entries(widgetMap) as [key, value]}
					{@const Component = value.component}
					{@const selected = selectedWidgets.includes(key as string)}
					{@const aspectRatio = `${value.initialLayout.w}/${value.initialLayout.h}`}
					<button
						id="widget"
						style="break-inside: avoid;"
						class="
					w-full
					max-w-[450px]
					cursor-pointer
					rounded-lg
					{selected
							? 'shadow-lg outline-2 outline-threat-500'
							: 'shadow-none outline-1 outline-obsidian-500/50'}"
						onclick={() => {
							toggleWidget(key);
						}}
					>
						<div id="component:{key}" style="aspect-ratio: {aspectRatio}" class="flex flex-col">
							<Component bind:character edit={false} />
						</div>
						<div
							class=" flex h-12 w-full flex-row items-center gap-2 overflow-hidden border-t-2 border-threat-500 px-4 py-2"
						>
							<span class="text-sm">{value.name}</span>
							<Badge variant="default" class="ml-auto">{gameSystems[value.system].name}</Badge>
						</div>
					</button>
				{/each}
			</div>
		</div>
		<!-- BUTTON -->
		<Dialog.Footer>
			<!-- Selected widgets -->
			<Select.Root type="multiple" name="selectedWidgets" bind:value={selectedWidgets}>
				<Select.Trigger
					>{selectedWidgets.length > 0
						? `Selected ${selectedWidgets.length} widgets`
						: 'Please select a widget'}</Select.Trigger
				>
				<Select.Content>
					{#each Object.entries(widgetMap) as [key, value]}
						<Select.Item value={key}>{value.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<!-- Add button -->
			<Button
				variant="destructive"
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
