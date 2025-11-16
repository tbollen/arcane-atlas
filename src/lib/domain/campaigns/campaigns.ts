// IMPORTS
import { type Prefixed_UUID, generatePrefixedUUID } from '$lib/utils/uuid';
import { gameSystems } from '$lib/gameSystems/';
import type { UserID, CampaignID, CharacterID, CardID } from '..';

// CHARACTER CLASS
export class Campaign {
	id: CampaignID;
	name: string;
	user_ids: UserID[];
	description?: string;
	system: keyof typeof gameSystems;

	constructor(user_ids: UserID, system: keyof typeof gameSystems, name?: string) {
		this.id = generatePrefixedUUID('campaign');
		this.user_ids = [];
		this.system = system;
		this.name = name ?? 'New Campaign';
	}
}
