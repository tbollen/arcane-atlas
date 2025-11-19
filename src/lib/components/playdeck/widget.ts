// Import svelte types
import { type Component, type ComponentProps } from 'svelte';

// Import class specific types
import { type StoredCharacter } from '$lib/domain/characters/character.svelte';
import { type CharacterSystems } from '$lib/gameSystems';

// Import Gridstack (svelte-grid) helpers
//@ts-ignore
import gridHelp from 'svelte-grid/build/helper/index.mjs';

//////////////////////////////////////
// Gridstack

export const GRIDSTACK_KEY = 'gridstack' as const;

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

//////////////////////////////////////
// Deck widgets

export type WidgetProps = {
	character: StoredCharacter;
	edit: boolean;
};
type DeckWidget = Component<WidgetProps>;

//////////////////////////////////////
// Widget Maps
export type MappedWidget = {
	[GRIDSTACK_KEY]: WidgetGridStackProps;
	name: string;
	component: DeckWidget;
	system: CharacterSystems;
};

/**
 * StoredMappedWidget
 * @description Describes the necessary information a Widget needs to contain to be able to be rendered by Gridstack.
 export */
export type StoredMappedWidget = {
	id: string;
	name: string;
	component: DeckWidget;
	system: CharacterSystems;
} & Record<number, GridStackItemProps>;

export type WidgetMap = Record<string, MappedWidget>;

/**
 * Prepare an array of MappedWidgets as items for Gridstack rendering.
 * @param widgets {MappedWidget[]} The array of MappedWidgets to prepare
 * @param cols {number} The number of columns in the Gridstack
 * @returns {StoredMappedWidget[]} The array of StoredMappedWidgets
 */
export function prepareDeckWidgets(widgets: MappedWidget[], cols: number): StoredMappedWidget[] {
	return widgets.map((widget, index) => {
		return {
			id: `${widget.system}:${widget.name}:${index}`,
			name: widget.name,
			component: widget.component,
			system: widget.system,
			[cols]: gridHelp.item(widget[GRIDSTACK_KEY])
		};
	});
}
