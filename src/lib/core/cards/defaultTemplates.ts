import { Card } from './card.svelte';

const templatesBase: Partial<Card>[] = [
	{
		name: 'Sword',
		type: 'Melee',
		description: 'Cool Sword',
		subtitle: 'Light Melee Weapon'
	}
];

export const defaultTemplates: Card[] = templatesBase.map((card) => new Card(card));
