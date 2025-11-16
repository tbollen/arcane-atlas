import { type Prefixed_UUID } from '$lib/utils/uuid';

// ID shorthands

type UserID = Prefixed_UUID<'user'>;
type CharacterID = Prefixed_UUID<'character'>;
type CardID = Prefixed_UUID<'card'>;
type CampaignID = Prefixed_UUID<'campaign'>;

export type { UserID, CharacterID, CardID, CampaignID };
