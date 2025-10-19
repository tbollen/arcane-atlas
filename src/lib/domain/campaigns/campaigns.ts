// IMPORTS
import { type Prefixed_UUID, generatePrefixedUUID } from '$lib/utils/uuid';
import { gameSystems } from '$lib/gameSystems/';
import type { keyof } from 'better-auth';

// CHARACTER CLASS
export class Campaign {
	id: Prefixed_UUID<'campaign'>;
	name: string;
	user_ids: Prefixed_UUID<'user'>[];
	description?: string;
	system: keyof typeof gameSystems;

	constructor(user_ids: Prefixed_UUID<'user'>, system: keyof typeof gameSystems, name?: string) {
		this.id = generatePrefixedUUID('campaign');
		this.user_ids = [];
		this.system = system;
		this.name = name ?? 'New Campaign';
	}
}
