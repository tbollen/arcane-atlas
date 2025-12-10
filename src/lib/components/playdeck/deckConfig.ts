/**
 * Configuration options for deck layout and display.
 *
 * @property {number} maxColumns - The maximum number of columns allowed in the deck layout.
 * @property {number} minColumns - The minimum number of columns required in the deck layout.
 * @property {number} fontSize - The font size in pixels for text displayed in the deck.
 * @property {number} emPerCell - The size of each cell in em units.
 * @property {number[]} columnsToKeep - An array of column indices to retain in the deck display.
 */
export type DeckConfig = {
	maxColumns: number;
	minColumns: number;
	fontSize: number;
	emPerCell: number;
	columnsToKeep: number[];
};

export const defaultDeckConfig: DeckConfig = {
	maxColumns: 12,
	minColumns: 3,
	fontSize: 16,
	emPerCell: 6,
	columnsToKeep: [3, 6, 9, 12]
};
