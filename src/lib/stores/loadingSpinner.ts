export const spinner: {
	set: (msg: string) => void;
	complete: () => void;
	message: string | undefined;
	isLoading: boolean;
} = {
	set(msg: string) {
		this.isLoading = true;
		this.message = msg;
	},
	complete() {
		this.isLoading = false;
		this.message = undefined;
	},
	message: '',
	isLoading: false
};
