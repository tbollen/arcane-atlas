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

	let {
		deck = $bindable(),
		character,
		system = $bindable(GENERIC_KEY)
	}: {
		deck: StoredDeck;
		character: StoredCharacter;
		system: DeckSystem;
	} = $props();

	////////////////////////////////
	// DECK FUNCTIONS

	// Edit Modes
	let editDeck: boolean = $state(false);
	let editItems: boolean = $state(false);

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
					return createWidget(widget);
				} catch (error) {
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

	// INITIALIZE DUMMY DECK
	const dummyDeck: StoredDeck = [
		{ componentID: 'generic:banner', 6: gridHelp.item({ x: 0, y: 0, w: 6, h: 2 }) },
		{ componentID: 'generic:description', 6: gridHelp.item({ x: 0, y: 2, w: 4, h: 2 }) }
	];

	// GRID CONSTANTS
	const FONT_SIZE = 16; //Default 16px
	const CELLSIZE = 6 * FONT_SIZE; //cellsize in pixels
	const MAX_GRID_WIDTH = CELLSIZE * 12; //Min width of the grid

	// GRID VARIABLES, recalculated in recalculateGrid()
	var container: HTMLDivElement;
	let containerWidth = $state(CELLSIZE); //container width in pixels, initialize to cellsize
	let columns = $state(1); //number of columns, initialize to 1
	let cols = $state([[1000, columns]]);

	/////////////////////////////////
	// DECK CONFIG

	function initDeck(_deck: StoredDeck, adjust?: boolean): DeckWidget[] {
		const loadedDeck = loadDeck(_deck, system);
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

	////////////////////////////
	// EFFECTS

	$effect(() => {});

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
	<GameSystemSelector bind:character bind:edit={editDeck} bind:system />
{/if}
Columns: {columns} // Width: {containerWidth}
<!-- Dynamic Edit Dialog -->
<EditDialog
	bind:open={edit.open}
	editableProperties={edit.editableProperties}
	componentID={edit.componentID}
	bind:character
/>
<!-- Deck -->
<div
	id="Deck"
	bind:this={container}
	class="flex flex-row flex-wrap outline-1 outline-threat-500"
	style="width: {containerWidth}px !important;"
>
	{#if items.length !== 0}
		<Grid {items} on:change={handleGridChange} rowHeight={CELLSIZE} let:item let:dataItem {cols}>
			{#if editDeck}
				<Button
					onclick={() => removeItem(dataItem.id)}
					size="icon"
					variant="ghost"
					class="absolute top-1 right-1 z-30 hover:text-threat-500"
				>
					<Icon icon="mdi:delete" />
				</Button>
			{:else if editItems}
				<button
					id="overlay"
					class="absolute inset-0 z-10 flex
					cursor-pointer items-center justify-center
					bg-transparent text-3xl text-transparent transition-colors
					hover:bg-foreground/50 hover:text-background"
					onclick={() => {
						console.log('Data item', dataItem);
						edit = {
							open: true,
							componentID: dataItem.componentID,
							editableProperties: ['*']
						};
						edit = edit;
					}}
					title="Open edit dialog"
				>
					<Icon icon="mdi:pencil" />
				</button>
			{/if}
			<dataItem.component bind:character edit={false} />
		</Grid>
	{/if}
</div>
