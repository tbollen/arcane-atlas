// Import available mechanics from the class
import { AR_KEY, GENERIC_KEY, type CharacterSystems } from '$lib/gameSystems';

import {
	type MappedWidget,
	type WidgetMap,
	type DeckWidget,
	recalculateWidgetColumns
} from '$lib/components/playdeck/widget';

// Import deck map definition helper
import { defineDeckMap } from './modules';

/////////////////////////////////////////////
// Import and load all maps
import { genericWidgetMap } from '$lib/components/playdeck/generic';
import { arcaneRiftWidgetMap } from '$lib/components/playdeck/arcaneRift';

/////////////////////////////////////////////
// COMPLETE WIDGET MAP

/**
 * @name widgetMap
 * @description A map of all available widgets, keyed by a unique ID.
 * Each widget is associated with a specific game system.
 * @see #complete-widget-map [readme](./readme.md)
 */
export const widgetMap: WidgetMap = {
	...defineDeckMap(genericWidgetMap, GENERIC_KEY),
	...defineDeckMap(arcaneRiftWidgetMap, AR_KEY)
} as const;

/**
 * @name widgetIDs
 * @description An array of all available widget IDs defined in the {@link widgetMap}
 */
export const widgetIDs = Object.keys(widgetMap);
/////////////////////////////////////////////
// DECK TYPES

// Game systems that have available Deck components
export const deckSystems = Array.from(new Set(Object.values(widgetMap).map((item) => item.system)));
export type DeckSystem = Extract<CharacterSystems, (typeof deckSystems)[number]>;

/////////////////////////////////
// GET WIDGET

/**
 * Get a widget by its ID.
 * @param widgetID The ID of the widget to get
 * @returns The widget associated with the given ID
 * @throws {Error} If the widget ID is invalid
 */
export function getWidget(widgetID: string): MappedWidget {
	if (!Object.keys(widgetMap).includes(widgetID)) throw new Error('Invalid Widget ID');
	const lookupID = widgetID as keyof typeof widgetMap;
	return widgetMap[lookupID];
}

/**
 * Filter a list of widgets by the given game system.
 * Returns a new list of widgets that only contain widgets associated with the given system.
 * @param widgets The list of widgets to filter
 * @param system The game system to filter by
 * @returns A new list of widgets that only contain widgets associated with the given system
 */
export function filterWidgetsBySystem(widgets: DeckWidget[], system: DeckSystem): DeckWidget[] {
	return widgets.filter((widget) => widget.system === system);
}

/**
 * Set the edit mode for a list of widgets.
 * @param widgets The list of widgets to modify
 * @param edit Whether the widgets should be in edit mode or not
 * @returns The modified list of widgets
 */
export function setWidgetsEditMode(widgets: DeckWidget[], edit: boolean): DeckWidget[] {
	// Go through each widget
	return widgets.map((widget) => {
		// Go through each property
		// If the property is a number (breakpoint data), then set it's property 'fixed' to match (edit===true), otherwise, do nothing
		const updatedWidget = Object.entries(widget).map(([key, value]) => {
			const keyIsNumber = parseInt(key) > 0;
			const valueIsObject = typeof value === 'object';
			return [
				key,
				keyIsNumber && valueIsObject
					? { ...value, fixed: !edit, draggable: edit, resizable: edit }
					: value
			];
		});
		// Return the updated widget
		const newWidget = Object.fromEntries(updatedWidget);
		return newWidget;
	});
}

// Load deck
/**
 * Converts a StoredDeck from @type StoredDeck to @type StoredDeckWidget
 * @param deck {StoredDeck} The StoredDeck to convert
 * @param system {DeckSystem} The game system to filter by (optional)
 * @returns {DeckWidgets} The converted deck to be used and rendered
 */
export function loadDeck(input: StoredDeck, system?: DeckSystem): DeckWidget[] {
	const widgets = input.map((item, index) => {
		const widget = getWidget(item.componentID);
		// Add widget information (component). Also add a UNIQUE id to each widget, which is required for Gridstack
		const deckWidget: DeckWidget = { ...item, ...widget, id: `${item.componentID}-${index}` };
		return deckWidget;
	});
	if (system) return filterWidgetsBySystem(widgets, system);
	return widgets;
}

/////////////////////////////////
// Function to recalculate widget columns

/**
 * @name recalculateDeckColumns
 * @description Recalculates the GridStack properties of a list of widgets based on the given number of columns.
 * This is required to make sure the widgets render correctly when the amount of columns changes.
 * @param widgets {DeckWidget[]} The list of widgets to recalculate the GridStack properties for.
 * @param columns {number} The number of columns in the Gridstack.
 * @returns {DeckWidget[]} The list of widgets with the recalculated GridStack properties.
 */
export function recalculateDeckColumns(widgets: DeckWidget[], columns: number): DeckWidget[] {
	return widgets.map((widget) => recalculateWidgetColumns(widget, columns));
}

/////////////////////////////////
// STORAGE AND SAVING
/**
 * @name StoredDeckWidgets
 * @description A description of information needed to save a deck widget.
 * @property {string} componentID The ID of the component associated with the widget
 * @property {number} [number] GridStack information by column amount (placement & size)
 */
export type StoredDeckWidget = Pick<DeckWidget, number | 'componentID'>;
export type StoredDeck = StoredDeckWidget[];

/**
 * @name fallbackDeck
 * @type StoredDeck
 * @description A starting deck for a new game. Used when the character of localStorage does not have a deck. Contains only a player banner.
 */
export const fallbackDeck: StoredDeck = [{ componentID: 'generic:banner' }];

export function itemsToDeck(items: DeckWidget[]): StoredDeck {
	const response: StoredDeck = items.map((item) => {
		// Get all valid keys
		const gridOptions = Object.fromEntries(
			Object.entries(item).filter(([key]) => !isNaN(Number(key)))
		);
		return { ...gridOptions, componentID: item.componentID };
	});
	return response;
}

///////////////////////////////////
// VALIDATION

export function checkDeckValidity(deck: any): deck is StoredDeck {
	if (!deck) throw new Error('No deck provided');
	if (!Array.isArray(deck)) throw new Error('Deck is not an array');
	if (!deck.every((item) => typeof item === 'object'))
		throw new Error('Deck is not an array of objects');
	if (!deck.every((item) => checkDeckItemValidity(item)))
		throw new Error('Deck contains invalid items');
	return true;
}

function checkDeckItemValidity(item: object): item is StoredDeckWidget {
	return (
		item &&
		typeof item === 'object' &&
		'componentID' in item &&
		typeof item.componentID === 'string'
	);
}
