import { type Color } from '$lib/types/colors';
export const colorScheme: Record<string, Record<number, Color>> = {
	/* Surface (Pearl) */
	pearl: {
		0: '#302a17',
		1: '#5f5741',
		2: '#949088',
		3: '#f3f0e9',
		4: '#f7f6f1'
	},
	/* Text (Obsidian) */
	obsidian: {
		0: '#00273c',
		1: '#4e6571',
		2: '#708088',
		3: '#d5dde1',
		4: '#fafdff'
	},
	/* Accent (Blossom) */
	blossom: {
		0: '#183852',
		1: '#36658d',
		2: '#4f97d1',
		3: '#bbdcf4',
		4: '#e4ebf1'
	},
	/* Accent (Weave) */
	weave: {
		0: '#402754',
		1: '#2b1a38',
		2: '#683e86',
		3: '#9c76b4',
		4: '#cfb4d7'
	},
	/* Accent (Threat) */
	threat: {
		0: '#411612',
		1: '#752720',
		2: '#9f332b',
		3: '#c0625a',
		4: '#ebd1ce'
	},
	/* Success */
	success: {
		0: '#2e862e',
		1: '#3e8e3e',
		2: '#5ca85c',
		3: '#7fcc7f',
		4: '#a2efa2'
	}
};
export type ThemeColor = keyof typeof colorScheme;
export const suggestedColors: Color[] = [
	colorScheme.pearl[4],
	colorScheme.obsidian[0],
	colorScheme.blossom[2],
	colorScheme.weave[2],
	colorScheme.threat[2],
	colorScheme.success[2]
];
