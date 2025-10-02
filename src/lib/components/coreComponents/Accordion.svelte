<script>
	// Imports
	import { slide } from 'svelte/transition';

	// Components
	import Icon from '@iconify/svelte';
	/** @type {{open?: boolean, icon?: string, head?: import('svelte').Snippet<[any]>, content?: import('svelte').Snippet}} */
	let {
		open = $bindable(false),
		icon = 'mdi:chevron-down',
		head,
		content
	} = $props();

	// Functions
	const handleClick = () => (open = !open);
</script>

<div class="accordion" class:open>
	<button class="header" class:open onclick={handleClick}>
		{@render head?.({ class: "accordionHead", })}
		<div class="icon" class:open>
			<Icon {icon} />
		</div>
	</button>

	<div class="contentWrapper" class:open>
		<div class="content" transition:slide>
			{@render content?.()}
		</div>
	</div>
</div>

<style>
	.accordion {
		/* Sizing & Layout */
		width: 100%;
		box-sizing: border-box;
		/*  Props */
		--border-radius: 0.3rem;
		border-radius: var(--border-radius);
		overflow: hidden;
	}

	button {
		all: unset;
		cursor: pointer;
	}

	.header {
		display: flex;
		box-sizing: border-box;
		width: 100%;
		justify-content: space-between;
		/* Styling */
		padding: 0.3em;
		border-radius: var(--border-radius);
		/* Text */
		font-weight: 600;
	}

	.header:hover {
		background-color: var(--color-weave-4);
	}

	.header.open {
		transition-delay: 0s;
		background-color: var(--color-weave-3);
		color: var(--color-surface-4);
	}

	.icon {
		display: flex;
		justify-content: center;
		align-self: center;
		font-size: 1.2em;
	}

	.icon.open {
		transform: rotate(180deg);
	}

	.content {
		/* Sizing */
		box-sizing: border-box;
		/* Styling */
		padding: 1rem;
	}
	.contentWrapper {
		/* Collapsing */
		max-height: 0;
		transition: all 0.6s ease-in-out;
	}

	.contentWrapper.open {
		max-height: 300vh;
	}
</style>
