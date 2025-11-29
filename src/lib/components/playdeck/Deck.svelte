<script lang="ts">
	// Import UI components
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import EditDialog from './EditDialog.svelte';

	// Import partials
	import GameSystemSelector from './GameSystemSelector.svelte';

	// Import necessary types and utils
	import { type StoredCharacter } from '$lib/domain/characters/character.svelte';
	import {
		type DeckSystem,
		type StoredDeck,
		getWidget,
		itemsToDeck,
		loadDeck,
		recalculateDeckColumns,
		setWidgetsEditMode,
		widgetIDs
	} from './';
	import { GENERIC_KEY } from '$lib/gameSystems';
	import {
		recalculateWidgetColumns,
		type DeckWidget,
		type GridStackItemProps,
		type MappedWidget,
		type WidgetColumnsSettings
	} from './widget';

	// Gridstack
	//@ts-ignore
	import Grid from 'svelte-grid';
	//@ts-ignore
	import gridHelp from 'svelte-grid/build/helper/index.mjs';

	// Svelte
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let {
		deck = $bindable(),
		character
	}: {
		deck: StoredDeck;
		character: StoredCharacter;
	} = $props();

	////////////////////////////////
	// DECK FUNCTIONS

	// Edit Modes
	let editDeck: boolean = $state(false);
	let editItems: boolean = $state(false);
	const itemTailwindTargeter = '[&_.svlt-grid-item]';
	const editItemsStyler = `${itemTailwindTargeter}:outline-2 ${itemTailwindTargeter}:outline-dashed ${itemTailwindTargeter}:outline-blossom-500`;

	// Edit params
	let edit: {
		componentID: string;
		editableProperties: string[];
		open: boolean;
	} = $state({
		componentID: '',
		editableProperties: [],
		open: false
	});

	export function toggleEditMode(mode: 'view' | 'editItems' | 'editDeck' = 'view') {
		editDeck = mode === 'editDeck';
		editItems = mode === 'editItems';
		items = setWidgetsEditMode(items, editDeck);
	}

	export function update() {
		const _items = initDeck(deck, false);
		items = setWidgetsEditMode(_items, false);
	}

	export function addToDeck(widgets: string[]) {
		if (widgets.length === 0) return;
		let additions: DeckWidget[] = widgets
			.map((widget) => {
				try {
					// May throw error
					const widgetComponent = createWidget(widget);
					// Check if character has correct systems for widget
					if (!character.systems.includes(widgetComponent.system))
						throw new Error(
							`Character does not have required system (${widgetComponent.system}) for widget`
						);

					return widgetComponent;
				} catch (error) {
					toast.error(`Error adding widget: ${(error as Error).message}`);
					return null;
				}
			})
			// Remove nulls
			.filter((widget) => widget !== null);

		// Update items and deck
		items = [...items, ...additions];
		deck = itemsToDeck(items);
	}

	function createWidget(_widgetID: string): DeckWidget {
		if (!widgetIDs.includes(_widgetID)) throw new Error('Invalid Widget ID');
		// Get index from items
		const newWidgetIndex = items.length;
		// Get widget information
		let newWidget = getWidget(_widgetID);
		// Set column data, use initial layout
		const columnData = gridHelp.item(newWidget.initialLayout) as GridStackItemProps;
		// Add column data
		const newDeckWidget: DeckWidget = {
			...newWidget,
			id: `${_widgetID}-${newWidgetIndex}`,
			[columns]: columnData,
			componentID: _widgetID
		};
		// find space for widget (instead of adjusting the whole grid)
		const newPosition = gridHelp.findSpace(newDeckWidget, items, columns);
		// Add positional changes to newDeckWidget and return
		return { ...newDeckWidget, [columns]: { ...newDeckWidget[columns], ...newPosition } };
	}

	export function removeItem(itemID: string) {
		items = items.filter((item) => item.id !== itemID);
		deck = itemsToDeck(items);
	}

	//////////////////////////////////////////
	// GRIDSTACK

	// GRID CONSTANTS
	const FONT_SIZE = 16; //Default 16px
	const CELLSIZE = 6 * FONT_SIZE; //cellsize in pixels
	const MAX_GRID_WIDTH = CELLSIZE * 12; //Min width of the grid

	// GRID VARIABLES, recalculated in recalculateGrid()
	var container: HTMLDivElement;
	let containerWidth = $state(CELLSIZE); //container width in pixels, initialize to cellsize
	let columns = $state(1); //number of columns, initialize to 1
	let cols = $derived([[1000, columns]]);

	/////////////////////////////////
	// DECK CONFIG

	function initDeck(_deck: StoredDeck, adjust?: boolean): DeckWidget[] {
		const loadedDeck = loadDeck(_deck);
		const calculatedDeck = recalculateDeckColumns(loadedDeck, columns);
		if (adjust) return gridHelp.adjust(calculatedDeck, columns) as DeckWidget[];
		return calculatedDeck;
	}

	// set up items for active amount of columns (initially 1)
	let isAdjusted: boolean = false;
	let items: DeckWidget[] = $state(initDeck(deck, true));

	function handleGridChange(event: any) {
		// REGISTER CHANGED INSTANCE
		const newItem = event.detail.unsafeItem;
		const referenceItem = items.find((item) => item.id == newItem.id);
		if (!referenceItem || !newItem[columns]) return; //safeguard
		// Only excecute if the item has changed
		if (JSON.stringify(referenceItem[columns]) !== JSON.stringify(newItem[columns])) {
			// UPDATE ITEMS
			items = items.map((item) => {
				return item.id == newItem.id ? { ...item, ...newItem } : item;
			});
			// UPDATE DECK
			deck = itemsToDeck(items);
		}
	}

	// Grid layout calculation
	function recalculateGrid() {
		if (container !== undefined) {
			const previousColumns = columns;
			const windowWidth = Math.min(MAX_GRID_WIDTH, window.innerWidth);
			columns = Math.floor(windowWidth / CELLSIZE);
			// Don't update when the amount of columns hasn't changed
			if (columns === previousColumns) return;

			// Update grid params
			cols = [[1000, columns]];
			containerWidth = columns * CELLSIZE;

			// Set variable to manage if the grid is adjusted or not
			let adjust = false;

			// If items does not have the property corresponding to columns, add it using the initial layout
			const _updatedItems = items.map((item) => {
				if (!item[columns]) {
					item[columns] = gridHelp.item(item[previousColumns] ?? item.initialLayout);
					adjust = true;
				}
				return { ...item };
			});

			// Update items
			if (adjust) console.log('Adjusted items:', _updatedItems);
			items = adjust ? gridHelp.adjust(_updatedItems, columns) : _updatedItems;
		}
	}

	$effect(() => {
		console.log('Deck:', $state.snapshot(deck));
	});

	onMount(() => {
		recalculateGrid();
		// Re-calculate grid on window resize
		window.addEventListener('resize', recalculateGrid);
		// Set editMode to 'view'
		toggleEditMode('view');
	});
