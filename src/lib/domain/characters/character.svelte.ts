// IMPORTS
import { generatePrefixedUUID } from '$lib/utils/uuid';
import {
	type Character as PrismaCharacter,
	type User as PrismaUser,
	type Campaign as PrismaCampaign,
	type card as PrismaCard
} from '@prisma/client';
import { type CharacterMechanics, GENERIC_KEY } from '$lib/gameSystems';

// ID Shorthands
import type { UserID, CampaignID, CharacterID, CardID } from '..';

// TYPES
type System = keyof CharacterMechanics;

// unset
const unsetCampaign = 'unassigned' as const;
type UnsetCampaign = typeof unsetCampaign;

// Permission types
type CharacterPermissions = {
	viewers: UserID[];
};

type ClientCharacterPermissions = {
	canView: boolean;
};

// RELATIONAL FIELDS for PRISMA
type PrismaCharacterExtension = {
	owner: PrismaUser;
	editors: PrismaUser[];
	viewers: PrismaUser[];
	campaigns: PrismaCampaign[];
	cards: PrismaCard[];
};
export type PrismaCharacterExtended = PrismaCharacter & PrismaCharacterExtension;

// CHARACTER CLASS
class Character {
	// Basic Info
	name: string = $state('New Character');
	subtitle?: string = $state(undefined);
	description?: string = $state(undefined);
	imageUrl: string = $state(`https://robohash.org/${this.name}`);

	// DB info
	createdAt: Date = new Date();
	updatedAt: Date = $state(new Date());

	// Mechanics
	systems: System[] = $state([]);
	mechanics: CharacterMechanics = $state({ [GENERIC_KEY]: {} });

	constructor(init?: Partial<PrismaCharacter>) {
		this.name = init?.name ?? this.name;
		this.subtitle = init?.subtitle;
		this.description = init?.description;
		this.imageUrl = init?.image ?? this.imageUrl;

		this.mechanics = (init?.mechanics as CharacterMechanics) ?? { [GENERIC_KEY]: {} };
		this.systems = Object.keys(this.mechanics) as System[];
	}
}

export class StoredCharacter extends Character {
	// Datastore info
	id: CharacterID;
	ownerId: UserID;

	// Relations
	campaignIds: CampaignID[] | UnsetCampaign;
	cardIds: CardID[] = $state([]);

	// Permissions (for client)
	private permissions: CharacterPermissions;
	clientPermissions: ClientCharacterPermissions;
	public: boolean;

	/////////////////
	// CONSTRUCTOR //
	/////////////////
	constructor(init: {
		id: CharacterID;
		data?: Partial<PrismaCharacter>;
		ownerId: UserID;
		clientUserId?: UserID;
		campaignIds?: CampaignID[];
		permissions?: CharacterPermissions;
		public?: boolean;
	}) {
		super(init.data);
		this.id = init.id;
		this.campaignIds = init?.campaignIds ?? unsetCampaign;

		// SET PERMISSIONS
		this.public = init?.public ?? false;
		this.ownerId = init.ownerId;
		const checkPermssions = init.permissions !== undefined && init.permissions.viewers.length > 0;
		const fallbackPermissions = { viewers: [this.ownerId] };
		this.permissions = checkPermssions
			? init.permissions ?? fallbackPermissions
			: { viewers: [this.ownerId] };
		this.clientPermissions = {
			canView:
				init.clientUserId !== undefined && this.permissions.viewers.includes(init?.clientUserId)
		};
	}

	////////////////////////
	// END OF CONSTRUCTOR //
	////////////////////////

	static fromPrisma(init: {
		character: PrismaCharacterExtended;
		user?: PrismaUser;
		campaigns?: PrismaCampaign[];
	}): StoredCharacter {
		return new StoredCharacter({
			id: init.character.id as CharacterID,
			data: init.character,
			ownerId: init.character.ownerId as UserID,
			clientUserId: init.user ? (init.user.id as UserID) : undefined,
			campaignIds:
				init.campaigns !== undefined ? init.campaigns.map((c) => c.id as CampaignID) : [],
			permissions: {
				viewers: init.character.viewers.map((viewer) => viewer.id as UserID)
			},
			public: init.character.public
		});
	}

	public toPrisma(): PrismaCharacter {
		const _character = this;
		return {
			// DB Info
			id: _character.id,
			createdAt: _character.createdAt,
			updatedAt: _character.updatedAt,

			// Owner
			ownerId: _character.ownerId,

			// Sharing and Permissions
			public: _character.public,

			// Character Info
			name: _character.name,
			subtitle: _character?.subtitle ?? '',
			description: _character.description ?? '',
			image: _character.imageUrl,
			mechanics: _character.mechanics
		};
	}
}
