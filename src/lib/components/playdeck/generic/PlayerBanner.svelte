<script lang="ts">
	import { type DeckProps } from '../types';

	let { character = $bindable(), edit }: DeckProps = $props();
</script>

{#if edit}
	EDIT MODE?
{:else}
	<div>
		<img src={character.imageUrl} alt={character.name} />
		<div>{character.name}</div>
	</div>
{/if}
