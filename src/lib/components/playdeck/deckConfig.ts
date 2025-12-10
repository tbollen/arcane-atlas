/**
 * Deck Configuration Class
 * Manages layout configurations for the playdeck component
 * @property maxColumns - Maximum number of columns allowed (calculated from layouts)
 * @property minColumns - Minimum number of columns allowed (calculated from layouts)
 * @property fontSize - Base font size in pixels (default: 16)
 * @property emPerCell - Size of each cell in em units (default: 6)
 * @property layouts - An object mapping column counts to layout configurations
 */
export class DeckConfig {
	maxColumns: number = 1;
	minColumns: number = 12;
	fontSize: number = 16;
	emPerCell: number = 6;
	layouts: {
		[key: number]: {
			name: string;
			columns: number;
			width: number;
		};
	} = {};

	constructor(init?: Partial<Omit<DeckConfig, 'maxColumns' | 'minColumns'>>) {
		const startingLayouts = { 3: 'Tiny', 4: 'Mobile', 8: 'Tablet', 12: 'Desktop' };
		Object.assign(this, init);
		// If no layouts provided, use defaults and populate
		if (!init?.layouts) {
			Object.entries(startingLayouts).forEach(([columns, name]) => {
				this.addLayout(name, Number(columns));
			});
		}
		// Calculate layouts
		this.calculateLayouts();
		// Update Min and Max Columns
		this.updateMinMaxColumns();
	}

	private calculateLayouts() {
		const newLayouts = Object.fromEntries(
			Object.entries(this.layouts).map(([columns, layout]) => {
				const cellSize = this.emPerCell * this.fontSize;
				return [
					columns,
					{
						...layout,
						width: Number(columns) * cellSize,
						columns: Number(columns)
					}
				];
			})
		);
		this.layouts = newLayouts;
	}

	private updateMinMaxColumns() {
		const layoutColumns = Object.keys(this.layouts).map(Number);
		this.maxColumns = Math.max(...layoutColumns);
		this.minColumns = Math.min(...layoutColumns);
	}

	addLayout(name: string, columns: number) {
		const width = columns * this.emPerCell;
		this.layouts = { ...this.layouts, [columns]: { name, columns, width } };
		// Recalculate layouts
		this.calculateLayouts();
		// Update Min and Max Columns
		this.updateMinMaxColumns();
	}

	removeLayout(columns: number) {
		const { [columns]: _, ...rest } = this.layouts;
		this.layouts = rest;
		// Recalculate layouts
		this.calculateLayouts();
		// Update Min and Max Columns
		this.updateMinMaxColumns();
	}
}

export const defaultDeckConfig: DeckConfig = new DeckConfig();
