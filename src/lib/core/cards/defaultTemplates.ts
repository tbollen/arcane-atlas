import { Card } from './card.svelte';

const templatesBase = [
	{
		name: 'New Card',
		type: 'Card',
		description: 'Card Description'
	}
];

export const defaultTemplates: Card[] = templatesBase.map((card) => new Card(card));
