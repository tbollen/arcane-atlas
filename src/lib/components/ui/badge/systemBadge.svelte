<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { gameSystems, AR_KEY, GENERIC_KEY } from '$lib/gameSystems';
	import Badge from './badge.svelte';

	type System = keyof typeof gameSystems;

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = 'default',
		children,
		gameSystem,
		...restProps
	}: ComponentProps<typeof Badge> & { gameSystem: System } = $props();

	// TAILWIND CLASSES FOR SYSTEMS
	const systemClasses: Record<System, string> = {
		[AR_KEY]: 'bg-weave-500 text-white',
		[GENERIC_KEY]: 'bg-slate-300 text-slate-950'
	};

	const tailwindClass = systemClasses[gameSystem] || systemClasses[GENERIC_KEY];
</script>

<Badge bind:ref {href} class="{tailwindClass} {className}" {...restProps}>
	{#if children}
		{@render children?.()}
	{:else}
		{gameSystems[gameSystem].name}
	{/if}
</Badge>
