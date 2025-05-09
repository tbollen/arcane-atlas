<script lang="ts">
	import { fly } from 'svelte/transition';
	import Button from './Button.svelte';

	// Props
	let show: boolean = false;
	export let message: string = '';
	export let options: { name: string; response: any }[] = [
		{ name: 'Ok', response: true },
		{ name: 'Cancel', response: false }
	];

	// Promises
	let resolvePromise: (value: any) => void;
	let rejectPromise: (reason: any) => void;

	// Open and close functions
	export function open(): Promise<any> {
		show = true;
		return new Promise((resolve, reject) => {
			resolvePromise = resolve;
			rejectPromise = reject;
		});
	}

	function closeDialog(response: any = null) {
		dialog.close();
		show = false;
		response !== null ? resolvePromise(response) : rejectPromise('Dialog closed');
	}

	let dialog: HTMLDialogElement;

	$: if (dialog && show) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:click|self={() => closeDialog(null)} transition:fly>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation>
		<section id="head">
			<span class="message">{message}</span>
			<div class="closeButton">
				<Button click={() => closeDialog(null)} color="threat" icon="mdi:close" />
			</div>
		</section>

		<div id="options" class="buttons">
			{#each options as option}
				<Button click={() => closeDialog(option.response)}>{option.name}</Button>
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
