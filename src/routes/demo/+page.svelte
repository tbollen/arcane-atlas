<script lang="ts">
	import DiceIcon from '$lib/components/partials/arcaneRift/DiceIcon.svelte';
	import { genesysDiceSymbolsMap } from '$lib/components/partials/arcaneRift/DiceIcon.svelte';
</script>

<div class="mx-auto my-2 flex w-2xl flex-wrap justify-between">
	{#each Object.keys(genesysDiceSymbolsMap) as _symbol}
		{@const symbol = _symbol as keyof typeof genesysDiceSymbolsMap}
		<div class="block p-4">
			<DiceIcon {symbol} class="text-4xl" richColor />
		</div>
	{/each}
</div>
