<!-- 
 @component ListItem

 A flexible list item component that can display an icon, main text, sub text, and an optional handle button. Very useful in combination with the EditList component.

 @prop item: T (optional) - The item associated with this list item, useful for typing and functions.
 @prop onItemClick: () => void (optional) - Function to be called when the item is clicked.
 @prop icon: string | object | snippet (optional) - The icon to display. An object may be provided with 'icon', 'class', and 'style' properties.
 @prop mainText: string | object | snippet - The main text to display. An object may be provided with 'text', 'class', and 'style' properties.
 @prop subText: string | object | snippet (optional) - The sub text to display. An object may be provided with 'text', 'class', and 'style' properties.
 @prop handle: object | () => void (optional) - An object defining the handle function. When passing an object, the handle can be customized with 'click', 'class', 'variant', 'icon', and 'left' properties. If a function is provided, it will be used as the click handler with default styling.

 @example
 ```svelte
 <ListItem
	 mainText={{ text: 'Item Name', class: 'text-lg font-bold' }}
	 subText="This is a subtext"
	 icon={{ icon: 'mdi:star', class: 'text-yellow-500' }}
	 onItemClick={() => console.log('Item clicked')}
	 handle={{
		 click: () => console.log('Handle clicked'),
		 class: 'custom-handle-class',
		 variant: 'destructive',
		 icon: 'mdi:delete',
		 left: false
	 }}
		  />
``` 
  -->
<script lang="ts">
	import { Button, type ButtonVariant } from '$lib/components/ui/button/';
	import Icon, { iconExists } from '@iconify/svelte';
	// Tailwind classes
	import type { ClassValue } from 'clsx';
	import { cn } from '$lib/utils';

	// Types and Utils
	import type { WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type Div = WithElementRef<HTMLAttributes<HTMLDivElement>>;
	type ExtendedString = string | { text: string; class?: ClassValue; style?: Div['style'] };
	type ExtendedIcon = string | { icon: string; class?: ClassValue; style?: Div['style'] };

	type ListItemProps<T> = Div & {
		// specifiy item for typing and functions
		item?: T;
		// Item click
		onItemClick?: () => void;
		// Content
		icon?: ExtendedIcon | import('svelte').Snippet;
		mainText: ExtendedString | import('svelte').Snippet;
		subText?: ExtendedString | import('svelte').Snippet;
		// Handle (object with info or plain function, using defaults)
		handle?:
			| {
					click: () => void;
					class?: ClassValue;
					variant?: ButtonVariant;
					icon?: string;
					left?: boolean;
			  }
			| (() => void);
	};

	let {
		class: className,
		ref = $bindable(null),
		item = $bindable(undefined),
		onItemClick,
		icon,
		mainText,
		subText,
		handle
	}: ListItemProps<any> = $props();

	// ICON stuff
	let validIcon = $derived.by(() => {
		if (!icon) return null;
		if (typeof icon === 'object') return icon.icon;
		if (typeof icon === 'string' && iconExists(icon)) return icon;
		return null;
	});
	let hasIcon = $derived(validIcon !== null || (icon !== undefined && typeof icon === 'function'));

	// Derived grid layout
	let gridLayout: ClassValue = $derived(`
        ${icon !== undefined ? 'grid-cols-[auto_1fr]' : 'grid-cols-[1fr]'}
        ${subText ? 'grid-rows-[auto_auto]' : 'grid-rows-[auto]'}
        `);

	let flexDirection = $derived(
		handle && typeof handle !== 'function' && handle.left ? 'flex-row-reverse' : 'flex-row'
	);
</script>

{#snippet content()}
	<!-- ICON, either as a string or as a snippet -->
	<div
		class={cn(
			'row-span-2 h-full',
			hasIcon ? 'aspect-square p-2' : '',
			icon && typeof icon === 'object' ? icon?.class ?? '' : ''
		)}
		style={typeof icon === 'object' ? icon?.style ?? '' : ''}
	>
		{#if validIcon}
			<Icon icon={validIcon} class="h-full w-full" />
		{:else if icon && typeof icon === 'function'}
			{@render icon()}
		{/if}
	</div>

	<!-- MAIN Text, either as a string or as a snippet -->
	{#if typeof mainText === 'function'}
		{@render mainText()}
	{:else if mainText !== undefined}
		{@const text = typeof mainText === 'string' ? mainText : mainText.text}
		{@const textStyle = typeof mainText === 'object' ? mainText?.style ?? '' : ''}
		{@const textClass = typeof mainText === 'object' ? mainText?.class ?? '' : ''}
		<p
			class={cn(
				'w-full max-w-full overflow-hidden text-left leading-tight font-semibold overflow-ellipsis whitespace-nowrap',
				subText ? '' : 'row-span-2 ',
				textClass
			)}
			style={textStyle ?? ''}
		>
			{text}
		</p>
	{/if}

	<!-- SUB Text, either as a string or as a snippet -->
	{#if typeof subText === 'function'}
		{@render subText()}
	{:else if subText !== undefined}
		{@const text = typeof subText === 'string' ? subText : subText.text}
		{@const textStyle = typeof subText === 'object' ? subText?.style ?? '' : ''}
		{@const textClass = typeof subText === 'object' ? subText?.class ?? '' : ''}
		<p
			class={cn(
				'max-w-full overflow-hidden text-left text-sm overflow-ellipsis whitespace-nowrap text-muted-foreground',
				textClass
			)}
			style={textStyle ?? ''}
		>
			{text}
		</p>
	{/if}
{/snippet}

<div class="flex w-full {flexDirection} items-center gap-2 py-1">
	<!-- CONTENT as Button or Div -->
	{#if onItemClick !== undefined}
		<button
			class={cn(
				'grid w-full cursor-pointer items-center justify-items-start gap-x-1 gap-y-0.5 rounded-lg p-1 hover:bg-obsidian-500/10',
				gridLayout,
				className
			)}
			onclick={onItemClick}
		>
			{@render content()}
		</button>
	{:else}
		<div
			class={cn(
				'grid w-full items-center justify-items-start gap-x-1 gap-y-0.5 p-1',
				gridLayout,
				className
			)}
		>
			{@render content()}
		</div>
	{/if}

	<!-- HANDLE -->
	{#if handle}
		{@const clickFunc = typeof handle === 'function' ? handle : handle.click ?? (() => {})}
		{@const handleClass = typeof handle === 'function' ? '' : handle.class ?? ''}
		{@const handleVariant =
			typeof handle === 'function' ? 'destructive' : handle.variant ?? 'destructive'}
		{@const handleIcon = typeof handle === 'function' ? 'mdi:remove' : handle.icon ?? 'mdi:remove'}
		<Button
			class={cn(
				'not-hover:w-4! not-hover:p-0! not-hover:text-transparent hover:w-8 hover:text-white',
				handleClass
			)}
			variant={handleVariant}
			onclick={clickFunc}
		>
			<Icon icon={handleIcon} />
		</Button>
	{/if}
</div>
