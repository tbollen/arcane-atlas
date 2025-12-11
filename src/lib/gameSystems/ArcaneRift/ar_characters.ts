//////////////////////////
// RULES

// TYPES AND FUNCTIONS PER MEHCANICS
// Consequences
export type ConsequenceVariant = 'mild' | 'moderate' | 'severe' | 'extreme';
const severityOrder: ConsequenceVariant[] = ['mild', 'moderate', 'severe', 'extreme'];
export const consequenceSeverityExamples: Record<ConsequenceVariant, string[]> = {
	mild: ['Bruised ribs', 'Cut hand', 'Fatigued'],
	moderate: ['Sprained ankle', 'Deep cut', 'Temporary blindness'],
	severe: ['Cracked ribs', 'Torn muscle', 'Concussion'],
	extreme: ['Broken bone', 'Internal bleeding', 'Severe trauma']
};
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
			{ name: 'Brawn', description: 'Raw physical strength and toughness' },
			{ name: 'Agility', description: 'Speed, nimbleness and accuracy of movements' },
			{ name: 'Intellect', description: 'Wits and knowledge of the world' },
			{ name: 'Cunning', description: 'Intuitive knowledge and creativity' },
			{ name: 'Willpower', description: 'Mental sharpness and resilience' },
			{ name: 'Presence', description: 'Charisma and social skills' }
		],
		skills: [
			{ name: 'Muscle', description: 'Physical strength and power', characteristic: 'Brawn' },
			{
				name: 'Toughness',
				description: 'Physical resilience and endurance',
				characteristic: 'Brawn'
			},
			{
				name: 'Athletics',
				description: 'Effectiveness of physical strength',
				characteristic: 'Brawn'
			},
			{
				name: 'Precision',
				description: 'Precision of finesse movements',
				characteristic: 'Agility'
			},
			{ name: 'Reflex', description: 'Ability to react quickly', characteristic: 'Agility' },
			{
				name: 'Coordination',
				description: 'Control over physical movement',
				characteristic: 'Agility'
			},
			{
				name: 'Arcana',
				description: 'Knowledge of all things magical and otherworldly',
				characteristic: 'Intellect'
			},
			{
				name: 'Lore',
				description: 'Book-knowledge of the known world',
				characteristic: 'Intellect'
			},
			{
				name: 'Medicine',
				description: 'Ability to diagnose and treat illness',
				characteristic: 'Intellect'
			},
			{
				name: 'Investigation',
				description: 'Active spotting of hidden things like clues and traps',
				characteristic: 'Cunning'
			},
			{
				name: 'Stealth',
				description: 'Ability to vanish and remain undetected',
				characteristic: 'Cunning'
			},
			{
				name: 'Ingenuity',
				description: 'Creativity and ability to craft',
				characteristic: 'Cunning'
			},
			{
				name: 'Intution',
				description: 'Ability to subconsciously pick up subtle cues',
				characteristic: 'Willpower'
			},
			{
				name: 'Composure',
				description: 'Remaining calm under pressure',
				characteristic: 'Willpower'
			},
			{
				name: 'Vigilance',
				description: 'Reaction speed to unexpected threats',
				characteristic: 'Willpower'
			},
			{
				name: 'Charm',
				description: 'Ability to charm, butter up or seduce',
				characteristic: 'Presence'
			},
			{
				name: 'Insight',
				description: 'Empathy and ability to understand others',
				characteristic: 'Presence'
			},
			{
				name: 'Persuasion',
				description: 'Being convincing and persuasive',
				characteristic: 'Presence'
			}
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
