// Keys to use for local storage
export const lsk = {
	cardStore: 'cardStore',
	user: 'user',
	activeCharacter: 'activeCharacter'
};

// Keys to use for session storage
export const ssk = {
	currentCard: 'currentCard'
};

export async function checkWebStorage(): Promise<boolean> {
	// Check if we're running in a browser environment and localStorage is available
	if (typeof window === 'undefined' || !window.localStorage || !window.sessionStorage) {
		await new Promise((resolve) => {
			const interval = setInterval(() => {
				// Wait until window and localStorage are both available
				if (typeof window !== 'undefined' && window.localStorage && window.sessionStorage) {
					clearInterval(interval);
					resolve(true);
				}
			}, 100);
		});
		return true; // localStorage is now initialized
	}
	return true; // localStorage is already initialized
}
