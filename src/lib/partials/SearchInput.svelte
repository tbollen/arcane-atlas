<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import Icon from '@iconify/svelte';

	let {
		searchTerm = $bindable()
	}: {
		searchTerm: string;
	} = $props();
</script>

<InputGroup.Root>
	<InputGroup.Input
		value={searchTerm}
		placeholder="Search..."
		oninput={(e) => {
			// @ts-ignore
			const _value = e.target?.value || '';
			searchTerm = _value;
		}}
	/>
	<InputGroup.Addon>
		<Icon icon="mdi:magnify" />
	</InputGroup.Addon>
	{#if searchTerm}
		<InputGroup.Addon align="inline-end">
			<InputGroup.Button
				onclick={() => {
					searchTerm = '';
				}}><Icon icon="mdi:remove" /></InputGroup.Button
			>
		</InputGroup.Addon>
	{/if}
</InputGroup.Root>
