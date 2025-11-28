import { toast, type ToastOptions } from 'svelte-sonner';

/** Options for verbose feedback
 * @param successMessage Message to show on successful execution
 * @param showError Whether to show error messages
 * @param debugOnly Whether to log only in debug mode
 * @param errorAsType The type of error message to show ('error', 'warning', 'info', 'message')
 * @param errorMessage Custom error message to show
 * @param logToConsole Whether to log messages to the console
 * @param toastOptions Additional options for the toast notifications
 */
type VerboseOptions = {
	successMessage?: string;
	showError?: boolean;
	debugOnly?: boolean;
	errorAsType?: 'error' | 'warning' | 'info' | 'message';
	errorMessage?: string;
	logToConsole?: boolean;
	toastOptions?: ToastOptions;
};

const defaultVerboseOptions: VerboseOptions = {
	showError: true,
	debugOnly: false,
	errorAsType: 'error',
	errorMessage: 'An error occurred',
	logToConsole: true,
	toastOptions: {}
};

/**
 * Executes a function with verbose feedback including toasts and console logs.
 * @param fn The function to execute
 * @param options Configuration options for verbose feedback
 * @returns The result of the executed function
 * @throws Rethrows any error encountered during function execution
 */
export function verbose<T>(fn: () => T, options: Partial<VerboseOptions> = {}): T {
	// Merge default options with provided options
	options = { ...defaultVerboseOptions, ...options };

	// Execute the function with verbose feedback
	try {
		const result = fn();

		// Toasts a success message if provided
		if (options?.successMessage) {
			toast.success(options.successMessage, options.toastOptions);
		}

		// Logs success to console if enabled
		if (options?.logToConsole && options?.successMessage) {
			if (options?.debugOnly) console.debug('[verbose] Success:', options.successMessage);
			else console.log('[verbose] Success:', options.successMessage);
		}

		// Return the result of the function
		return result;
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : String(error);
		const fullErrorMessage = options?.errorMessage ?? errorMsg;

		// Toasts an error message if enabled
		if (options?.showError) {
			if (options?.errorAsType === 'warning')
				toast.warning(fullErrorMessage, options?.toastOptions);
			else if (options?.errorAsType === 'info') toast.info(fullErrorMessage, options?.toastOptions);
			else if (options?.errorAsType === 'message')
				toast.message(fullErrorMessage, options?.toastOptions);
			else toast.error(fullErrorMessage, options.toastOptions);
		}

		// Logs error to console if enabled
		if (options?.logToConsole) {
			if (options?.errorAsType === 'warning') console.warn('[verbose] Warning:', error);
			else if (options?.errorAsType === 'info') console.info('[verbose] Info:', error);
			else if (options?.errorAsType === 'message') console.log('[verbose] Message:', error);
			else console.error('[verbose] Error:', error);
		}

		// Rethrows the error
		throw error;
	}
}
