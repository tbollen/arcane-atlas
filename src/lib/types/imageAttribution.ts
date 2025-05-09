// Set a type for attribution

export type ImageAttribution = {
	name: string;
	fileUrl: string; //Path or URL to actual image
	webUrl?: string; // URL to web page
	creator: string | 'unknown';
	date?: Date;
	alt?: string;
	license: 'cc' | 'free' | 'commercial' | 'personal' | 'unknown';
};
