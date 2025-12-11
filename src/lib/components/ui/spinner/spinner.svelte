<script lang="ts">
	import { cn } from '$lib/utils.js';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import type { ComponentProps } from 'svelte';

	import ArcaneA from '$static/icons/Arcane-A.svg';

	type Variant = 'default' | 'A-Spinner' | 'A-Triplet';

	type Props = ComponentProps<typeof Loader2Icon> & {
		variant?: Variant;
	};

	// Tailwind class variants
	let classVariants: Record<Variant, string> = {
		default: 'size-24',
		'A-Spinner': 'size-24 drop-shadow-[6px_6px_0px_rgba(0,0,0,0.25)] drop-shadow-threat-500',
		'A-Triplet': 'size-24 drop-shadow-[6px_6px_0px_rgba(0,0,0,0.25)] drop-shadow-threat-500'
	};

	let { class: className, variant = 'default', ...restProps }: Props = $props();
</script>

{#if variant === 'default'}
	<Loader2Icon
		role="status"
		aria-label="Loading"
		class={cn('animate-spin', classVariants[variant], className)}
		{...restProps}
	/>
{:else}
	{@render ArcaneA(variant)}
{/if}

{#snippet ArcaneA(variant: Variant, addedClass?: typeof className)}
	<img
		src="/icons/Arcane-A.svg"
		alt="Loading"
		role="status"
		class={cn(variant, classVariants[variant], addedClass)}
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
