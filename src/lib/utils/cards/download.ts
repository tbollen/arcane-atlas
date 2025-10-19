import { serializeCard } from '$lib/domain/cards/cardStore.svelte';
import { StoredCard } from '$lib/domain/cards/cardStore.svelte';

export const downloadCards = (cards: StoredCard[]) => {
	if (!cards.length) return; // If an empty array is given, do nothing
	const _stringifiedCards = JSON.stringify(cards.map((card) => serializeCard(card)));
	const blob = new Blob([_stringifiedCards], { type: 'application/json' });
	const filename: string = cards.length > 1 ? 'cards.json' : `${cards[0].name}.json`;
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
};
