// UUID Type (with prefix)
export type Prefixed_UUID<TPrefix extends string = string> = `${TPrefix}:${string}`;

// UUID Generation Functions
export function generatePrefixedUUID<TPrefix extends string>(
	prefix: TPrefix
): Prefixed_UUID<TPrefix> {
	const uuid = crypto.randomUUID();
	return `${prefix}:${uuid}` as Prefixed_UUID<TPrefix>;
}

export function generateUUID(): string {
	return crypto.randomUUID();
}
