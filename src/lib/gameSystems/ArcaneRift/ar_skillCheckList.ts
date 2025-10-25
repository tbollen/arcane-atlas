export let skillList = {
	Brawn: ['Muscle', 'Toughness', 'Athletics'],
	Agility: ['Precision', 'Reflex', 'Coordination'],
	Intellect: ['Arcana', 'Lore', 'Medicine'],
	Cunning: ['Investigation', 'Stealth', 'Ingenuity'],
	Willpower: ['Intution', 'Composure', 'Vigilance'],
	Presence: ['Charm', 'Insight', 'Persuasion']
} as const;

export type Characteristic = keyof typeof skillList;
export type Skill = (typeof skillList)[keyof typeof skillList][number];

export let characteristics = Object.keys(skillList) as Characteristic[]; //Asserted, make sure it checks out!
export let skills = Object.values(skillList).flat() as Skill[]; //Asserted, make sure it checks out!
