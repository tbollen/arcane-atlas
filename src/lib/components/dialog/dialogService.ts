import { writable } from 'svelte/store';
import Dialog from './Dialog.Core.svelte';

export type Option = { name: string; response: any; icon?: string };

const { subscribe, set } = writable<{
	message: string;
	options: any[];
	slot?: any; // slot content
	close: (response: any) => void;
} | null>(null);

let dialogInstance: any = null; // Store the instance of the dialog component

function createDialog() {
	// Create a wrapper element for the dialog
	const wrapper = document.createElement('div');
	document.body.appendChild(wrapper);

	// Set up the dialog props
	const dialogProps = {
		message: '',
		options: [],
		slot: null,
		close: (response: any) => {
			closeDialog();
			resolvePromise(response); // Resolve the promise when closing
		}
	};

	// Instantiate the Dialog component
	dialogInstance = new Dialog({
		target: wrapper,
		props: dialogProps
	});

	// Clean up when the dialog is closed
	dialogInstance.$on('close', closeDialog);
	return wrapper;
}

let resolvePromise: (value: any) => void;

function open(message: string, options: Option[] = [], slot?: any): Promise<any> {
	if (!dialogInstance) {
		createDialog();
	}

	// Set the dialog properties
	dialogInstance.$set({ message, options, slot });

	return new Promise((resolve) => {
		resolvePromise = resolve; // Save the resolve function for later
		dialogInstance.$set({
			close: (response: any) => {
				closeDialog();
				resolve(response);
			}
		});
	});
}

function closeDialog() {
	if (dialogInstance) {
		dialogInstance.$destroy(); // Destroy the instance
		dialogInstance = null; // Reset the instance
	}
}

export const dialogService = {
	subscribe,
	open,
	close: closeDialog
};
