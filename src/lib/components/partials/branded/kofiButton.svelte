<script lang="ts">
	import { Button, type ButtonProps } from '$lib/components/ui/button';

	let { class: className, variant = 'bold', ...restProps }: ButtonProps = $props();
</script>

<Button
	class={className}
	href="https://ko-fi.com/S6S51NH1R7"
	target="_blank"
	{variant}
	{...restProps}
	><img
		src="https://storage.ko-fi.com/cdn/cup-border.png"
		alt="Support me on Ko-fi!"
		class="h-11/12"
	/>
	Support me on Ko-fi!
</Button>
