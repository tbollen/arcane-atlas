<script lang="ts">
	import Icon, { iconExists } from '@iconify/svelte';
	import { slide } from 'svelte/transition';

	export let disabled: boolean = false;
	export let click: () => void = () => {};
	export let icon: string | undefined = undefined;
	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let iconClick: undefined | (() => void) = undefined;
	export let placement: 'left' | 'right' = 'left';
	export let stateOn: boolean = true;
	export let color: 'plain' | 'blossom' | 'weave' | 'threat' | 'success' = 'blossom';
	export let variant: 'filled' | 'outlined' | 'flipped' | 'contrast-outlined' = 'filled';
	export let disableTransition: boolean = false;
	export let hideSlotOnHover: boolean = false;
	export let hideSlot: boolean = false;
	export let stopPropagation: boolean = false;

	let isHovering: boolean = false;

	$: clickFunc = !disabled ? click : () => {};
</script>

<button
	on:click|stopPropagation={stopPropagation ? () => {} : clickFunc}
	on:click|stopPropagation={!stopPropagation ? () => {} : clickFunc}
	class="coreButton {color} {variant} {placement} {size}"
	class:disableTransition
	class:stateOff={!stateOn}
	class:noGap={!$$slots.default || !icon}
	{disabled}
	on:mouseenter={() => (isHovering = true)}
	on:mouseleave={() => (isHovering = false)}
>
	<!-- Icon -->
	<div class="icon">
		{#if icon && iconExists(icon) && typeof iconClick === 'function' && iconClick}
			<button on:click|stopPropagation={iconClick} {disabled} class="iconButton">
				<Icon {icon} />
			</button>
		{:else if icon && iconExists(icon)}
			<Icon {icon} />
		{:else if icon}
			<Icon {icon} />
		{/if}
	</div>
	<!-- Slot -->
	{#if (($$slots.default && hideSlotOnHover && isHovering) || !hideSlotOnHover) && !hideSlot}
		<span class:slot={hideSlotOnHover} transition:slide={{ axis: 'x', duration: 200 }}>
			<slot />
		</span>
	{/if}
</button>

<style>
	.coreButton {
		/* Reset ugly defaults */
		all: unset;
		/* Layout */
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--padding);
		/* Sizing */
		box-sizing: border-box;
		/* Size */
		width: fit-content;
		/* Pratical */
		cursor: pointer;
		/* Font */
		font-family: 'Gotham', sans-serif;
		font-size: 10pt;
		font-weight: 500;
		/* Styling */
		padding: var(--padding);
		border-radius: var(--border-radius);

		/* Transition */
		transition: all 0.2s ease-in-out;
	}

	.coreButton:focus-visible {
		outline: 2px solid var(--color-text-0);
	}

	.noGap {
		gap: 0;
	}

	.slot {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100px;
	}

	.small {
		font-size: 9pt;
		padding: 0.35em;
	}

	.right {
		flex-direction: row-reverse;
	}

	.icon {
		font-size: 1.3em;
		line-height: 0em;
	}

	.iconButton {
		all: unset;
		cursor: pointer;
	}

	.disableTransition {
		transition: none;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Style Variants */

	/* Filled */

	.filled,
	.flipped {
		background-color: var(--main-color);
		color: var(--contrast-color);
	}

	.filled:hover,
	.flipped:hover,
	.contrast-outlined:hover {
		background-color: var(--highlight-color);
		color: var(--contrast-color);
	}

	.filled.stateOff {
		background-color: var(--neutral-color);
		color: var(--main-color);
		box-sizing: border-box;
	}

	.flipped.stateOff {
		color: var(--highlight-color);
		background-color: var(--neutral-color);
	}

	/* Outlined */

	.outlined,
	.contrast-outlined {
		border: 2px solid var(--main-color);
		color: var(--highlight-color);
		background-color: var(--neutral-color);
	}

	.outlined:hover {
		background-color: var(--neutral-color);
		color: var(--highlight-color);
		border-color: var(--highlight-color);
		box-shadow: 0px 0px 3px color-mix(in srgb, transparent 20%, var(--highlight-color) 80%);
	}

	.outlined.stateOff {
		background-color: var(--neutral-color);
		border: 2px solid var(--neutral-color);
		color: var(--main-color);
	}
	/* Color Variants */

	.plain {
		--main-color: var(--color-surface-4);
		--highlight-color: var(--color-text-1);
		--contrast-color: var(--color-text-0);
		--neutral-color: var(--color-text-4);
	}

	.blossom {
		--main-color: var(--color-blossom-2);
		--highlight-color: var(--color-blossom-1);
		--contrast-color: white;
		--neutral-color: var(--color-blossom-4);
	}

	.weave {
		--main-color: var(--color-weave-3);
		--highlight-color: var(--color-weave-2);
		--contrast-color: white;
		--neutral-color: var(--color-weave-4);
	}

	.threat {
		--main-color: var(--color-threat-3);
		--highlight-color: var(--color-threat-2);
		--contrast-color: white;
		--neutral-color: var(--color-threat-4);
	}

	.success {
		--main-color: var(--color-success-3);
		--highlight-color: var(--color-success-2);
		--contrast-color: white;
		--neutral-color: var(--color-success-4);
	}
</style>
