<script lang="ts">
	import { Button, type ButtonProps } from '$lib/components/ui/button';
	import Icon from '@iconify/svelte';

	let { class: className, variant = 'bold', ...restProps }: ButtonProps = $props();
</script>

<Button
	class={className}
	href="https://github.com/tbollen/arcane-atlas"
	target="_blank"
	{variant}
	{...restProps}
	><Icon icon="mdi:github" />
	Github
</Button>
