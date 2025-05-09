type CardType = {
	name: string;
	icon: string;
	iconOrientation?: 'default' | 'outward' | 'inward';
};

const _cardTypes: CardType[] = [
	{
		name: 'Item',
		icon: 'mdi:sack'
	},
	{
		name: 'Ranged',
		icon: 'radix-icons:crosshair-2'
	},
	{
		name: 'Melee',
		icon: 'mdi:sword-cross'
	},
	{
		name: 'Spell',
		icon: 'mdi:sparkles'
	},
	{
		name: 'Armor',
		icon: 'mdi:shield'
	},
	{
		name: 'Talisman',
		icon: 'lucide:ship-wheel'
	},
	{
		name: 'Scroll',
		icon: 'mdi:scroll'
	},
	{
		name: 'Potion',
		icon: 'mdi:flask-round-bottom'
	},
	{
		name: 'Instrument',
		icon: 'mdi:guitar-acoustic'
	},
	{
		name: 'Move',
		icon: 'material-symbols:sprint-rounded'
	},
	{
		name: 'Bomb',
		icon: 'mdi:bomb'
	},
	{
		name: 'Trap',
		icon: 'mdi:mine'
	},
	{
		name: 'Jewel',
		icon: 'mdi:diamond-stone'
	}
];

// Fill with default values for undefined properties
export const cardTypes: CardType[] = _cardTypes.map((cardType) => ({
	...cardType,
	iconOrientation: cardType.iconOrientation ?? 'default'
}));

export type IsCardType = (typeof _cardTypes)[number]['name'];
