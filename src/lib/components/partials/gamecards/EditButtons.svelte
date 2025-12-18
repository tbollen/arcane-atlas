<script lang="ts">
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	// TYPES
	import type { Card } from '$lib/domain/cards/card.svelte';
	import type { StoredCard } from '$lib/domain/cards/cardStore.svelte';
	import type { User as PrismaUser } from '@prisma/client';
	import type { ComponentProps } from 'svelte';

	// Functions (passthrough)
	type ButtonFunctions = {
		enlarge?: (card: StoredCard | Card) => any;
		navigate?: (card: StoredCard) => any;
		download?: (card: StoredCard) => any;
		edit?: (card: StoredCard) => any;
		duplicate?: (card: StoredCard | Card) => any;
		createFromTemplate?: (card: StoredCard | Card) => any;
		delete?: (card: StoredCard) => any;
		addToCharacter?: (card: StoredCard) => any;
		removeFromCharacter?: (card: StoredCard) => any;
	};

	let {
		class: className,
		card,
		user,
		functions,
		compact
	}: {
		class: string;
		card: StoredCard;
		user: PrismaUser | null;
		functions: ButtonFunctions;
		compact?: boolean;
	} = $props();

	let size: ComponentProps<typeof Button>['size'] = $derived(compact ? 'icon' : 'default');
</script>

<!-- Edit Options -->
<div class="{className} flex flex-row flex-wrap gap-2">
	{#each Object.entries(functions) as [fn, func]}
		<!-- Options when user can edit -->
		{#if fn === 'enlarge' && func}
			<!-- VIEW / ENLARGE -->
			<Button
				tooltip="Show card"
				{size}
				onclick={(e: Event) => {
					e.stopPropagation();
					func(card);
				}}
			>
				<Icon icon="mdi:zoom-in" />
				{#if !compact}
					View
				{/if}
			</Button>
		{/if}
		<!-- NAVIGATE -->
		{#if fn === 'navigate' && func}
			<Button
				{size}
				tooltip="Go to card page"
				onclick={(e: Event) => {
					e.stopPropagation();
					func(card);
				}}
			>
				<Icon icon="mdi:arrow-right-bold" />
				{#if !compact}
					Go to Card
				{/if}
			</Button>
		{/if}
		<!-- DOWNLOAD -->
		{#if fn === 'download' && func}
			<Button
				{size}
				tooltip="Download as JSON"
				onclick={(e: Event) => {
					e.stopPropagation();
					func(card);
				}}
			>
				<Icon icon="mdi:download" />
				{#if !compact}
					Download
				{/if}
			</Button>
		{/if}
		<!-- EDIT -->
		{#if fn === 'edit' && user && card.clientPermission.canEdit && func}
			<Button
				{size}
				variant="blossom"
				tooltip="Edit Card"
				onclick={(e: Event) => {
					e.stopPropagation();
					func(card);
				}}
			>
				<Icon icon="mdi:pencil" />
				{#if !compact}
					Edit
				{/if}
			</Button>
		{/if}
		<!-- DUPLICATE -->
		{#if fn === 'duplicate' && user}
			<Button
				variant="advanced"
				{size}
				tooltip="Duplicate Card"
				onclick={(e: Event) => {
					e.stopPropagation();
					func(card);
				}}
			>
				<Icon icon="mdi:content-copy" />
				{#if !compact}
					Duplicate
				{/if}
			</Button>
		{/if}
		{#if fn === 'createFromTemplate'}
			<!-- CREATE FROM TEMPLATE -->
			<Button
				variant="advanced"
				tooltip="Create card from this template"
				onclick={(e: Event) => {
					e.stopPropagation();
					func(card);
				}}
			>
				<Icon icon="mdi:content-copy" />
				{#if !compact}
					Create
				{/if}
			</Button>
		{/if}

		<!-- DELETE -->
		{#if user?.id === card.ownerId && fn === 'delete' && func}
			<Button
				{size}
				variant="destructive"
				tooltip="Delete Card"
				color="threat"
				onclick={(e: Event) => {
					e.stopPropagation();
					func(card);
				}}
			>
				<Icon icon="mdi:trash" />
				{#if !compact}
					Delete
				{/if}
			</Button>
		{/if}

		<!-- ADD TO CHARACTER -->
		{#if fn === 'addToCharacter' && func}
			<Button
				variant="advanced"
				{size}
				tooltip="Add card to character"
				onclick={(e: Event) => {
					e.stopPropagation();
					func(card);
				}}
			>
				<Icon icon="mdi:account-plus" />
				{#if !compact}
					Add to Character
				{/if}
			</Button>
		{/if}
		<!-- REMOVE FROM CHARACTER -->
		{#if fn === 'removeFromCharacter' && func}
			<Button
				variant="destructive"
				{size}
				tooltip="Remove card from character"
				onclick={(e: Event) => {
					e.stopPropagation();
					func(card);
				}}
			>
				<Icon icon="mdi:account-remove" />
				{#if !compact}
					Remove from Character
				{/if}
			</Button>
		{/if}
	{/each}
</div>
