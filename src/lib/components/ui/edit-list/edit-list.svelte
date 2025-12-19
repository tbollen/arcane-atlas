<script lang="ts" generics="T">
	// Import UI components
	import { Button } from '$lib/components/ui/button/index.js';
	import type { WithElementRef } from '$lib/utils';
	import Icon from '@iconify/svelte';
	import type { HTMLAnchorAttributes, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

	// Types and Utils

	type ListProps<T> = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		list: Array<T>;
		increase?: ((fromIndex: number, toIndex?: number) => void) | 'hidden';
		decrease?: ((fromIndex: number, toIndex?: number) => void) | 'hidden';
		remove?: ((index: number) => void) | 'hidden';
		onchange?: (index?: number) => void | number;
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
		moveInList(index, index - 1);
	}

	function _increase(index: number) {
		moveInList(index, index + 1);
	}

	function _remove(index: number) {
		list.splice(index, 1);
	}

	let {
		list = $bindable(),
		class: className,
		ref = $bindable(null),
		increase = _increase,
		decrease = _decrease,
		remove = _remove,
		onchange = () => {},
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
						onchange(index);
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
						onchange(index);
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
						onchange(index);
					}}><Icon icon="mdi:close" /></Button
				>
			{/if}
		</div>
	{/each}
</div>
