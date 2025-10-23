// Styling Types
import { type CardStyleOptions } from '$lib/utils/types/style';
import {
	type CardStylePreset,
	cardStylePresets,
	defaultCardStyle
} from '$lib/domain/cards/cardStylePresets';
import { type IsCardType } from '$lib/domain/cards/cardTypes';
import { AR_KEY, GENERIC_KEY } from '$lib/gameSystems';

// Prisma type for hydrating
import { type card as PrismaCard } from '@prisma/client';

// Utils
import { clone } from '$lib/utils/serializing';

// Basic Types
import { type Prefixed_UUID } from '$lib/utils/uuid';

// Import Mechanics
import { type Mechanics } from '$lib/gameSystems';

type System = keyof Mechanics; // e.g., 'arcane-rift', 'dnd5e', etc.

// Basic Card fields
export type CardFields = {
	name?: string;
	description?: string;
};
const mechanics: Mechanics = { generic: {} };
const system: System[] = ['generic'];

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
	createdAt: Date = new Date();
	updatedAt: Date = $state(new Date());
	ownerName: string = $state('Unknown');
	// Main info, populate with default values
	name: string = $state('New Card');
	type: IsCardType = $state('Card');
	subtitle?: string = $state(undefined);
	icon?: string = $state(undefined);
	description: string = $state('Card Description');
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
	// Card styling
	stylePreset: CardStylePreset = $state('default');
	style: CardStyleOptions = $state(defaultCardStyle);
	// Mechanics
	systems: System[] = $state([]); // Can have 0, 1 or more compatible systems
	mechanics: Mechanics = $state({ [GENERIC_KEY]: {} }); // Object containing mechanics per available system

	// Constructor to initialize the card with default values
	constructor(_card?: Partial<Card> | PrismaCard, ownerName?: string) {
		let _cardReference: Partial<Card> = fallbackCardInfo;
		// Ensure deep cloning works on input
		function cloneToObj(obj: any): Record<string, any> | undefined {
			if (!obj) return undefined;
			const clone = JSON.parse(JSON.stringify(obj));
			return Object.keys(clone).length > 0 ? clone : undefined; //returns undefined if obj is empty
		}
		// Set card info one by one
		this.ownerName = ownerName ?? 'Unknown';
		this.createdAt = _card?.createdAt ?? _cardReference.createdAt ?? new Date();
		this.updatedAt = _card?.updatedAt ?? _cardReference.updatedAt ?? new Date();
		this.name = _card?.name ?? _cardReference.name ?? 'New Card';
		this.type = _card?.type ?? _cardReference.type ?? 'Card';
		this.subtitle = _card?.subtitle ?? _cardReference.subtitle ?? undefined;
		this.icon = _card?.icon ?? _cardReference.icon ?? undefined;
		this.description =
			_card?.description ?? _cardReference.description ?? fallbackCardInfo.description!;
		this.image = {
			...this.image,
			...(cloneToObj(_card?.image) ?? _cardReference.image ?? {})
		};
		this.stylePreset = _cardReference.stylePreset ?? fallbackCardInfo.stylePreset!;
		this.style = {
			...defaultCardStyle,
			...(cloneToObj(_card?.style) ?? _cardReference.style ?? {})
		};
		// Set mechanics based on system
		this.mechanics = {
			...this.mechanics,
			...(cloneToObj(_card?.mechanics) ?? _cardReference.mechanics)
		};
		this.systems = Object.keys(this.mechanics) as System[];
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

	// SERIALIZATION FOR SAVING AND PARSING

	/**
	 * Serializes the card to be saved in the database or parsed from JSON.
	 * This function returns an object that contains all the information of the card.
	 * @returns {Object} Object containing all the information of the card
	 * The object will have the following properties:
	 * - creatorId: UUID of the user that created the card
	 * - createdAt: Date when the card was created
	 * - updatedAt: Date when the card was last updated
	 * - userIds: Array of UUIDs of users that have access to the card
	 * - campaignIds: Array of UUIDs of campaigns that use this card
	 * - characterIds: Array of UUIDs of characters that use this card
	 * - name: Name of the card
	 * - type: Type of the card
	 * - subtitle: Subtitle of the card
	 * - icon: Icon of the card
	 * - description: Description of the card
	 * - image: Object containing information about the image of the card
	 * - stylePreset: Name of the style preset used for the card
	 * - style: Object containing information about the style of the card
	 * - mechanics: Object containing information about the mechanics of the card
	 */
}
