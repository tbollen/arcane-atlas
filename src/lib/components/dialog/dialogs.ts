import { dialogService as ds, type Option } from './dialogService';

class Dialog {
	static confirm(message?: string): Promise<boolean> {
		const _msg: string = message || 'Are you sure?';
		const options: Option[] = [
			{ name: 'Yes', response: true },
			{ name: 'No', response: false }
		];
		return new Promise(async (resolve) => {
			try {
				const response = await ds.open(_msg, options);
				resolve(response === true); // Resolve with true if 'Yes' is clicked
			} catch {
				resolve(false); // Resolve with false if dialog is dismissed or an error occurs
			}
		});
	}

	static alert(message: string, content: any = null): Promise<any> {
		return new Promise(async (resolve) => {
			try {
				const response = await ds.open(message, [], content);
				resolve(response);
			} catch {
				resolve(null); // Handle error gracefully
			}
		});
	}

	static choose(options: Option[] | string[], message: string = 'Pick an option'): Promise<any> {
		// Check if options is an array of strings
		const _options =
			Array.isArray(options) && typeof options[0] === 'string'
				? options.map((opt) => ({ name: opt, response: opt })) // Generate options from strings
				: options; // Use provided options directly

		return new Promise(async (resolve) => {
			try {
				const response = await ds.open(message, _options as Option[]);
				resolve(response);
			} catch {
				resolve(null); // Handle error gracefully
			}
		});
	}

	// Other dialog methods can be added here
}

export default Dialog;
