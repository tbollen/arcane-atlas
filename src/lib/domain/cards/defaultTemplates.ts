import { Card } from './card.svelte';
import { AR_KEY, GENERIC_KEY } from '$lib/gameSystems';

const templatesBase: Partial<Card>[] = [
	{
		name: "Duellist's Sword",
		type: 'Melee',
		description:
			'A lightweight sword that can jab at targets rapidly when wielded by a skillful swordsman.',
		subtitle: 'Light Melee Weapon',
		mechanics: {
			[GENERIC_KEY]: {},
			[AR_KEY]: {
				aspects: [
					{
						short: 'Parry',
						description:
							'May add +[ab] to any defense roll against attacks from light melee weapons.'
					}
				],
				fields: [
					{
						label: 'To Hit',
						value: '+[ab]'
					}
				],
				check: {
					characteristic: 'Agility',
					skill: 'Precision'
				}
			}
		}
	}
];

export const defaultTemplates: Card[] = templatesBase.map((card) => new Card(card));
