<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes, HTMLLinkAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';
	import * as Tooltip from '$lib/components/ui/tooltip';

	export const buttonVariants = tv({
		base: " cursor-pointer focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variants: {
			variant: {
				default:
					'text-inherit hover:text-threat-500 transition-colors underline decoration-transparent hover:decoration-threat-500',
				accent:
					'text-threat-500 underline underline-offset-4 hover:text-threat-600 transition-colors hover:text-threat-700',
				subtle: 'text-foreground/70 hover:text-foreground transition-colors',
				bold: 'hover:bg-obsidian-800 hover:text-white px-1 py-0.5 rounded transition-colors',
				line: 'relative text-foreground no-underline after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-threat-500 after:transition-all after:duration-300 after:-translate-x-1/2 hover:after:w-full hover:after:left-0 hover:after:translate-x-0',
				marker:
					'relative text-foreground no-underline before:absolute before:bottom-0 before:left-0 before:h-full before:w-0 before:bg-threat-500 before:-z-10 before:transition-all before:duration-300 hover:before:w-full before:origin-left hover:before:origin-right hover:text-white hover:transition-[color] hover:delay-100'
			},
			display: {
				inline: 'inline-flex',
				block: 'flex w-full'
			}
		},
		defaultVariants: {
			variant: 'default',
			display: 'inline'
		}
	});

	export type LinkVariant = VariantProps<typeof buttonVariants>['variant'];
	export type LinkDisplay = VariantProps<typeof buttonVariants>['display'];

	export type LinkProps = WithElementRef<HTMLLinkAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: LinkVariant;
			display?: LinkDisplay;
			tooltip?: string | boolean;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = 'default',
		display = 'inline',
		ref = $bindable(null),
		href,
		tooltip,
		children,
		...restProps
	}: LinkProps = $props();
</script>

{#snippet link()}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, display }), className)}
		{href}
		{...restProps}
	>
		{@render children?.()}
	</a>
{/snippet}

{#if tooltip}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger class="cursor-help self-baseline">
				{@render link()}
			</Tooltip.Trigger>
			<Tooltip.Content>
				{#if typeof tooltip === 'string'}
					<p>{tooltip}</p>
				{:else}
					<p>Go to: <code>{href}</code></p>
				{/if}
			</Tooltip.Content>
		</Tooltip.Root>
	</Tooltip.Provider>
{:else}
	{@render link()}
{/if}