</script>

<!-- DEBUG info -->
{#if editDeck}
	<!-- TODO: FIX -->
	<!-- <GameSystemSelector bind:character bind:edit={editDeck} bind:system /> -->
{/if}
Columns: {columns} // Width: {containerWidth}
<!-- Dynamic Edit Dialog -->
<EditDialog bind:open={edit.open} componentID={edit.componentID} bind:character />
<!-- Deck -->
<div
	id="Deck"
	bind:this={container}
	class="outline-obisidian-500 flex flex-row flex-wrap rounded-2xl outline-1
	{editItems ? editItemsStyler : ''}
	[&_.svlt-grid-item]:overflow-hidden [&_.svlt-grid-item]:rounded-lg [&_.svlt-grid-item]:outline-blossom-500
	[&_.svlt-grid-resizer]:z-20 [&_.svlt-grid-resizer::after]:h-4! [&_.svlt-grid-resizer::after]:w-4! [&_.svlt-grid-resizer::after]:border-obsidian-50!"
	style="width: {containerWidth}px !important;"
>
	{#if items.length !== 0}
		<Grid {items} on:change={handleGridChange} rowHeight={CELLSIZE} let:item let:dataItem {cols}>
			{@const widget = dataItem as DeckWidget}
			{@const Component = dataItem.component as DeckWidget['component']}
			{#if editDeck}
				<!-- Drag handle overlay -->
				<div
					id="overlay"
					class="absolute inset-0 z-10 flex
 					cursor-move items-center
					justify-center bg-foreground/20
					text-3xl text-background transition-colors"
					title="Drag"
				>
					<Icon icon="mdi:drag" class="text-6xl" />
				</div>
				<!-- Delete button -->
				<Button
					onclick={() => removeItem(widget.id)}
					size="icon"
					variant="default"
					class="text:threat-500 absolute top-1 right-1 z-30  text-threat-500 hover:bg-threat-500 hover:text-white"
				>
					<Icon icon="mdi:delete" />
				</Button>
				<!-- System Badge -->
				<!-- Resizer Icon -->
				<Icon
					icon="mdi:arrow-expand"
					class="absolute right-1 bottom-1 z-[11] scale-x-[-1] text-xl text-obsidian-50"
				/>
			{:else if editItems}
				<button
					id="overlay"
					hidden={Object.keys(widget.characterProperties).length === 0}
					class="absolute inset-0 z-10 flex
					cursor-pointer items-center justify-center
					bg-transparent text-3xl text-transparent transition-colors
					hover:bg-foreground/50 hover:text-background"
					onclick={() => {
						console.log('Data item', dataItem);
						edit = {
							open: true,
							componentID: dataItem.componentID,
							editableProperties: dataItem.editableProperties
						};
						edit = edit;
					}}
					title="Open edit dialog"
				>
					<Icon icon="mdi:pencil" />
				</button>
			{/if}
			<Component bind:character />
		</Grid>
	{/if}
</div>

<style lang="postcss">
	:global(.svlt-grid-shadow) {
		background: var(--blossom, #81b6c8) !important;
		opacity: 0.25 !important;
	}
</style>
