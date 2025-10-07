/**
 * Clone a given object by serializing and deserializing it.
 * This ensures a deep copy of the object, rather than a shallow copy.
 * Converts udnefined to null
 * @param {any} data - The object to clone.
 * @returns {JSON} - The cloned object.
 */
export function clone(data: any): JSON {
	const stringified = JSON.stringify(data == undefined ? null : data);
	const parsed = JSON.parse(stringified);
	return parsed;
}
