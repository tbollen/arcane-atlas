<!--
    @component Edit List
    
    A custom list component that renders a collection of items.
    
    This component uses a snippet called "item" to override the default rendering of list items.
    If the "item" snippet is provided, it will be used to render each item in the list with custom content and styling.
    If no "item" snippet is provided, the component falls back to default list item rendering.
    
    @prop {Array} items - The array of items to be rendered in the list
    @prop {Function} [onitemclick] - Optional callback function triggered when a list item is clicked. 
                                                                        When not defined, list items will not respond to click events.
    @prop {Function} [onitemhover] - Optional callback function triggered when a list item is hovered over.
                                                                        When not defined, list items will not respond to hover events.
    @prop {Function} [onitemfocus] - Optional callback function triggered when a list item receives focus.
                                                                        When not defined, list items will not respond to focus events.
    
    @example
    ```svelte
    <List items={myItems}>
        {#snippet item(data)}
            <div class="custom-item">{data.name}</div>
        {/snippet}
    </List>
    ```
-->
<script lang="ts" generics="T">
	// Import UI components
	import { Button } from '$lib/components/ui/button/index.js';
	import type { WithElementRef } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import type { HTMLAnchorAttributes, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

	// Types and Utils

	type ListProps<T> = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		list: Array<T>;
		increase?: ((fromIndex: number, toIndex?: number) => void | T) | 'hidden';
		decrease?: ((fromIndex: number, toIndex?: number) => void | T) | 'hidden';
		remove?: ((index: number) => void | T) | 'hidden';
		onlistchange?: (item?: T, index?: number) => void | T;
		item?: import('svelte').Snippet<[T, number]>;
	};

	// Default move function if not provided
	function moveInList(fromIndex: number, toIndex: number) {
		if (fromIndex < 0 || fromIndex >= list.length) return; // Invalid fromIndex
		if (toIndex < 0 || toIndex >= list.length) return; // Invalid toIndex
		// Move item in the array
		const item = list.splice(fromIndex, 1)[0];
		list.splice(toIndex, 0, item);
	}

	function _decrease(index: number) {
		let item = list[index];
		moveInList(index, index - 1);
		return item;
	}

	function _increase(index: number) {
		let item = list[index];
		moveInList(index, index + 1);
		return item;
	}

	function _remove(index: number) {
		let item = list[index];
		list.splice(index, 1);
		return item;
	}

	function _onlistchange(target?: T, index?: number) {
		if (target) return target;
		if (index !== undefined) return list[index];
		return;
	}

	let {
		list = $bindable(),
		class: className,
		ref = $bindable(null),
		increase = _increase,
		decrease = _decrease,
		remove = _remove,
		onlistchange = _onlistchange,
		item,
		...restProps
	}: ListProps<T> = $props();
</script>

<!-- WRAPPER -->
<div class="flex flex-col gap-0 {className}" bind:this={ref} {...restProps}>
	<!-- ITEMS -->
	{#each list as listItem, index}
		<div
			class="flex flex-row items-center gap-4 border-obsidian-500 py-2 [:not(:first-child)]:border-t-2"
		>
			{#if item}
				<div class="flex-grow">
					{@render item(listItem, index)}
				</div>
			{:else}
				<span class="flex-grow">{listItem}</span>
			{/if}

			<!-- CONTROLS -->
			{#if decrease !== 'hidden'}
				<Button
					size="icon"
					disabled={index == 0}
					onclick={() => {
						decrease(index, index - 1);
						onlistchange(listItem, index);
					}}
				>
					<Icon icon="mdi:arrow-up" /></Button
				>
			{/if}
			{#if increase !== 'hidden'}
				<Button
					size="icon"
					disabled={index == list.length - 1}
					onclick={() => {
						increase(index, index + 1);
						onlistchange(listItem, index);
					}}
				>
					<Icon icon="mdi:arrow-down" /></Button
				>
			{/if}

			{#if remove !== 'hidden'}
				<Button
					size="icon"
					onclick={() => {
						remove(index);
						onlistchange(listItem, index);
					}}><Icon icon="mdi:close" /></Button
				>
			{/if}
		</div>
	{/each}
</div>
