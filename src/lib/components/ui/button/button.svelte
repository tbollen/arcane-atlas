<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';
	import Spinner from '../spinner/spinner.svelte';
	import {
		type SpinnerComponent,
		spinner as spinnerStore
	} from '$lib/stores/loadingSpinner.svelte';

	// Import Tooltip
	import * as Tooltip from '$lib/components/ui/tooltip';

	const standardDisabledClasses =
		'opacity-40 cursor-not-allowed active:scale-100';

	const disabledVariant = {
		default: `${standardDisabledClasses} outline hover:bg-secondary`,
		blossom: `${standardDisabledClasses} hover:bg-blossom-700`,
		bold: `${standardDisabledClasses} hover:bg-obsidian-900`,
		advanced: `${standardDisabledClasses} hover:bg-weave-500`,
		destructive: `${standardDisabledClasses} hover:bg-threat-500`,
		success: `${standardDisabledClasses} hover:bg-success-500`,
		outline: `${standardDisabledClasses} hover:bg-background border`,
		secondary: `${standardDisabledClasses} outline  hover:bg-secondary`,
		ghost: `${standardDisabledClasses} outline hover:bg-transparent`,
		link: `${standardDisabledClasses} hover:no-underline`
	};

	export const buttonVariants = tv({
		base: " cursor-pointer shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:ring-[3px] [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variants: {
			variant: {
				default: 'bg-secondary text-secondary-foreground hover:bg-obsidian-200 active:scale-95',
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
			},
			disabled: disabledVariant
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export const tooltipVariants = tv({
		variants: {
			variant: {
				default: 'bg-secondary text-secondary-foreground',
				blossom: 'bg-blossom-700 text-primary-foreground',
				bold: 'bg-obsidian-900 text-primary-foreground',
				advanced: 'bg-weave-500 text-primary-foreground',
				destructive: 'bg-threat-500 text-white',
				success: 'bg-success-500 text-white',
				outline: 'bg-background text-foreground border',
				secondary: 'bg-secondary text-secondary-foreground',
				ghost: 'bg-accent text-accent-foreground',
				link: 'bg-transparent text-primary underline-offset-4'
			}
		},
		defaultVariants: {
			variant: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
			spinner?: SpinnerComponent;
			tooltip?: string;
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
		spinner = undefined,
		tooltip,
		children,
		...restProps
	}: ButtonProps = $props();

	// Spinner stuff
	let isLoading: boolean | undefined = $derived(
		spinner && spinnerStore.isLoading && spinner.id == spinnerStore.id
	);
	let isDisabled: boolean | undefined = $derived(disabled || (isLoading && !spinner?.keepEnabled));
</script>

{#snippet Button()}
	{#if href}
		       <a
			       bind:this={ref}
			       data-slot="button"
				   class={cn(buttonVariants({ variant, size, disabled: isDisabled ? variant : undefined }), className)}
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
				   class={cn(buttonVariants({ variant, size, disabled: isDisabled ? variant : undefined }), className)}
			       {type}
			       disabled={isDisabled}
			       {...restProps}
		       >
			       {#if isLoading}
				       <Spinner />
				       {#if spinner?.keepMessage}
					       {@render children?.()}
				       {:else}
					       {spinnerStore.message}
				       {/if}
			       {:else}
				       {@render children?.()}
			       {/if}
		       </button>
	{/if}
{/snippet}

{#if tooltip}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{@render Button()}
			</Tooltip.Trigger>
			<Tooltip.Content
				arrowClasses={cn(tooltipVariants({ variant }))}
				class={cn(tooltipVariants({ variant }))}>{tooltip}</Tooltip.Content
			>
		</Tooltip.Root>
	</Tooltip.Provider>
{:else}
	{@render Button()}
{/if}
