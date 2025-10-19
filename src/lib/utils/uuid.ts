// UUID Type
export type UUID = typeof crypto.randomUUID extends () => infer TUUID ? TUUID : string;
export type Prefixed_UUID<TPrefix extends string = UUID> = `${TPrefix}:${UUID}`;

// UUID Generation Functions
export function generatePrefixedUUID<TPrefix extends string>(
	prefix: TPrefix
): Prefixed_UUID<TPrefix> {
	return `${prefix}:${crypto.randomUUID()}` as Prefixed_UUID<TPrefix>;
}

export function generateUUID(): string {
	return crypto.randomUUID();
}
