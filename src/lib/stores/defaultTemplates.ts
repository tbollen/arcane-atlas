import { Item } from '$lib/types/Item';
export const defaultTemplates: Item[] = [
	new Item({
		name: 'Melee Weapon',
		subtitle: 'Heavy Melee Weapon',
		type: 'Melee',
		description: 'A sturdy sword...',
		fields: [
			{
				name: 'to Hit',
				description: '+[di][di]'
			},
			{
				name: 'Use',
				description: 'Action'
			}
		],
		image: {
			url: 'https://t3.ftcdn.net/jpg/00/46/29/44/360_F_46294440_hvs2DWGl3QpLDF2ZyKM5b6Wr1kH8mkWJ.jpg',
			scale: 120,
			x_offset: 0,
			y_offset: 0,
			rotation: 60
		},
		skillCheck: {
			characteristic: 'Brawn',
			skill: 'Muscle'
		}
	}),

	new Item({
		name: 'Ranged Weapon',
		subtitle: 'Fine Ranged Weapon',
		type: 'Ranged',
		description: 'A fine bow',
		fields: [
			{
				name: 'to Hit',
				description: '+[di][di]'
			},
			{
				name: 'Use',
				description: 'Action'
			}
		],
		image: {
			url: 'https://i.pinimg.com/736x/d7/1e/ee/d71eee64c550d1f052572142d121d0c4.jpg',
			scale: 100,
			x_offset: 0,
			y_offset: 0,
			rotation: 60
		},
		skillCheck: {
			characteristic: 'Agility',
			skill: 'Precision'
		}
	})
];

export const startingItems: Item[] = [
	new Item({
		name: 'Heavy Hammer',
		type: 'Melee',
		subtitle: 'Heavy Melee Weapon',
		description: 'A heavy melee weapon that can SWING at enemies!',
		aspects: [
			{
				name: 'aspects',
				description: ''
			}
		],
		skillCheck: {
			characteristic: 'Brawn',
			skill: 'Muscle'
		},
		fields: [
			{
				name: 'to Hit',
				description: '+[pr][ch]'
			}
		],
		image: {
			rotation: 14,
			scale: 175,
			x_offset: 8,
			y_offset: 4,
			url: 'https://img.freepik.com/premium-photo/fantasy-hammer-ancients-fantasy-weapon-design-mobile-gaming_312584-10500.jpg'
		}
	})
];
