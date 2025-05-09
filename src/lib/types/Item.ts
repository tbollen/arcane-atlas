import { skillList } from '$lib/modules/skillCheckList';
const characteristics = Object.values(skillList).flat();

// Styling Types
import { type Color } from '$lib/types/colors';
import {
	type CardStylePreset,
	defaultCardStyle,
	cardStylePresets,
	type CardStyleOptions
} from '$lib/types/colors';
import { type AvailableFonts } from '$lib/types/fonts';
import { type IsCardType } from '$lib/modules/cardTypes';
export type ItemFields = {
	name?: string;
	description?: string;
};

export type SkillCheck = {
	characteristic?: keyof typeof skillList;
	skill?: (typeof characteristics)[number];
};

const defaultCard: Item = {
	name: 'New Item',
	type: 'Item',
	description: 'Item Description',
	image: {
		rotation: 0,
		scale: 100,
		x_offset: 0,
		y_offset: 0
	},
	stylePreset: 'default',
	style: defaultCardStyle
};

// Class for the Item
export class Item {
	// Initialise
	name: string = 'New Item';
	type: IsCardType = 'Item';
	subtitle?: string;
	icon?: string;
	description: string = 'Item Description';
	aspects?: ItemFields[];
	specials?: ItemFields[];
	skillCheck?: SkillCheck | null;
	fields?: ItemFields[];
	image: {
		url?: string;
		encodedImage?: string;
		name?: string;
		alt?: string;
		rotation: number;
		scale: number;
		x_offset: number;
		y_offset: number;
	} = {
		// Defaults for image
		rotation: 0,
		scale: 100,
		x_offset: 0,
		y_offset: 0
	};
	stylePreset: CardStylePreset = 'default';
	style: CardStyleOptions = defaultCardStyle;

	constructor(_item?: Partial<Item>) {
		let _itemReference: Item = defaultCard;
		if (_item) {
			_itemReference = JSON.parse(JSON.stringify(_item)); // JSON methods for deep cloning
		}
		Object.assign(this, _itemReference);
		if (_itemReference.skillCheck === null) this.skillCheck = null; // Null skillcheck
	}
	// Methods
}

export type ItemType = typeof Item;
