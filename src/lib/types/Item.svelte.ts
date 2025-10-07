import { skillList } from '$lib/modules/skillCheckList';
const characteristics = Object.values(skillList).flat();

// Styling Types
import { type CardStyleOptions } from '$lib/utils/types/style';
import {
	type CardStylePreset,
	defaultCardStyle,
	cardStylePresets
} from '$lib/core/cards/cardStylePresets';
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

export const fallbackCardInfo: Item = {
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
	name: string = $state('New Item');
	type: IsCardType = $state('Item');
	subtitle?: string = $state(undefined);
	icon?: string = $state(undefined);
	description: string = $state('Item Description');
	aspects?: ItemFields[] = $state([]);
	specials?: ItemFields[] = $state([]);
	skillCheck: SkillCheck = $state({});
	fields?: ItemFields[] = $state([]);
	image: {
		url?: string;
		encodedImage?: string;
		name?: string;
		alt?: string;
		rotation: number;
		scale: number;
		x_offset: number;
		y_offset: number;
	} = $state({
		// Defaults for image
		rotation: 0,
		scale: 100,
		x_offset: 0,
		y_offset: 0
	});
	stylePreset: CardStylePreset = $state('default');
	style: CardStyleOptions = $state(defaultCardStyle);

	constructor(_item?: Partial<Item>) {
		let _itemReference: Item = fallbackCardInfo;
		if (_item) {
			_itemReference = JSON.parse(JSON.stringify(_item)); // JSON methods for deep cloning
		}
		Object.assign(this, _itemReference);
	}
	// Methods
	public serialize(): Object {
		type Objectified = Record<string, any>;
		function c(value: any): JSON {
			const _v = value || '';
			return JSON.parse(JSON.stringify(_v));
		}
		const asObject: Objectified = {
			name: c(this.name),
			type: c(this.type),
			subtitle: c(this.subtitle),
			icon: c(this.icon),
			description: c(this.description),
			aspects: c(this.aspects),
			specials: c(this.specials),
			skillCheck: c(this.skillCheck),
			fields: c(this.fields),
			image: c(this.image),
			stylePreset: c(this.stylePreset),
			style: c(this.style)
		};
		return asObject;
	}
}

export type ItemType = typeof Item;
