<script lang="ts">
	import { type DeckProps } from '../types';

	let { character, edit }: DeckProps = $props();
</script>

<div>
	<img src={character.imageUrl} alt={character.name} />
	<div>{character.name}</div>
</div>
