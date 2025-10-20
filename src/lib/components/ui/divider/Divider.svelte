<script lang="ts" module>
	import { cn } from '$lib/utils.js';

	export type DividerProps = {
		class?: string;
		text?: string;
		restProps?: any;
	};
</script>

<script lang="ts">
	let { class: className, text = '', ...restProps }: DividerProps = $props();
</script>

{#if text}
	<div class={cn('my-4 flex flex-row items-center', className)} {...restProps}>
		<hr class="flex-grow" />
		<span class="px-4 text-sm text-muted-foreground">{text}</span>
		<hr class="flex-grow" />
	</div>
{:else}
	<div class={cn('divider my-4', className)} {...restProps}>
		<hr />
	</div>
{/if}
