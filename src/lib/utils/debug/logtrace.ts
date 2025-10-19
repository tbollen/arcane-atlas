export function logTrace(msg: string) {
	console.debug(`CARD_API call: ${msg}`);
	console.trace();
}
