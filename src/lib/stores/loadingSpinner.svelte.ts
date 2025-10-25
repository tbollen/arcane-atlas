class Spinner {
	message: string | undefined = $state();
	isLoading: boolean = $state(false);
	id: string | 'full' | undefined = $state();

	set(msg: string, id?: string | 'full') {
		if (id) this.id = id;
		this.isLoading = true;
		this.message = msg;
	}

	complete() {
		this.id = undefined;
		this.isLoading = false;
		this.message = undefined;
	}
}
export const spinner = new Spinner();
