<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import Icon from '@iconify/svelte';
	import type { ComponentProps } from 'svelte';

	type InputProps = ComponentProps<typeof InputGroup.Input>;

	type OptionObject = {
		value: string;
		label?: string;
		terms: string[];
	};

	/**
	 * Option can be a string or an object with value and terms
	 * When a single string is passed, the search will filter its options based on that exact value
	 * When the object is passed, the search will filter based on the terms array. It will return the value when selected.
	 */
	type Option = OptionObject | string;

	let {
		searchTerm = $bindable(),
		options,
		...restProps
	}: {
		searchTerm: string;
		options?: Option[];
	} & InputProps = $props();

	// Turn options into OptionObject if they are strings
	let parsedOptions: OptionObject[] = $derived.by(() => {
		if (!options) return [];
		return options.map((option) => {
			if (typeof option === 'string') {
				return { value: option, label: option, terms: [option] };
			} else {
				return option;
			}
		});
	});

	let filteredOptions = $derived.by(() => {
		// Fallback if no options
		if (!options || options.length === 0) return parsedOptions; // If not options are provided, return empty list
		if (!searchTerm || searchTerm.trim() === '') return parsedOptions; // If no search term, return all options

		const lowerSearch = searchTerm.toLowerCase();
		return parsedOptions.filter((option) =>
			option.terms.some((term) => term.toLowerCase().includes(lowerSearch))
		);
	});
</script>

<InputGroup.Root>
	<InputGroup.Input
		value={searchTerm}
		placeholder={restProps?.placeholder ?? 'Search...'}
		oninput={(e) => {
			// @ts-ignore
			const _value = e.target?.value || '';
			searchTerm = _value;
		}}
		list="search-options"
		{...restProps}
	/>
	<datalist id="search-options">
		{#each filteredOptions as option}
			<option class="bg-obsidian-500" value={option.value}>{option.label ?? option.value}</option>
		{/each}
	</datalist>
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
