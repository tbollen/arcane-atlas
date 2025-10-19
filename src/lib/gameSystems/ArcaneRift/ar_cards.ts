// Basic Types to use in the system
type Field = {
	label: string;
	value: string;
};

type Aspect = {
	short: string;
	description: string;
};

import { skillList, characteristics } from '$lib/gameSystems/ArcaneRift/ar_skillCheckList';
export type ArcaneRiftMechanics = {
	// Arcane Rift specific mechanics here
	aspects: Aspect[];
	fields: Field[];
	check: {
		characteristic?: keyof typeof skillList;
		skill?: (typeof characteristics)[number];
	};
};

export const arcaneRiftMechanics: ArcaneRiftMechanics = {
	aspects: [],
	fields: [],
	check: {}
};
