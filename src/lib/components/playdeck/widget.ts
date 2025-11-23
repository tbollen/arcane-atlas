// Import svelte types
import { type Component } from 'svelte';

// Import class specific types
import {
	type StoredCharacter,
	type CharacterProperties
} from '$lib/domain/characters/character.svelte';
import { type CharacterSystems } from '$lib/gameSystems';

// Import Gridstack (svelte-grid) helpers
//@ts-ignore
import gridHelp from 'svelte-grid/build/helper/index.mjs';

//////////////////////////////////////
// Gridstack
/**
 * WidgetGridStackProps
 * @description Describes all necessary input information a Widget can have to define its GridStack properties
 */
export type WidgetGridStackProps = {
	w: number;
	h: number;
	min?: {
		w: number;
		h: number;
	};
	max?: {
		w: number;
		h: number;
	};
};

export type GridStackItemProps = {
	x: Number;
	y: Number;
	w: Number;
	h: Number;
	fixed: Boolean;
	resizable: Boolean;
	draggable: Boolean;
	min: {
		w: Number;
		h: Number;
	};
	max: {
		w: Number;
		h: Number;
	};
	customDragger: Boolean;
	customResizer: Boolean;
};

export type WidgetColumnsSettings = Record<number, GridStackItemProps>;

//////////////////////////////////////
// Widget Components

export type WidgetComponentProps = {
	character: StoredCharacter;
	edit: boolean;
};
export type DeckWidgetComponent = Component<WidgetComponentProps>;

//////////////////////////////////////
// Widget Maps

export type SystemWidget = {
	initialLayout: WidgetGridStackProps;
	name: string;
	component: DeckWidgetComponent;
	characterProperties: CharacterProperties;
};

/**
 * MappedWidget
 * @description Describes the information a widget must have in the full WidgetMap. Includes necessary information for Gridstack rendering.
 * @see [readme](./readme.md)
 * */
export type MappedWidget = SystemWidget & {
	system: CharacterSystems;
};

export type SystemWidgetMap = Record<string, SystemWidget>;
export type WidgetMap = Record<string, MappedWidget>;

/**
 * @name DeckWidget
 * @description Describes the information a widget must have in the full WidgetMap. Includes an id which is required for Gridstack rendering.
 */
export type DeckWidget = WidgetColumnsSettings &
	MappedWidget & {
		id: string;
		componentID: string;
	};

////////////////////////
// Functions

/**
 * @name recalculateWidgetColumns
 * @description Recalculates the GridStack properties of a widget based on the given number of columns.
 * Checks if the widget has gridStack data for neighbouring amount of columns, and populates it with new gridstack props derived from other column amounts otherwise.
 * This is required to make sure the widgets render correctly when the amount of columns changes.
 * @param {DeckWidget} widget The widget to recalculate the GridStack properties for.
 * @param {number} columns The number of columns in the Gridstack.
 * @returns {DeckWidget} The widget with the recalculated GridStack properties.
 */
export function recalculateWidgetColumns(widget: DeckWidget, columns: number): DeckWidget {
	// Check if the widget has gridStack data for neighbouring amount of columns
	const largerLayout = widget.hasOwnProperty(columns + 1) ? widget[columns + 1] : undefined;
	const smallerLayout = widget.hasOwnProperty(columns - 1) ? widget[columns - 1] : undefined;
	// Populate the gridstack props
	const returnWidget: DeckWidget = {
		...widget,
		// Populate the gridstack props, check if the widget has gridStack data for neighbouring amount of columns, otherwise set to initial
		[columns]: largerLayout ?? smallerLayout ?? gridHelp.item(widget.initialLayout)
	};
	return returnWidget;
}
