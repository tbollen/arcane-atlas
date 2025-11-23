//////////////////////////
// RULES

// TYPES AND FUNCTIONS PER MEHCANICS
// Consequences
type ConsequenceVariant = 'mild' | 'moderate' | 'severe' | 'extreme';
const severityOrder: ConsequenceVariant[] = ['mild', 'moderate', 'severe', 'extreme'];
export type ConsequenceRoll = number | 'Despair';
export type Consequence = { text: string; roll: ConsequenceRoll; variant: ConsequenceVariant };

// Aspects
export type AspectVariants = 'highConcept' | 'trouble';
export type Aspect = { short: string; description: string; variant?: AspectVariants };

// Characteristics
export type Characteristic = {
	name: string;
	value: number;
	description: string;
};

// Skills
export type Skill = {
	name: string;
	value: number;
	description: string;
	characteristic: string;
};

export type ArcaneRiftCharacterRules = {
	consequences: Array<{ roll: ConsequenceRoll; variant: ConsequenceVariant }>;
	aspects: {
		highConcept: boolean;
		trouble: boolean;
		maxAmount: number;
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
	stressTracks: {
		variants: string[];
		maxAllowed: number;
	};
	stats: {
		characteristics: Omit<Characteristic, 'value'>[];
		skills: Omit<Skill, 'value'>[];
	};
};

// TODO: configure in campaign
export const arcaneRiftDefaultCharacterRules: ArcaneRiftCharacterRules = {
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
		maxAmount: 5
	},
	characteristics: {
		minValue: 0,
		maxValue: 5,
		maxSum: 18
	},
	skills: {
		maxMastery: 3,
		maxSum: 8
	},
	stressTracks: {
		variants: ['Physical', 'Mental'],
		maxAllowed: 5
	},
	stats: {
		characteristics: [
			{ name: 'Brawn', description: '' },
			{ name: 'Agility', description: '' },
			{ name: 'Intellect', description: '' },
			{ name: 'Cunning', description: '' },
			{ name: 'Willpower', description: '' },
			{ name: 'Presence', description: '' }
		],
		skills: [
			{ name: 'Muscle', description: '', characteristic: 'Brawn' },
			{ name: 'Toughness', description: '', characteristic: 'Brawn' },
			{ name: 'Athletics', description: '', characteristic: 'Brawn' },
			{ name: 'Precision', description: '', characteristic: 'Agility' },
			{ name: 'Reflex', description: '', characteristic: 'Agility' },
			{ name: 'Coordination', description: '', characteristic: 'Agility' },
			{ name: 'Arcana', description: '', characteristic: 'Intellect' },
			{ name: 'Lore', description: '', characteristic: 'Intellect' },
			{ name: 'Medicine', description: '', characteristic: 'Intellect' },
			{ name: 'Investigation', description: '', characteristic: 'Cunning' },
			{ name: 'Stealth', description: '', characteristic: 'Cunning' },
			{ name: 'Ingenuity', description: '', characteristic: 'Cunning' },
			{ name: 'Intution', description: '', characteristic: 'Willpower' },
			{ name: 'Composure', description: '', characteristic: 'Willpower' },
			{ name: 'Vigilance', description: '', characteristic: 'Willpower' },
			{ name: 'Charm', description: '', characteristic: 'Presence' },
			{ name: 'Insight', description: '', characteristic: 'Presence' },
			{ name: 'Persuasion', description: '', characteristic: 'Presence' }
		]
	}
};

function populateEmptySkillValueMap(
	rules: ArcaneRiftCharacterRules = arcaneRiftDefaultCharacterRules
): Record<string, Skill> {
	const r = rules.stats; //shorthand
	const newSkills = r.skills.map((s) => ({ ...s, value: 0 }));
	// Convert to object, using skill name as key
	return newSkills.reduce((acc, s) => ({ ...acc, [s.name]: s }), {});
}

function populateDefaultCharacteristics(
	rules: ArcaneRiftCharacterRules = arcaneRiftDefaultCharacterRules
): Record<string, Characteristic> {
	const r = rules.stats; //shorthand
	const averageValue = Math.floor(rules.characteristics.maxSum / r.characteristics.length);
	const newCharacteristics = r.characteristics.map((c) => ({ ...c, value: averageValue }));
	// Convert to object, using characteristic name as key
	return newCharacteristics.reduce((acc, c) => ({ ...acc, [c.name]: c }), {});
}

export type ArcaneRiftCharacterMechanics = {
	rules: ArcaneRiftCharacterRules;
	stats: {
		characteristics: Record<string, Characteristic>;
		skills: Record<string, Skill>;
	};
	aspects: Aspect[];
	shortlist: string[];
	stressTracks: {
		variant: string;
		value: number;
		max: number;
	}[];
	consequences: Array<Consequence | null>;
};

// Defaults for AR character
export const arcaneRiftCharacterMechanics: ArcaneRiftCharacterMechanics = {
	rules: arcaneRiftDefaultCharacterRules,
	stats: {
		characteristics: populateDefaultCharacteristics(arcaneRiftDefaultCharacterRules),
		skills: populateEmptySkillValueMap(arcaneRiftDefaultCharacterRules)
	},
	aspects: [],
	shortlist: [],
	stressTracks: [
		{
			variant: 'Physical',
			value: 0,
			max: 3
		},
		{
			variant: 'Mental',
			value: 0,
			max: 3
		}
	],
	consequences: []
};
