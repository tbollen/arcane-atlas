<script lang="ts">
	import { cn } from '$lib/utils';
	let { children, class: className, ...restProps } = $props();
</script>

<h1
	class={cn('text-balanced scroll-m-20 text-4xl font-extrabold tracking-tight', className)}
	{...restProps}
>
	{@render children?.()}
</h1>
