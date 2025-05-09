// Import the type from lib/types (hacky but works)
import { type ImageAttribution } from '$lib/types/imageAttribution';

export const imageAttributionList: ImageAttribution[] = [
	{
		name: 'Pixel Art Village',
		fileUrl: 'cliff_village_background.png',
		webUrl: 'https://www.flickr.com/photos/deathhell/53711571492',
		creator: '紅色死神',
		date: new Date(2024, 4, 10),
		alt: 'Pixel Art Village',
		license: 'cc'
	}
];

export function getImageData(name: string): ImageAttribution {
	const image = imageAttributionList.find((image) => image.name === name);
	if (!image) {
		// Error on line where called: image does not exist in list
		throw new Error(`image with name '${name}' does not exist in list`);
	}
	return image;
}
