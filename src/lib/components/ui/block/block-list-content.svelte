<script lang="ts">
	let {
		children
	}: {
		children?: import('svelte').Snippet;
	} = $props();
</script>

<div
	class="flex h-fit min-h-6 flex-grow
flex-col gap-0 overflow-y-auto px-2 text-sm [&>*]:py-2 [&>*:not(:first-child)]:border-t-2"
>
	{@render children?.()}
</div>
