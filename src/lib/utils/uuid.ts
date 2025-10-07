// UUID Type
export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type Prefixed_UUID<TPrefix extends UUID = UUID> = `${TPrefix}:${UUID}`;

// UUID Generation Functions
export function generatePrefixedUUID<TPrefix extends UUID>(
	prefix: TPrefix
): Prefixed_UUID<TPrefix> {
	const uuid = crypto.randomUUID();
	return `${prefix}:${uuid}` as Prefixed_UUID<TPrefix>;
}

export function generateUUID(): string {
	return crypto.randomUUID();
}
