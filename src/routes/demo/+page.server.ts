console.error('Server file loaded!');

import type { Actions } from './$types';

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		console.log(formData);
		return { success: true };
	}
} satisfies Actions;

export const load = () => {
	return {};
};
