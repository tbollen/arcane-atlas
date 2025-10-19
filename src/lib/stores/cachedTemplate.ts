import { Card } from '$lib/domain/cards/card.svelte';
let _cachedTemplate: Partial<Card> | undefined;

const cachedTemplate = {
	template: _cachedTemplate,
	set(value: Partial<Card>) {
		this.template = value;
	},
	get() {
		return this.template;
	}
};

export default cachedTemplate;
