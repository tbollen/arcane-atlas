<script lang="ts">
	// Needed types and classes for cardStore
	import type { card as PrismaCard } from '@prisma/client';
	import { CardStore, StoredCard, CARD_CONTEXT_KEY } from '$lib/domain/cards/cardStore.svelte';
	import type { UserID, CardID } from '$lib/domain/index.js';
	import type { PrismaCardExtended } from '$lib/domain/cards/cardStore.svelte';
	import type { User as PrismaUser } from '@prisma/client';

	// Context stuff for Svelte (to access cardStore in children)
	import { setContext } from 'svelte';

	let { children, data } = $props();
	const allCardIds: CardID[] = data.db_cards_ids as CardID[];

	// INIT cards from data
	let cards: StoredCard[] = data.db_cards.map((prismaCard) =>
		StoredCard.newCardFromPrisma({
			card: prismaCard as PrismaCardExtended,
			user: (data.user as PrismaUser) ?? undefined // undefined if no user is given
			// characters: data.characters // TODO: set and get active character
		})
	);

	// Init cardStore and set context
	const db_cardStore = new CardStore({ cards, ids: allCardIds }); //TODO: add localstorage fallback
	setContext<CardStore>(CARD_CONTEXT_KEY, db_cardStore);
</script>

{@render children?.()}
