<script lang="ts">
	import Icon from '@iconify/svelte';
	import type { WithElementRef } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	// Accept class and rest props
	let {
		ref = $bindable(null),
		children,
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLHeadingElement>> = $props();
</script>

<div class="w-full">
	<div
		class="relative overflow-hidden rounded-xl text-foreground"
		aria-hidden="false"
		role="status"
		title="Under construction"
	>
		<div class="constructionLines flex flex-row items-center justify-center gap-4 text-4xl">
			<Icon icon="roentgen:crane-portal" />
			<h1 class="text-xl">Under Construction</h1>
			<Icon icon="mdi:wrench" />
		</div>
		{#if children}
			<hr />
			<div class="bg-obsidian-500/5 p-2">
				{@render children?.()}
			</div>
			<hr class="constructionLines" />
		{/if}
	</div>
</div>

<style>
	.constructionLines {
		background: repeating-linear-gradient(135deg, #fbbf2455 0 18px, transparent 18px 36px);
		padding: 0.5rem;
	}
</style>
