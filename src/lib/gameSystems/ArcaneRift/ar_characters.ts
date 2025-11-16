import { skillList, characteristics } from '$lib/gameSystems/ArcaneRift/ar_skillCheckList';

// RULES
// Consequences stuff
type ConsequenceVariant = 'mild' | 'moderate' | 'severe' | 'extreme';
type ConsequenceRoll = number | 'Despair';
export type ArcaneRiftCharacterRules = {
	consequences: Array<{ roll: ConsequenceRoll; variant: ConsequenceVariant }>;
	aspects: {
		highConcept: boolean;
		trouble: boolean;
		totalAmount: number;
	};
	characteristics: {
		minValue: number;
		maxValue: number;
		maxSum: number;
	};
	skills: {
		maxMastery: number;
		maxSum: number;
	};
};

// TODO: configure in campaign
export const ArcaneRiftDefaultCharacterRules: ArcaneRiftCharacterRules = {
	consequences: [
		{ roll: 1, variant: 'mild' },
		{ roll: 2, variant: 'moderate' },
		{ roll: 3, variant: 'moderate' },
		{ roll: 'Despair', variant: 'severe' },
		{ roll: 'Despair', variant: 'extreme' }
	],
	aspects: {
		highConcept: true,
		trouble: true,
		totalAmount: 5
	},
	characteristics: {
		minValue: 0,
		maxValue: 5,
		maxSum: 18
	},
	skills: {
		maxMastery: 3,
		maxSum: 8
	}
};

export type ArcaneRiftCharacterMechanics = {
	stats: {
		characteristitcs: Record<keyof typeof skillList, number>;
		skills: Record<(typeof characteristics)[number], number>;
	};
	aspects: string[];
	shortlist: string[];
	stressTracks: [
		{
			type: string;
			value: number;
			max: number;
		}
	];
	consequences: Array<{ checked: boolean; variant: ConsequenceVariant }>;
};
