<script lang="ts">
	import { Button, type ButtonVariant } from '$lib/components/ui/button/';
	import Icon, { iconExists } from '@iconify/svelte';

	// Types and Utils
	import type { WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type Div = WithElementRef<HTMLAttributes<HTMLDivElement>>;
	type ClassedString = string | { text: string; class: Div['class'] };

	type ListItemProps<T> = Div & {
		// specifiy item for typing and functions
		item?: T;
		// Item click
		onItemClick?: () => void;
		// Content
		icon?: string | import('svelte').Snippet;
		mainText: ClassedString | import('svelte').Snippet;
		subText?: ClassedString | import('svelte').Snippet;
		// Handle (object with info or plain function, using defaults)
		handle?:
			| {
					click: () => void;
					class?: Div['class'];
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
		if (typeof icon === 'string' && iconExists(icon as string)) return icon;
		return null;
	});
	let hasIcon = $derived(validIcon !== null || (icon !== undefined && typeof icon === 'function'));

	// Derived grid layout
	let gridLayout = $derived(`
        ${icon !== undefined ? 'grid-cols-[auto_1fr]' : 'grid-cols-[1fr]'}
        ${subText ? 'grid-rows-[auto_auto]' : 'grid-rows-[auto]'}
        `);

	let flexDirection = $derived(
		handle && typeof handle !== 'function' && handle.left ? 'flex-row-reverse' : 'flex-row'
	);
</script>

{#snippet content()}
	<!-- ICON, either as a string or as a snippet -->
	<div class="row-span-2 {hasIcon ? 'p-2' : ''}">
		{#if validIcon}
			<Icon icon={validIcon} class="h-6 w-6" />
		{:else if icon && typeof icon === 'function'}
			{@render icon()}
		{/if}
	</div>

	<!-- MAIN Text, either as a string or as a snippet -->
	{#if typeof mainText === 'function'}
		{@render mainText()}
	{:else if mainText !== undefined}
		{@const text = typeof mainText === 'string' ? mainText : mainText.text}
		{@const textClass = typeof mainText === 'object' ? mainText.class : ''}
		<p
			class="{textClass}
            {subText ? '' : 'row-span-2 '}
            w-full max-w-full
            overflow-hidden text-left leading-tight
            font-semibold overflow-ellipsis whitespace-nowrap"
		>
			{text}
		</p>
	{/if}

	<!-- SUB Text, either as a string or as a snippet -->
	{#if typeof subText === 'function'}
		{@render subText()}
	{:else if subText !== undefined}
		{@const text = typeof subText === 'string' ? subText : subText.text}
		{@const textClass = typeof subText === 'object' ? subText.class : ''}
		<p
			class="{textClass} max-w-full overflow-hidden text-left text-sm overflow-ellipsis whitespace-nowrap text-muted-foreground"
		>
			{text}
		</p>
	{/if}
{/snippet}

<div class="flex w-full {flexDirection} items-center gap-2 py-1">
	<!-- CONTENT as Button or Div -->
	{#if onItemClick !== undefined}
		<button
			class="
            grid {gridLayout} w-full cursor-pointer items-center
            justify-items-start gap-x-1 rounded-md hover:bg-obsidian-500/10
            "
			onclick={onItemClick}
		>
			{@render content()}
		</button>
	{:else}
		<div
			class="
            grid {gridLayout} w-full items-center justify-items-start
            gap-x-1
            "
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
			class="
            not-hover:w-4!
            not-hover:p-0!
            not-hover:text-transparent
            hover:w-8
            hover:text-white
            "
			variant={handleVariant}
			onclick={clickFunc}
		>
			<Icon icon={handleIcon} />
		</Button>
	{/if}
</div>
