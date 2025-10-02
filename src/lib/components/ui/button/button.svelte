<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';

	export const buttonVariants = tv({
		base: " cursor-pointer shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variants: {
			variant: {
				default: 'bg-secondary text-secondary-foreground hover:bg-obsidian-200/40 active:scale-95',
				blossom: 'bg-blossom-700 text-primary-foreground hover:bg-blossom-800 active:scale-95',
				bold: 'bg-obsidian-900 text-primary-foreground hover:bg-obsidian-800 active:scale-95',
				advanced: 'bg-weave-500 text-primary-foreground hover:bg-weave-600/90 active:scale-95',
				destructive:
					' bg-threat-500 hover:bg-threat-700/90 focus-visible:ring-threat-500/20 dark:focus-visible:ring-destructive/40 text-white active:scale-95',
				success:
					' bg-success-500  text-white hover:bg-success-600 focus-visible:ring-success-500/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 active:scale-95',
				outline:
					' bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border active:scale-95',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/40 active:scale-95',
				ghost:
					' hover:bg-accent shadow-none hover:text-accent-foreground dark:hover:bg-accent/50 active:scale-95',
				link: ' text-primary underline-offset-4 hover:underline shadow-none'
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
				xs: 'h-6 gap-1 rounded-md px-2 has-[>svg]:px-1.5 text-xs',
				lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
				icon: 'size-9'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}

<style>
	a.default,
	button.default {
		color: red !important;
	}
</style>
