<script lang="ts">
	import Icon from '@iconify/svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';

	let {
		children,
		icon = 'mdi:information'
	}: {
		children?: import('svelte').Snippet;
		icon?: string;
	} = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger>
			<Icon {icon} />
		</Tooltip.Trigger>
		<Tooltip.Content>{children?.()}</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
