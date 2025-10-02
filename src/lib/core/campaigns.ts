// IMPORTS
import { type Prefixed_UUID, generatePrefixedUUID } from '$lib/utils/uuid';
import { availableGameSystems } from '$lib/system/gameSystems';

// CHARACTER CLASS
export class Campaign {
	id: Prefixed_UUID<'campaign'>;
	name: string;
	user_ids: Prefixed_UUID<'user'>[];
	description?: string;
	system: (typeof availableGameSystems)[number];

	constructor(
		user_ids: Prefixed_UUID<'user'>,
		system: (typeof availableGameSystems)[number],
		name?: string
	) {
		this.id = generatePrefixedUUID('campaign');
		this.user_ids = [];
		this.system = system;
		this.name = name ?? 'New Campaign';
	}
}
