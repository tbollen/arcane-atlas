<!-- 
 @component ListItem

 A flexible list item component that can display an icon, main text, sub text, and an optional handle button. Very useful in combination with the EditList component.

 @prop item: T (optional) - The item associated with this list item, useful for typing and functions.
 @prop onclick: () => void (optional) - Function to be called when the item is clicked.
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
	 onclick={() => console.log('Item clicked')}
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

	type ExtendedString = string | { text: string; class?: ClassValue; style?: string };
	type ExtendedIcon = string | { icon: string; class?: ClassValue; style?: string };

	type ListItemProps<T> = {
		variant?: 'default';
		// specifiy item for typing and functions
		item?: T;
		// Item click
		onclick?: () => void;
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
					extended?: boolean;
					icon?: string;
					left?: boolean;
			  }
			| (() => void);
		class?: string;
		ref?: HTMLElement | null;
	};

	type SkeletonVariantProps = {
		variant: 'skeleton';
		item?: any;
		onclick?: () => void;
		icon?: boolean;
		mainText?: boolean;
		subText?: boolean;
		handle?: undefined;
	};

	let {
		variant = 'default',
		class: className,
		ref = $bindable(undefined),
		item = $bindable(undefined),
		icon,
		mainText,
		subText,
		handle,
		onclick,
		...restProps
	}: (ListItemProps<any> | SkeletonVariantProps) &
		WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	// ICON stuff
	let validIcon = $derived.by(() => {
		if (!icon) return null;
		if (typeof icon === 'object') return icon.icon;
		if (typeof icon === 'string' && iconExists(icon)) return icon;
		return null;
	});
	console.error('validIcon', validIcon, icon);
	let hasIcon = $derived(
		validIcon !== null ||
			(icon !== undefined && typeof icon === 'function') ||
			(variant === 'skeleton' && icon !== false)
	);

	// Derived grid layout
	let gridLayout: ClassValue = $derived(`
		${hasIcon ? 'grid-cols-[auto_1fr]' : 'grid-cols-[1fr]'}
		${subText !== undefined || (variant === 'skeleton' && subText !== false) ? 'grid-rows-[auto_auto]' : 'grid-rows-[auto]'}
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
			variant === 'skeleton' ? 'aspect-square' : hasIcon ? 'aspect-square p-2' : '',
			icon && typeof icon === 'object' ? icon?.class ?? '' : ''
		)}
		style={typeof icon === 'object' ? icon?.style ?? '' : ''}
	>
		{#if variant === 'skeleton' && icon !== false}
			<div class="h-full animate-pulse rounded-full bg-obsidian-500/20"></div>
		{:else if validIcon}
			<Icon icon={validIcon} class="h-full w-full" />
		{:else if icon && typeof icon === 'function'}
			{@render icon()}
		{/if}
	</div>

	<!-- MAIN Text, either as a string or as a snippet -->
	{#if typeof mainText === 'function'}
		{@render mainText()}
	{:else if mainText !== undefined && typeof mainText !== 'boolean'}
		{@const text = typeof mainText === 'string' ? mainText : mainText?.text}
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
	{:else if variant === 'skeleton' && mainText !== false}
		<div
			class={cn(
				'h-4 w-3/4 animate-pulse rounded bg-obsidian-500/20',
				subText !== false ? '' : 'row-span-2'
			)}
		></div>
	{/if}

	<!-- SUB Text, either as a string or as a snippet -->
	{#if typeof subText === 'function'}
		{@render subText()}
	{:else if subText !== undefined && typeof subText !== 'boolean'}
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
	{:else if variant === 'skeleton' && subText !== false}
		<div class="h-3 w-1/2 animate-pulse rounded bg-obsidian-500/20"></div>
	{/if}
{/snippet}

<div class="flex w-full {flexDirection} items-center gap-2 py-1">
	<!-- CONTENT as Button or Div -->
	{#if onclick !== undefined && variant !== 'skeleton'}
		<div
			class={cn(
				'grid w-full cursor-pointer items-center justify-items-start gap-x-1 gap-y-0.5 rounded-lg p-1 hover:bg-obsidian-500/10',
				gridLayout,
				className
			)}
			role="button"
			{onclick}
			{...restProps}
		>
			{@render content()}
		</div>
	{:else}
		<div
			class={cn(
				'grid w-full items-center justify-items-start gap-x-1 gap-y-0.5 p-1',
				gridLayout,
				className
			)}
			{...restProps}
		>
			{@render content()}
		</div>
	{/if}

	<!-- HANDLE -->
	{#if handle && variant !== 'skeleton'}
		{@const clickFunc = typeof handle === 'function' ? handle : handle.click ?? (() => {})}
		{@const handleClass = typeof handle === 'function' ? '' : handle.class ?? ''}
		{@const handleVariant =
			typeof handle === 'function' ? 'destructive' : handle.variant ?? 'destructive'}
		{@const handleIcon = typeof handle === 'function' ? 'mdi:remove' : handle.icon ?? 'mdi:remove'}
		{@const baseClass =
			typeof handle === 'object' && handle?.extended
				? 'w-8 h-8'
				: 'not-hover:w-4! not-hover:p-0! not-hover:text-transparent hover:w-8 hover:text-white'}
		<Button class={cn('h-8', baseClass, handleClass)} variant={handleVariant} onclick={clickFunc}>
			<Icon icon={handleIcon} />
		</Button>
	{/if}
</div>
