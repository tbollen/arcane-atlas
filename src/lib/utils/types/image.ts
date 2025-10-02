// IMAGE TYPE
export type Image = {
	title: string; // Title of the image
	url: string; // Path or URL to actual image (local file or web URL)
	alt?: string; // Alternative text for the image
	caption?: string; // Optional caption for the image
	source?: string; // Source of the image
	license: 'cc' | 'free' | 'commercial' | 'personal' | 'unknown';
};
