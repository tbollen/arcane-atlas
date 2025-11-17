<script lang="ts">
	import { AR_KEY } from '$lib/gameSystems';
	import { type DeckProps } from '../types';

	let { character = $bindable(), edit = $bindable() }: DeckProps = $props();
</script>

<!-- Safeguard to make sure the character has Arcane Rift mechanics -->
{#if character.mechanics.hasOwnProperty(AR_KEY)}
	<!-- EDIT Mode -->
	{#if edit}
		EDIT MODE?
	{:else}
		<div>
			{#if character.mechanics[AR_KEY]?.aspects?.length == 0}
				<div>No aspects</div>
			{:else}
				{#each character.mechanics[AR_KEY]?.aspects as aspect}
					<div>{aspect.short}</div>
					<div>{aspect.description}</div>
				{/each}
			{/if}
		</div>
	{/if}
{/if}
