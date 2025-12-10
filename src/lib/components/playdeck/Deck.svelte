<script lang="ts">
	// Import UI components
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import * as ButtonGroup from '$lib/components/ui/button-group';
	import EditDialog from './EditDialog.svelte';
	import { Header } from '$lib/components/typography';

	// Import partials
	import GameSystemSelector from './GameSystemSelector.svelte';

	// Spinner
	import { spinner } from '$lib/stores/loadingSpinner.svelte.js';

	// API
	import CHARACTER_API from '$lib/utils/api/characters_api.js';

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
	import { defaultDeckConfig, type DeckConfig } from './deckConfig';
	import { beforeNavigate, invalidateAll, onNavigate } from '$app/navigation';
	import AddWidgetDialog from '../../../routes/playdeck/AddWidgetDialog.svelte';

	let {
		deck = $bindable(),
		character,
		config
	}: {
		deck: StoredDeck;
		character: StoredCharacter;
		config?: DeckConfig;
	} = $props();

	////////////////////////////////
	// SAVE TRACKING

	let unsaved: boolean = $state(false);
	let lastCharacterState = $derived(character.toPrisma());

	// Track changes to character
	$effect(() => {
		character.toPrisma();
		unsaved = character.toPrisma() !== lastCharacterState;
	});

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

	export function removeItem(itemID: string) {
		items = items.filter((item) => item.id !== itemID);
		deck = itemsToDeck(items);
	}

	export async function saveDeck(): Promise<Response> {
		if (!character) {
			console.error('No character selected');
			toast.error("Can't save deck: No character selected");
			throw new Error('No character selected');
		}
		if (!deck) {
			console.error('No deck found');
			toast.error("Can't save deck: No deck found");
			throw new Error('No deck found');
		}

		// Start saving
		spinner.set('save', 'Saving...');

		// Create a copy of the deck for modification
		let _deck = deck;

		// Go through each widget...
		_deck.values().forEach((widget) => {
			// Check by keys. Numbers hold column data and represent the amount of columns Grid uses
			Object.keys(widget).forEach((key) => {
				// Convert key to number
				const colNum = parseInt(key);
				// Check if key is a number and valid column
				if (
					!isNaN(colNum) && // is a number (is not NaN)
					colNum >= deckConfig.minColumns && // is above min columns
					colNum <= deckConfig.maxColumns && // is below max columns
					!Object.keys(deckConfig.layouts).includes(colNum.toString()) // is NOT in columns to keep
				) {
					// Find first nearest larger column to keep (nextCol)
					const nextCol = Object.keys(deckConfig.layouts)
						.map(Number)
						.find((col) => col > colNum);
					// If empty, use values of colNum on nextCol
					if (nextCol && nextCol in widget === false) widget[nextCol] = widget[colNum];
					// Drop this column (colNum)
					delete widget[colNum];
					// Result: only columns in columnsToKeep remain. Current col's data moved to nearest larger column if not specified in columnsToKeep
				}
			});
		});

		// Save deck to character
		character.deck = _deck;

		// Convert to PrismaCharacter
		const prismaCharacter = character.toPrisma();
		// Update character via API and return the promised Response
		return await CHARACTER_API.update(prismaCharacter)
			.then((response) => {
				toast.success('Character updated');
				invalidateAll();
				// Set saved
				unsaved = false;
				return response; // return the response for further handling
			})
			.catch((error) => {
				toast.error(`Error updating character: ${error}`);
				throw error; // re-throw to propagate error
			})
			.finally(() => {
				setTimeout(() => {
					spinner.complete();
				}, 500);
			});
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
	let currentLayout: DeckConfig['layouts'][number] = $state(
		deckConfig.layouts[deckConfig.minColumns]
	);

	// GRID CONSTANTS
	const MAX_COLUMNS = deckConfig.maxColumns;
	const MIN_COLUMNS = deckConfig.minColumns;
	const FONT_SIZE = deckConfig.fontSize; //Default 16px
	const CELLSIZE = deckConfig.emPerCell * FONT_SIZE; //cellsize in pixels
	const MAX_GRID_WIDTH = CELLSIZE * MAX_COLUMNS; //Min width of the grid

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

	// DIALOG OPENING
	let addWidgetDialog: boolean = $state(false);
	let editLayoutDialog: boolean = $state(false);

	onMount(() => {
		recalculateGrid();
		// Re-calculate grid on window resize
		window.addEventListener('resize', recalculateGrid);
		// Set editMode to 'view'
		toggleEditMode('view');
		// Set saved state
		unsaved = false;
	});

	beforeNavigate((navigation) => {
		// Warn if unsaved changes
		if (unsaved) {
			const confirmLeave = confirm(
				'You have unsaved changes in your deck. Do you want to leave without saving?'
			);
			if (!confirmLeave) {
				navigation.cancel();
			} else {
				// Clean up
				window.removeEventListener('resize', recalculateGrid);
			}
		}
	});
</script>

<!-- EDIT BAR -->
<div id="Actions" class="my-4 flex flex-row items-center gap-8">
	<div class="flex flex-col">
		<Header tag="h2" variant="h3">{character.name}'s Deck</Header>
		<Button
			size="xs"
			class="inline-block w-max"
			variant="ghost"
			onclick={() => (editLayoutDialog = true)}
			>{currentLayout.name} ({currentLayout.columns})</Button
		>
	</div>

	<!-- Mode Toggle Buttons -->
	<ButtonGroup.Root>
		<Button
			variant={!editDeck && !editItems ? 'bold' : 'ghost'}
			tooltip="Hide editing options"
			onclick={() => toggleEditMode('view')}
		>
			<Icon icon="mdi:play" />
			Play
		</Button>
		<Button
			variant={editItems ? 'bold' : 'ghost'}
			onclick={() => toggleEditMode('editItems')}
			tooltip="Edit information on the widgets"
		>
			<Icon icon="mdi:content-copy" />
			Content
		</Button>
		<Button
			variant={editDeck ? 'bold' : 'ghost'}
			onclick={() => toggleEditMode('editDeck')}
			tooltip="Edit the deck layout"
		>
			<Icon icon="mdi:view-dashboard" />
			Layout
		</Button>
	</ButtonGroup.Root>

	<!-- Context Actions -->
	<div id="contextActions" class="ml-auto flex flex-grow flex-wrap items-center justify-end gap-2">
		{#if editDeck}
			<Button
				size="sm"
				onclick={() => (addWidgetDialog = true)}
				variant="bold"
				tooltip="Add a new widget to the deck"
			>
				<Icon icon="mdi:plus" />
				Add Widget
			</Button>
		{/if}

		{#if editItems}
			<Button
				size="sm"
				onclick={() => (edit.open = true)}
				variant="secondary"
				tooltip="See all character fields"
			>
				<Icon icon="mdi:format-list-bulleted" />
				Edit Character
			</Button>
		{/if}

		<!-- Save Button -->
		{#if editDeck || editItems || unsaved}
			<Button
				size="sm"
				onclick={saveDeck}
				disabled={!unsaved}
				variant="blossom"
				spinner={{ id: 'save' }}
			>
				{#if unsaved}
					<Icon icon="mdi:floppy" />
					Save
				{:else}
					<Icon icon="mdi:check" />
					Saved
				{/if}
			</Button>
		{/if}
	</div>
</div>
<!-- Deck -->
<div id="DeckWrapper" class="relative flex w-full justify-center">
	<div
		id="Deck"
		bind:this={container}
		class="outline-obisidian-500 rounded-2xl outline-1
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
</div>

<!-- DIALOGS -->
<AddWidgetDialog
	onAdd={(widgets) => {
		addToDeck(widgets);
	}}
	{character}
	bind:open={addWidgetDialog}
/>
<EditDialog bind:open={edit.open} componentID={edit.componentID} bind:character />

<style lang="postcss">
	:global(.svlt-grid-shadow) {
		background: var(--blossom, #81b6c8) !important;
		opacity: 0.25 !important;
	}
</style>
