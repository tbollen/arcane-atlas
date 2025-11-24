<script lang="ts">
	let {
		children,
		borderBoxSize = $bindable()
	}: {
		children?: import('svelte').Snippet;
		borderBoxSize?: ResizeObserverSize[];
	} = $props();
</script>

<div bind:borderBoxSize class="flex h-full w-full flex-col gap-1 bg-obsidian-500/5">
	{@render children?.()}
</div>
