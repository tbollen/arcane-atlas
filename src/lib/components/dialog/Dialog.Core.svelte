<script lang="ts">
	import { run, self, createBubbler, stopPropagation } from 'svelte/legacy';

	const bubble = createBubbler();
	import { fly } from 'svelte/transition';
	import Button from '$lib/components/coreComponents/Button.svelte';
	import { type Option } from './dialogService';

	// Define the props
	interface Props {
		message?: string;
		options?: Option[];
		close: (response: any) => void;
		slot: any;
		children?: import('svelte').Snippet;
	}

	let {
		message = '',
		options = [],
		close,
		slot,
		children
	}: Props = $props();

	let dialog: HTMLDialogElement = $state();

	run(() => {
		if (dialog) dialog.showModal();
	});

	function dismiss() {
		close(null); // Pass null or a default value
	}

	// Handle option clicks
	function handleOption(option: { name: string; response: any }) {
		close(option.response);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialog} onclick={self(dismiss)} transition:fly>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div onclick={stopPropagation(bubble('click'))}>
		<section id="head">
			<span class="message">{message}</span>
			<div class="closeButton">
				<Button click={dismiss} color="threat" icon="mdi:close" />
			</div>
		</section>

		<!-- Slot content -->
		{#if slot}
			<div id="slot-container">
				{#if children}{@render children()}{:else}<span id="dialogSlot">{slot}</span>{/if}
			</div>
		{/if}

		<div id="options" class="buttons">
			{#each options as option}
				<Button icon={option.icon} click={() => handleOption(option)}>{option.name}</Button>
			{/each}
		</div>
	</div>
</dialog>

<style>
	/* Dialog Styles */
	dialog {
		max-width: 32em;
		min-width: 16em;
		border-radius: var(--border-radius);
		border: none;
		padding: 0;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* HEAD */
	#head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 10px;
	}

	#head > .closeButton {
		margin-left: auto;
	}

	/* OPTIONS */
	.buttons {
		display: flex;
		justify-content: center;
		gap: 8px;
	}
</style>
