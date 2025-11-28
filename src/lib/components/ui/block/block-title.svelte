<script lang="ts">
	let {
		children,
		title
	}: {
		title?: string;
		children?: import('svelte').Snippet;
	} = $props();
</script>

<div
	class="flex flex-row items-center bg-obsidian-800 px-3 py-1 font-semibold text-weave-50 uppercase"
>
	{#if title}
		<p class="flex-grow">{title}</p>
	{/if}
	{@render children?.()}
</div>
