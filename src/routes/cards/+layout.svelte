<script lang="ts">
	// Needed types and classes for cardStore
	import type { card as PrismaCard } from '@prisma/client';
	import { CardStore } from '$lib/core/cards/cardStore.svelte';

	// Context stuff for Svelte (to access cardStore in children)
	import { setContext } from 'svelte';

	interface Props {
		children?: import('svelte').Snippet;
		data: {
			user: any;
			session: any;
			dbCards: any;
		};
	}
	let { children, data }: Props = $props();

	// Init cardStore and set context
	const dbCards = data.dbCards as PrismaCard[];
	const db_cardStore = new CardStore({ prisma: dbCards });
	setContext('db_cardStore', db_cardStore);
</script>

{@render children?.()}
