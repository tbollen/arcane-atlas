// IMPORTS
import { generatePrefixedUUID } from '$lib/utils/uuid';
import {
	type Character as PrismaCharacter,
	type User as PrismaUser,
	type Campaign as PrismaCampaign,
	type card as PrismaCard
} from '@prisma/client';

// Game system stuff
import { characterMechanics, type CharacterMechanics, GENERIC_KEY } from '$lib/gameSystems';

// ID Shorthands
import type { UserID, CampaignID, CharacterID, CardID } from '..';

// TYPES
type System = keyof CharacterMechanics;

// unset
const unsetCampaign = 'unassigned' as const;
type UnsetCampaign = typeof unsetCampaign;

// Permission types
export type CharacterPermissions = {
	viewers: UserID[];
};

type ClientCharacterPermissions = {
	canView: boolean;
	isOwner: boolean;
};

// RELATIONAL FIELDS for PRISMA
type PrismaCharacterExtension = {
	owner: PrismaUser;
	viewers: PrismaUser[];
	campaigns: PrismaCampaign[];
	cards: PrismaCard[];
};
export type PrismaCharacterExtended = PrismaCharacter & PrismaCharacterExtension;

// CHARACTER CLASS
class Character {
	// Basic Info
	name: string = $state('New Character');
	subtitle: string = $state('Adventurer');
	description: string = $state('Character Description');
	imageUrl: string = $state(`https://robohash.org/${this.name}`);

	// DB info
	createdAt: Date = new Date();
	updatedAt: Date = $state(new Date());

	// Mechanics
	systems: System[] = $state([]);
	mechanics: CharacterMechanics = $state({ [GENERIC_KEY]: {} });

	constructor(init?: Partial<PrismaCharacter>) {
		this.name = init?.name ?? this.name;
		this.subtitle = init?.subtitle ?? this.subtitle;
		this.description = init?.description ?? this.description;
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
				init.clientUserId !== undefined && this.permissions.viewers.includes(init?.clientUserId),
			isOwner: this.ownerId == init.clientUserId
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

	public addSystem(system: System): StoredCharacter {
		if (this.systems.includes(system)) {
			throw new Error('System already exists');
		}
		this.systems = [...this.systems, system];
		this.mechanics = { ...this.mechanics, [system]: characterMechanics[system] };
		return this;
	}

	static new({ userId, data }: { userId: UserID; data?: Partial<Character> }): StoredCharacter {
		return new StoredCharacter({
			id: generatePrefixedUUID('character'),
			ownerId: userId,
			data
		});
	}
}

/////////////////////
// CHARACTER STORE //
/////////////////////
export class CharacterStore {
	characters: StoredCharacter[] = $state([]);
	private idSet: Set<CharacterID> = $state(new Set());

	constructor(init: { characters: StoredCharacter[]; ids: CharacterID[] }) {
		this.characters = init.characters;
		this.idSet = new Set(init.ids);
	}

	// HELPER functions //
	private returnUniqueId(): CharacterID {
		let newId: CharacterID;
		// Create a new ID until it's unique
		do {
			newId = generatePrefixedUUID('character');
		} while (this.idSet.has(newId));
		return newId;
	}

	// GET functions //

	getCharacter(_target: CharacterID | string | StoredCharacter): StoredCharacter {
		if (_target instanceof StoredCharacter) return _target;
		const _character = this.characters.find((c) => c.id.toString() == _target.toString());
		if (!_character) throw new Error(`Character with ID ${_target} not found in store!`);
		return _character;
	}

	// New character
	addNew({ userId, data }: { userId: UserID; data?: Partial<Character> }): StoredCharacter {
		// Create a new, unique ID
		const newId = this.returnUniqueId();
		// Instantiate a new character
		const newCharacter = new StoredCharacter({
			id: newId,
			ownerId: userId,
			data,
			clientUserId: userId
		});
		// TODO: add caching (but do we really need this?)
		// Add the new character to the store
		this.characters = [...this.characters, newCharacter];
		// Update the idSet
		this.idSet.add(newId);
		// return the new character (for optional further processing)
		return newCharacter;
	}

	// Edit/set character
	setCharacter(_target: CharacterID | string | StoredCharacter, data: Partial<Character>) {
		// Check if targeted character exists in store
		let _character: StoredCharacter;
		let _id: CharacterID;
		try {
			_character = this.getCharacter(_target);
			_id = _character.id;
		} catch (error) {
			throw error;
		}
		// Update character
		const updatedCharacter = Object.assign(_character, data);
		// Update store
		this.characters = this.characters.map((c) => (c.id == _character.id ? updatedCharacter : c));
		// Return updated character
		return _character;
	}

	// Delete character
	destroy(_id: CharacterID): void {
		let _character: StoredCharacter;
		// Check if targeted character exists in store
		try {
			_character = this.getCharacter(_id);
		} catch (error) {
			throw error;
		}
		// Confirm window
		if (!window.confirm(`Are you sure you want to delete ${_character.name}?`)) return;
		// Delete character from client Store
		this.characters = this.characters.filter((c) => c.id != _id);
	}
}
