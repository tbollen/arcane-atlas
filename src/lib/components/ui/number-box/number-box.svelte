<script lang="ts">
	// UI Components
	import Icon from '@iconify/svelte';
	import { Button, type ButtonVariant } from '$lib/components/ui/button';

	// Tailwind
	import { cn } from '$lib/utils';

	// Props
	type Variant = 'line' | 'box';

	let {
		label = undefined,
		value = $bindable(),
		min = -100,
		max = 100,
		step = 1,
		variant = 'line',
		onIncrease = () => {
			value += step;
		},
		onDecrease = () => {
			value -= step;
		},
		customValue,
		buttonVariant = 'bold',
		disabled = false
	}: {
		label?:
			| string
			| {
					text: string;
					class?: string;
			  };
		value: number;
		min?: number;
		max?: number;
		step?: number;
		variant?: Variant;
		onIncrease?: () => void;
		onDecrease?: () => void;
		customValue?: import('svelte').Snippet<[number]>;
		buttonVariant?: ButtonVariant;
		disabled?:
			| {
					increase?: boolean;
					decrease?: boolean;
					all?: boolean;
			  }
			| boolean;
	} = $props();

	// SHORTHANDS
	let decreaseDisabled: boolean = $derived.by(() => {
		let isAtMinimum = value <= min;
		if (disabled === undefined) return isAtMinimum;
		if (typeof disabled === 'boolean' && disabled) return disabled;
		if (typeof disabled === 'object' && typeof disabled.decrease === 'boolean')
			return disabled.decrease;
		return isAtMinimum;
	});
	let increaseDisabled: boolean = $derived.by(() => {
		let isAtMaximum = value >= max;
		if (disabled === undefined) return isAtMaximum;
		if (typeof disabled === 'boolean' && disabled) return disabled;
		if (typeof disabled === 'object' && typeof disabled.increase === 'boolean')
			return disabled.increase;
		return isAtMaximum;
	});
</script>

{#if variant === 'box'}
	<!-- Box variant -->
	<div class="flex flex-col gap-0.5">
		<!-- LABEL -->
		{#if label}
			{@const text = typeof label === 'string' ? label : label.text}
			{@const className = typeof label === 'string' ? '' : label.class ?? ''}
			<p class={cn('text-center font-semibold', className)}>{text}</p>
		{/if}

		<!-- VALUE -->
		{#if customValue}
			{@render customValue(value)}
		{:else}
			<div class="col-span-full rounded-lg bg-obsidian-200 py-3 text-center text-xl">
				{value}
			</div>
		{/if}
		<!-- BUTTONS -->
		<div class="grid grid-cols-2 gap-2">
			<!-- DECREASE BUTTON -->
			<Button
				class="w-full"
				variant={buttonVariant}
				onclick={onDecrease}
				disabled={decreaseDisabled}
			>
				<Icon icon="mdi:minus" />
			</Button>
			<!-- INCREASE BUTTON -->
			<Button
				class="w-full"
				variant={buttonVariant}
				onclick={onIncrease}
				disabled={increaseDisabled}
			>
				<Icon icon="mdi:plus" />
			</Button>
		</div>
	</div>
{:else}
	<!-- Line variant (default) -->
	<div class="flex w-max items-center gap-2">
		<!-- LABEL -->
		{#if label}
			{@const text = typeof label === 'string' ? label : label.text}
			{@const className = typeof label === 'string' ? '' : label.class ?? ''}
			<span class={cn('font-semibold', className)}>{text}</span>
		{/if}
		<Button variant={buttonVariant} onclick={onDecrease} disabled={decreaseDisabled}>
			<Icon icon="mdi:minus" />
		</Button>
		<!-- VALUE -->
		{#if customValue}
			{@render customValue(value)}
		{:else}
			<div
				class="flex h-8 w-14 items-center justify-center border-t-2 border-b-2 border-obsidian-500/20 px-3"
			>
				{value}
			</div>
		{/if}
		<!-- INCREASE BUTTON -->
		<Button variant={buttonVariant} onclick={onIncrease} disabled={increaseDisabled}>
			<Icon icon="mdi:plus" />
		</Button>
	</div>
{/if}
