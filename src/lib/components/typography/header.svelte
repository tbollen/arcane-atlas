<script module lang="ts">
	import { type VariantProps, tv } from 'tailwind-variants';

	export const headingVariants = tv({
		base: '',
		variants: {
			variant: {
				// h1: 'text-balanced scroll-m-20 text-4xl font-extrabold tracking-tight',
				h1: 'mt-12 scroll-m-20 text-4xl font-semibold tracking-tight transition-colors first:mt-0',
				h2: 'mt-10 scroll-m-20 text-2xl font-semibold tracking-tight transition-colors first:mt-0',
				h3: 'mt-8 scroll-m-20 text-lg font-semibold tracking-tight transition-colors first:mt-0',
				h4: 'scroll-m-20 text-md font-semibold tracking-tight',
				// SUBTEXTS
				subtitle: 'text-muted-foreground text-xl leading-7 mb-4 inline-block'
			},
			addition: {
				indented: 'pl-6',
				divider: 'border-b pb-2',
				none: '',
				asFirst: 'mt-0'
			}
		},
		defaultVariants: {
			variant: 'h1',
			type: 'none'
		}
	});

	export type HeadingVariant = VariantProps<typeof headingVariants>['variant'];
	export type HeadingType = VariantProps<typeof headingVariants>['addition'];
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils';

	let {
		ref = $bindable(null),
		children,
		variant,
		addition = 'none',
		tag,
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLHeadingElement>> & {
		tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
		variant?: HeadingVariant;
		addition?: HeadingType;
	} = $props();

	const htmlTag = tag || (variant !== 'subtitle' ? variant : 'p');
</script>

<svelte:element
	this={htmlTag}
	bind:this={ref}
	data-slot={variant}
	class={cn(headingVariants({ variant, addition }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
