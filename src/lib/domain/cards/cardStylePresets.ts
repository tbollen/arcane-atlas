import { type CardStyleOptions } from '$lib/utils/types/style';
import { colorScheme } from '$lib/styles/script/colorScheme';

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
