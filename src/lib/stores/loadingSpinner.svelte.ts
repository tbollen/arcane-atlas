class Spinner {
	message: string | undefined = $state();
	isLoading: boolean = $state(false);

	set(msg: string) {
		this.isLoading = true;
		this.message = msg;
	}

	complete() {
		this.isLoading = false;
		this.message = undefined;
	}
}
export const spinner = new Spinner();
