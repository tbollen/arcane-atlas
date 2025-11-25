<script lang="ts">
	import Icon from '@iconify/svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';

	import type { HTMLAttributes } from 'svelte/elements';

	let {
		children,
		icon = 'mdi:information',
		class: className,
		tooltipClass,
		arrowClasses
	}: {
		children?: import('svelte').Snippet;
		icon?: string;
		class?: HTMLAttributes<HTMLDivElement>['class'];
		tooltipClass?: HTMLAttributes<HTMLDivElement>['class'];
		arrowClasses?: HTMLAttributes<HTMLDivElement>['class'];
	} = $props();
</script>

{#if children && children.length > 0}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger class="cursor-help {className}">
				<Icon {icon} />
			</Tooltip.Trigger>
			<Tooltip.Content
				class={tooltipClass}
				arrowClasses="{arrowClasses?.toString()} {tooltipClass?.toString()}"
				><div>{@render children()}</div></Tooltip.Content
			>
		</Tooltip.Root>
	</Tooltip.Provider>
{/if}
