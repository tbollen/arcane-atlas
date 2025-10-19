import { type AvailableFonts } from '$lib/styles/script/fonts';
import { colorScheme } from '$lib/styles/script/colorScheme';

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
