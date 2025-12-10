<script lang="ts">
	let {
		children
	}: {
		children?: import('svelte').Snippet;
	} = $props();
</script>

<div class="h-fit min-h-6 flex-grow overflow-y-auto px-2">
	{@render children?.()}
</div>
