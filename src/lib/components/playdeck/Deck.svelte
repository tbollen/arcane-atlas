<script lang="ts">
	// Import UI components
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';

	// Import necessary types and utils
	import { type StoredCharacter } from '$lib/domain/characters/character.svelte';
	import {
		type StoredDeck,
		getWidget,
		itemsToDeck,
		loadDeck,
		recalculateDeckColumns,
		setWidgetsEditMode,
		widgetIDs
	} from '.';
	import { type DeckWidget, type GridStackItemProps } from './modules/widget';
	import { type StoredCard } from '$lib/domain/cards/cardStore.svelte';

	// Gridstack
	//@ts-ignore
	import Grid from 'svelte-grid';
	//@ts-ignore
	import gridHelp from 'svelte-grid/build/helper/index.mjs';

	// Svelte
	import { onDestroy, onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { defaultDeckConfig, type DeckConfig } from './modules/deckConfig';

	/////////////////////////
	// PROPS

	// Edit mode type - specific modes with autocomplete, but allows any string
	type EditMode = 'play' | 'content' | 'layout' | (string & {});

	let {
		deck = $bindable(),
		character,
		config,
		cards,
		editMode = $bindable('play'),
		unsaved = $bindable(false),
		editDialog = $bindable(),
		currentLayout = $bindable()
	}: {
		deck: StoredDeck;
		character: StoredCharacter;
		config?: DeckConfig;
		cards?: StoredCard[];
		editMode?: EditMode;
		unsaved?: boolean;
		editDialog?: {
			componentID: string;
			editableProperties: string[];
			open: boolean;
		};
		currentLayout?: DeckConfig['layouts'][number];
	} = $props();

	////////////////////////////////
	// DECK FUNCTIONS

	const itemTailwindTargeter = '[&_.svlt-grid-item]';
	const editItemsStyler = `${itemTailwindTargeter}:outline-2 ${itemTailwindTargeter}:outline-dashed ${itemTailwindTargeter}:outline-blossom-500`;

	// Track previous editMode to update items only when it changes
	let previousEditMode = $state(editMode);

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

	export function removeItem(itemID: string) {
		items = items.filter((item) => item.id !== itemID);
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

	//////////////////////////////////////////
	// GRIDSTACK

	// DECK CONFIG
	let deckConfig: DeckConfig = config ?? defaultDeckConfig;
	// Initialize currentLayout if not passed from parent
	if (!currentLayout) {
		currentLayout = deckConfig.layouts[deckConfig.minColumns];
	}

	// GRID CONSTANTS
	const MAX_COLUMNS = deckConfig.maxColumns;
	const MIN_COLUMNS = deckConfig.minColumns;
	const FONT_SIZE = deckConfig.fontSize; //Default 16px
	const CELLSIZE = deckConfig.emPerCell * FONT_SIZE; //cellsize in pixels
	const MAX_GRID_WIDTH = CELLSIZE * MAX_COLUMNS; //Max width of the grid

	// GRID VARIABLES, recalculated in recalculateGrid()
	var container: HTMLDivElement;
	let containerWidth = $state(CELLSIZE); //container width in pixels, initialize to cellsize
	let columns = $state(MIN_COLUMNS); //number of columns, initialize to 1
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
	let items: DeckWidget[] = $state([]);

	// Initialize items when deck is available
	let deckInitialized = $state(false);

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

			// SET UNSAVED
			unsaved = true;
		}
	}

	// Grid layout calculation
	function recalculateGrid() {
		if (container !== undefined) {
			const previousColumns = columns;
			const windowWidth = Math.min(MAX_GRID_WIDTH, window.innerWidth);
			let calculatedColumns = Math.max(
				MIN_COLUMNS,
				Math.min(MAX_COLUMNS, Math.floor(windowWidth / CELLSIZE))
			);

			// COLUMN SNAPPING (based on deckConfig) >> calculate nearest lower column to snap to
			const snapColumns: number[] = Object.keys(deckConfig.layouts).map((key) => parseInt(key));
			const snappedColumns = snapColumns
				.filter((col) => col <= calculatedColumns)
				.reduce((max, col) => Math.max(max, col as number), MIN_COLUMNS);
			// Don't update when the amount of columns hasn't changed
			if (snappedColumns === previousColumns) return;
			currentLayout = deckConfig.layouts[snappedColumns];

			// Update grid params
			cols = [[1000, snappedColumns]];
			containerWidth = snappedColumns * CELLSIZE;
			columns = snappedColumns;
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

	onMount(() => {
		// Initialize items from deck
		if (deck && !deckInitialized) {
			items = initDeck(deck, true);
			const editLayout = editMode === 'layout';
			items = setWidgetsEditMode(items, editLayout);
			deckInitialized = true;
		}

		recalculateGrid();
		// Re-calculate grid on window resize
		window.addEventListener('resize', recalculateGrid);
	});

	// Watch editMode changes and update items accordingly
	$effect(() => {
		if (deckInitialized && editMode !== previousEditMode) {
			const editLayout = editMode === 'layout';
			const newItems = setWidgetsEditMode(items, editLayout);
			// Only update if there's an actual change
			if (JSON.stringify(newItems) !== JSON.stringify(items)) {
				items = newItems;
			}
			previousEditMode = editMode;
		}
	});

	onDestroy(() => {
		// Clean up
		window.removeEventListener('resize', recalculateGrid);
	});
</script>

<!-- Deck -->
<div id="DeckWrapper" class="relative flex w-full justify-center">
	<div
		id="Deck"
		bind:this={container}
		class="outline-obisidian-500 rounded-2xl outline-1
	{editMode === 'content' ? editItemsStyler : ''}
	[&_.svlt-grid-item]:overflow-hidden [&_.svlt-grid-item]:rounded-lg [&_.svlt-grid-item]:outline-blossom-500
	[&_.svlt-grid-resizer]:z-20 [&_.svlt-grid-resizer::after]:h-4! [&_.svlt-grid-resizer::after]:w-4! [&_.svlt-grid-resizer::after]:border-obsidian-50!"
		style="width: {containerWidth}px !important;"
	>
		{#if items.length !== 0}
			<Grid {items} on:change={handleGridChange} rowHeight={CELLSIZE} let:item let:dataItem {cols}>
				{@const widget = dataItem as DeckWidget}
				{@const Component = dataItem.component as DeckWidget['component']}
				{#if editMode === 'layout'}
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
				{:else if editMode === 'content'}
					<button
						id="overlay"
						hidden={Object.keys(widget.characterProperties).length === 0}
						class="absolute inset-0 z-10 flex
					cursor-pointer items-center justify-center
					bg-transparent text-3xl text-transparent transition-colors
					hover:bg-foreground/50 hover:text-background"
						onclick={() => {
							console.log('Data item', dataItem);
							if (editDialog) {
								editDialog = {
									open: true,
									componentID: dataItem.componentID,
									editableProperties: dataItem.editableProperties
								};
							}
						}}
						title="Open edit dialog"
					>
						<Icon icon="mdi:pencil" />
					</button>
				{/if}
				<Component bind:character {cards} />
			</Grid>
		{/if}
	</div>
</div>

<style lang="postcss">
	:global(.svlt-grid-shadow) {
		background: var(--blossom, #81b6c8) !important;
		opacity: 0.25 !important;
	}
</style>
