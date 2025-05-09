import { type AvailableFonts } from './fonts';
import { colorScheme } from '$lib/styles/colorScheme';

// Color Types
export type RGB = `rgb(${number}, ${number}, ${number})`;
export type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
export type HEX = `#${string}`;
export type HSL = `hsl(${number}, ${number}%, ${number}%)`;
export type HSLA = `hsla(${number}, ${number}%, ${number}%, ${number})`;
export type Color = RGB | RGBA | HEX | HSL | HSLA;
export type cssVariable = `var(--${string})`;

export type CardStyleOptions = {
	color: {
		accent: Color;
		icon: Color;
		text: Color;
		background: Color;
		cardBorder: Color;
		imageBackground: Color;
	};
	font: {
		name: AvailableFonts;
		subtitle: AvailableFonts;
		accents: AvailableFonts;
		text: AvailableFonts;
	};
	fontsize: {
		text: number;
		name: number;
		subtitle: number;
		check: number;
		icon: number;
	};
};

// Style Presets
export const defaultCardStyle: CardStyleOptions = {
	color: {
		accent: colorScheme.threat[2],
		icon: colorScheme.threat[2],
		text: colorScheme.obsidian[0],
		background: '#ffffff',
		cardBorder: colorScheme.obsidian[0],
		imageBackground: 'rgba(0, 0, 0, 0)'
	},
	font: {
		name: 'Gotham',
		subtitle: 'Gotham',
		accents: 'Gotham',
		text: 'Gotham'
	},
	fontsize: {
		text: 9,
		name: 13,
		subtitle: 10,
		check: 14,
		icon: 14
	}
};
export const cardStylePresets: Record<
	string,
	Partial<Record<keyof CardStyleOptions, Partial<CardStyleOptions[keyof CardStyleOptions]>>>
> = {
	custom: {},
	default: defaultCardStyle as Partial<CardStyleOptions>,
	enchanted: {
		color: {
			accent: colorScheme.weave[2],
			icon: colorScheme.weave[2],
			text: '#000000',
			background: '#ffffff',
			cardBorder: colorScheme.weave[2]
		},
		font: {
			name: 'Gotham',
			accents: 'Gotham',
			text: 'Gotham'
		}
	},
	ancient: {
		color: {
			accent: colorScheme.threat[2],
			icon: colorScheme.threat[2],
			text: '#000000',
			background: '#fcf4e6',
			cardBorder: colorScheme.threat[2]
		},
		font: {
			name: 'Pirata One',
			subtitle: 'UnifrakturCook',
			accents: 'Pirata One',
			text: 'UnifrakturCook'
		}
	}
};

export type CardStylePreset = keyof typeof cardStylePresets;
