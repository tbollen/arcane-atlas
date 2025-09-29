// Styling Types
import { type CardStyleOptions } from '$lib/utils/types/style';
import {
	type CardStylePreset,
	cardStylePresets,
	defaultCardStyle
} from '$lib/core/items/cardStylePresets';
import { type IsCardType } from '$lib/modules/cardTypes';

// Basic Types
import { type Prefixed_UUID } from '$lib/utils/uuid';

// Importing mechanics for various systems (dynamically)
import { gameCardSystems } from '$lib/system/gameSystems';
type System = keyof typeof gameCardSystems; // e.g., 'arcane-rift', 'dnd5e', etc.
type CardMechanics = { [K in keyof typeof gameCardSystems]?: (typeof gameCardSystems)[K] };
// End of Type Magic

// Basic Card fields
export type CardFields = {
	name?: string;
	description?: string;
};

export const fallbackCardInfo: Partial<Card> = {
	name: 'New Card',
	type: 'Card',
	description: 'Card Description',
	image: {
		rotation: 0,
		scale: 100,
		x_offset: 0,
		y_offset: 0
	},
	stylePreset: 'default',
	style: defaultCardStyle
};

export class Card {
	// ID and db info
	creatorId: Prefixed_UUID<'user'> | null = null;
	createdAt: Date;
	updatedAt: Date;
	// Main info
	name: string;
	type: IsCardType;
	subtitle?: string;
	icon?: string;
	description: string;
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
	// Card styling
	stylePreset: CardStylePreset = 'default';
	style: CardStyleOptions = defaultCardStyle;
	// Mechanics
	systems: System[]; // Can have 0, 1 or more compatible systems
	mechanics: CardMechanics; // Object containing mechanics per available system

	// Constructor to initialize the card with default values
	constructor(_card?: Partial<Card>) {
		let _cardReference: Partial<Card> = fallbackCardInfo;
		if (_card) {
			_cardReference = { ..._cardReference, ..._card };
		}
		this.creatorId = _cardReference.creatorId ?? null;
		this.createdAt = _cardReference.createdAt ?? new Date();
		this.updatedAt = _cardReference.updatedAt ?? new Date();
		this.name = _cardReference.name ?? fallbackCardInfo.name!;
		this.type = _cardReference.type ?? fallbackCardInfo.type!;
		this.subtitle = _cardReference.subtitle ?? undefined;
		this.icon = _cardReference.icon ?? undefined;
		this.description = _cardReference.description ?? fallbackCardInfo.description!;
		this.image = {
			...this.image,
			...(_cardReference.image ?? {})
		};
		this.stylePreset = _cardReference.stylePreset ?? fallbackCardInfo.stylePreset!;
		this.style = { ...defaultCardStyle, ...(_cardReference.style ?? {}) };
		// Set mechanics based on system
		this.systems = _cardReference.systems ?? [];
		this.mechanics = { ...(_cardReference.mechanics ?? {}) };
	}

	// Style and Default settings func
	// Image editing
	resetImagePosition(property?: 'x_offset' | 'y_offset' | 'rotation' | 'scale') {
		if (this.image == undefined) return;
		if (property) this.image[property] = property == 'scale' ? 100 : 0;
		this.image.x_offset = 0;
		this.image.y_offset = 0;
		this.image.rotation = 0;
		this.image.scale = 100;
	}

	// Styling
	useStylePreset(preset: CardStylePreset | 'random') {
		if (preset == 'random') {
			const _presets = Object.keys(cardStylePresets).filter(
				(key) => key != 'custom' && key != 'default'
			);
			preset = _presets[Math.floor(Math.random() * _presets.length)];
		}
		const _stylePreset = cardStylePresets[preset];
		// Assign for each category the values from the preset
		this.style.color = Object.assign(this.style.color, _stylePreset.color);
		this.style.font = Object.assign(this.style.font, _stylePreset.font);
		this.style.fontsize = Object.assign(this.style.fontsize, _stylePreset.fontsize);
		// Set preset
		this.stylePreset = preset;
	}
}
