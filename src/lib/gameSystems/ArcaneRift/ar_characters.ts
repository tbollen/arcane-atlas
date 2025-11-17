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

type SkillValueMap = {
	[Characteristic in keyof typeof skillList]: {
		[Skill in (typeof skillList)[Characteristic][number]]: number;
	};
};

type CharacteristicValueMap = {
	[Characteristic in keyof typeof skillList]: number;
};

function populateEmptySkillValueMap(): SkillValueMap {
	return Object.fromEntries(
		Object.entries(skillList).map(([char, skills]) => [
			char,
			Object.fromEntries(skills.map((s) => [s, 0]))
		])
	) as SkillValueMap;
}

function populateDefaultCharacteristics(): CharacteristicValueMap {
	return Object.fromEntries(characteristics.map((c) => [c, 0])) as CharacteristicValueMap;
}

export type ArcaneRiftCharacterMechanics = {
	stats: {
		characteristics: CharacteristicValueMap;
		skills: SkillValueMap;
	};
	aspects: string[];
	shortlist: string[];
	stressTracks: {
		type: string;
		value: number;
		max: number;
	}[];
	consequences: Array<{ checked: boolean; variant: ConsequenceVariant }>;
};

// Defaults for AR character
export const arcaneRiftCharacterMechanics: ArcaneRiftCharacterMechanics = {
	stats: {
		characteristics: populateDefaultCharacteristics(),
		skills: populateEmptySkillValueMap()
	},
	aspects: [],
	shortlist: [],
	stressTracks: [
		{
			type: 'Physical',
			value: 0,
			max: 3
		},
		{
			type: 'Mental',
			value: 0,
			max: 3
		}
	],
	consequences: []
};
