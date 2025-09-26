// Basic Types to use in the system

export class AR_Card {}

type Field = {
	label: string;
	value: string;
};

type Aspect = {
	short: string;
	description: string;
};

export type ArcaneRiftCard = {
	// Arcane Rift specific mechanics here
	aspects: Aspect[];
	fields: Field[];
	check?: {
		characteristic: string;
		skill: string;
	};
};
