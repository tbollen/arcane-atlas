<script lang="ts">
	let {
		children
	}: {
		children?: import('svelte').Snippet;
	} = $props();
</script>

<div class="min-h-2 w-full bg-obsidian-800 text-sm text-weave-50">
	{#if children}
		{@render children()}
	{:else}
		<br />
	{/if}
</div>
