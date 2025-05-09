<script lang="ts">
	import { fly } from 'svelte/transition';
	import Button from '$lib/components/coreComponents/Button.svelte';
	import { type Option } from './dialogService';

	// Define the props
	export let message: string = '';
	export let options: Option[] = [];
	export let close: (response: any) => void; // Add close as a prop
	export let slot: any;

	let dialog: HTMLDialogElement;

	$: if (dialog) dialog.showModal();

	function dismiss() {
		close(null); // Pass null or a default value
	}

	// Handle option clicks
	function handleOption(option: { name: string; response: any }) {
		close(option.response);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:click|self={dismiss} transition:fly>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<section id="head">
			<span class="message">{message}</span>
			<div class="closeButton">
				<Button click={dismiss} color="threat" icon="mdi:close" />
			</div>
		</section>

		<!-- Slot content -->
		{#if slot}
			<div id="slot-container">
				<slot><span id="dialogSlot">{slot}</span></slot>
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
