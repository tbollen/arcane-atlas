type Skill = { name: string; description: string };
type Characteristic = { name: string; description: string; skills: Skill[] };
export const characteristics: Characteristic[] = [
	{
		name: 'Brawn',
		description: 'Physical strength and toughness',
		skills: []
	},
	{
		name: 'Agility',
		description: 'Physical agility and reflexes',
		skills: []
	},
	{
		name: 'Intellect',
		description: 'Physical agility and reflexes',
		skills: []
	},
	{
		name: 'Cunning',
		description: 'Physical agility and reflexes',
		skills: []
	},
	{
		name: 'Willpower',
		description: 'Physical agility and reflexes',
		skills: []
	},
	{
		name: 'Presence',
		description: 'Physical agility and reflexes',
		skills: []
	}
];

export const characteristicRules = {
	maxPoints: 5,
	minPoints: 1,
	totalPoints: 21
};
