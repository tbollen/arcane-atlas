<script lang="ts">
	import { cn } from '$lib/utils.js';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import type { ComponentProps } from 'svelte';

	import ArcaneA from '$static/icons/Arcane-A.svg';

	type Variant = 'default' | 'A-Spinner' | 'A-Triplet' | 'Knight';

	type Props = ComponentProps<typeof Loader2Icon> & {
		variant?: Variant;
	};

	// Tailwind class variants
	let classVariants: Record<Variant, string> = {
		default: '',
		'A-Spinner': ' drop-shadow-[6px_6px_0px_rgba(0,0,0,0.25)] drop-shadow-threat-500',
		'A-Triplet': ' drop-shadow-[6px_6px_0px_rgba(0,0,0,0.25)] drop-shadow-threat-500',
		Knight: 'text-white'
	};

	let { class: className, variant = 'default', ...restProps }: Props = $props();

	// TIMING for dots
	let dotCycle: number = $state(0);
	setInterval(() => {
		dotCycle = (dotCycle + 1) % 4;
	}, 500);
</script>

{#if variant === 'default'}
	<Loader2Icon
		role="status"
		aria-label="Loading"
		class={cn('animate-spin', classVariants[variant], className)}
		{...restProps}
	/>
{:else if variant === 'Knight'}
	<img
		src="/animations/sprite-knight-slash--nobg.gif"
		alt="Loading"
		role="status"
		class="{cn(variant, classVariants[variant], className)} size-24 scale-200 object-cover"
	/>
	<p
		class=" font-mono text-2xl {cn(
			variant,
			classVariants[variant],
			className
		)} mt-2 size-auto border-t-2 pt-2"
	>
		<span>Loading</span>{#each { length: 3 } as _, i}<span
				class="inline-block w-2 text-center font-mono text-inherit"
				>{#if i < dotCycle % 4}.{/if}</span
			>{/each}
	</p>
{:else}
	{@render ArcaneA(variant)}
{/if}

{#snippet ArcaneA(variant: Variant, addedClass?: typeof className)}
	<img
		src="/icons/Arcane-A.svg"
		alt="Loading"
		role="status"
		class={cn(variant, classVariants[variant], addedClass, className)}
	/>
{/snippet}

<style>
	.A-Spinner {
		animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0s infinite normal none;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
