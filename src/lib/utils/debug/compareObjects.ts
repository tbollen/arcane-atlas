/**
 * compareObjects
 */
export function compareObjects(obj1: Record<any, any>, obj2: Record<any, any>): Record<any, any> {
	let diffs: Record<any, any> = {};
	for (const key in obj1) {
		if (obj1.hasOwnProperty(key)) {
			if (obj1[key] !== obj2[key]) {
				diffs[key] = { obj1: obj1[key], obj2: obj2[key] };
			}
		}
	}
	return diffs;
}
