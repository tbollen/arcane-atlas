// Utils
import { type Prefixed_UUID, generatePrefixedUUID } from '$lib/utils/uuid';
import { clone } from '$lib/utils/serializing';
import { checkWebStorage, lsk } from '$lib/utils/storage/keys';

// Prisma Schema Types
import { type card as PrismaCard } from '@prisma/client';
import { type User as PrismaUser } from '@prisma/client';
import { type Character as PrismaCharacter } from '@prisma/client';

import { Card } from '$lib/domain/cards/card.svelte';

// Import defaults
import { defaultTemplates } from '$lib/domain/cards/defaultTemplates';

// Shorthand for prefixed UUIDs
import type { UserID } from '$lib/domain/users/user';
import type { CharacterID } from '$lib/domain/characters/character';
export type CardID = Prefixed_UUID<'card'>;

// TODO: Find way to load dynamically

type PrismaCardExtension = {
	owner: PrismaUser;
	editors: PrismaUser[];
	viewers: PrismaUser[];
	characters: PrismaCharacter[];
};
export type PrismaCardExtended = PrismaCard & PrismaCardExtension;

// Permissions Types
export type CardPermissions = {
	editors: UserID[];
	viewers: UserID[];
};

export type ClientCardPermission = {
	canEdit: boolean;
	canView: boolean;
};

// Context Key
export const CARD_CONTEXT_KEY: string = 'db_cardStore' as const;

// StoredCard Class (Card with ID)
export class StoredCard extends Card {
	// DB Info
	id: CardID;

	// Sharing and Permissions (for client)
	ownerId: UserID;
	private permissions: CardPermissions; // For owner to get/set
	clientPermission: ClientCardPermission; // "Public" properties that all clients can see
	public: boolean;

	// Relation to active character (re-init when chaning characters)
	isCharacterCard: boolean;

	constructor(init: {
		id: CardID | 'new';
		ownerId: UserID;
		// Client info, for setting/checking permissions
		clientUserID?: UserID;
		// Optional properties
		cardInfo?: Partial<Card> | PrismaCard;
		// Queried data
		permissions?: CardPermissions; // only for owner
		isCharacterCard?: boolean; // only for play deck
		public?: boolean;
	}) {
		// Init info on card
		super(init.cardInfo);
		// Set ID
		this.id = init.id === 'new' ? (init.id = generatePrefixedUUID('card')) : init.id;
		// Set sharing and permissions (or set defaults)
		this.ownerId = init.ownerId;
		this.permissions = init.permissions ?? {
			editors: [this.ownerId],
			viewers: [this.ownerId]
		};

		// Set client permissions based on current user (given on init). If no user is given, give no permissions (guests can view)
		this.public = init?.public ?? false;
		this.clientPermission = {
			canEdit:
				init.clientUserID !== undefined && this.permissions.editors.includes(init.clientUserID),
			canView:
				init.clientUserID !== undefined && this.permissions.viewers.includes(init.clientUserID)
		};

		// Set if belongs to active character
		this.isCharacterCard = init.isCharacterCard ?? false;
	}

	/**
	 * Create a new StoredCard instance
	 * @param {UserID} userId - owner of the card
	 * @param {Partial<Card>} [cardInfo] - optional card info to set
	 * @returns {StoredCard} - new StoredCard instance
	 */
	static newCard(userId: UserID, cardInfo?: Partial<Card>): StoredCard {
		return new StoredCard({ id: 'new', ownerId: userId, clientUserID: userId, cardInfo });
	}
	static newCardFromPrisma(c: {
		card: PrismaCardExtended;
		user?: PrismaUser;
		character?: PrismaCharacter;
	}): StoredCard {
		// user: PrismaUser): StoredCard {
		return new StoredCard({
			id: c.card.id as CardID,
			ownerId: c.card.ownerId as UserID,
			cardInfo: c.card,
			permissions: {
				editors: c.card.editors.map((editor) => editor.id as UserID),
				viewers: c.card.viewers.map((viewer) => viewer.id as UserID)
			},
			clientUserID: c.user ? (c.user.id as UserID) : undefined,
			isCharacterCard:
				c.character !== undefined &&
				c.card.characters.some(
					(registeredCharacters) => registeredCharacters.id === c.character?.id
				),
			public: c.card.public
		});
	}

	public cardToPrisma(): PrismaCard {
		const _card = this;
		return {
			// DB Info
			id: _card.id,
			ownerId: _card.ownerId,
			createdAt: _card.createdAt,
			updatedAt: _card.updatedAt,
			// Sharing and Permissions
			public: _card.public,
			// Card Info
			name: _card.name,
			type: _card.type,
			subtitle: _card.subtitle ?? '',
			icon: _card.icon ?? '',
			description: _card.description,
			image: _card.image,
			stylePreset: _card.stylePreset,
			style: _card.style,
			systems: _card.systems,
			mechanics: _card.mechanics
		};
	}
}

/////////////////////
// CardStore Class //
/////////////////////
export class CardStore {
	cards: StoredCard[] = $state([]);
	templates: Card[] = $state(defaultTemplates);
	private idSet: Set<CardID> = $state(new Set());

	constructor(c: { cards: StoredCard[]; templates?: Card[] }) {
		// Set cards and templates
		this.cards = c.cards;
		this.templates = c.templates ?? defaultTemplates;

		// Make the idSet (overwrite whatever was there before)
		this.idSet = new Set(this.cards.map((card) => card.id));
		// After init, cache the store
		this.cache();
	}

	// Convert JSON to StoredCards
	// static fromJSON(json: JSON): CardStore {
	// 	const _obj = Object(json); //Convert to object first
	// 	const _cards = Object.hasOwn(_obj, 'cards') ? _obj.cards : [];
	// 	const _storedCards = _cards.map((card) => new StoredCard(card));
	// 	const _templates = Object.hasOwn(_obj, 'templates') ? _obj.templates : [];
	// 	return new CardStore({ cards: _cards, templates: _templates });
	// }

	///////////////////
	// GET Functions //
	///////////////////

	// Get Card from local Store
	getCard(_target: CardID | string | StoredCard): StoredCard {
		if (_target instanceof StoredCard) return _target; // If it's already a StoredCard, return it
		const _card = this.cards.find((card) => card.id.toString() == _target.toString());
		if (!_card) throw new Error(`Card with ID ${_target} not found in store!`);
		return _card;
	}

	getCardId(_card: StoredCard): CardID {
		if (!this.idSet.has(_card.id)) throw new Error(`Card with ID ${_card.id} not found in store!`);
		return this.getCard(_card).id;
	}

	///////////////////
	// SET Functions //
	///////////////////

	// Setting / updating properties of a specific card
	setCard(_id: CardID, cardUpdate: Partial<StoredCard>): StoredCard {
		// Run PUT
		const updatedCard = this.PUT(_id, cardUpdate);
		// Save changes
		this.cache();
		// Return the updated card (for optional further processing)
		return updatedCard;
	}

	//////////////////
	// DB Functions //
	//////////////////

	serialize(): JSON {
		const _serializedCards: JSON = clone(
			this.cards.map((card) => {
				return serializeCard(card);
			})
		);
		const _serializedTemplates: JSON = clone(
			this.templates.map((template) => {
				return serializeCard(template);
			})
		);

		const _serializedStore = clone({
			cards: _serializedCards,
			templates: _serializedTemplates
		});

		return _serializedStore;
	}

	// Prepare for Prisma (MAPPING!!)
	cardToPrisma(id: CardID): PrismaCard {
		const _card = this.getCard(id);
		return _card.cardToPrisma();
	}

	/////////////////////
	// Store Functions //
	/////////////////////

	// Creating a new card
	addNew({ userId, card }: { userId: UserID; card?: Partial<Card> }): StoredCard {
		// Run POST
		const newCard = this.POST(userId, card);
		// Save changes
		this.cache();
		// Return the new card (for optional further processing)
		return newCard;
	}

	////////////////
	// PERMISSION //
	////////////////

	getPermissions(_id: CardID, userId: UserID) {}

	////////////
	// Saving //
	////////////

	/**
	 * Save the current state of the item store to session storage.
	 * This function is asynchronous and will return a promise that resolves when the save is complete.
	 */
	async cache() {
		const _stringifiedStore = JSON.stringify(this.serialize());
		// Save to local storage, once it's ready
		if (await checkWebStorage()) {
			localStorage.setItem(lsk.cardStore, _stringifiedStore);
		}
	}

	async save() {
		await this.cache();
		console.debug('Saving to session storage. Key:', lsk.cardStore);
		await this.saveToDB();
		console.debug('Saved to database.');
	}

	async saveToDB() {
		const _stringifiedStore = JSON.stringify(this.serialize());
		// TODO
	}

	// Removing a card
	destroy(input: CardID | CardID[]): void {
		const _ids: CardID[] = Array.isArray(input) ? input : [input];
		const nameArray = _ids.map((id) => this.getCard(id).name);
		if (!window.confirm(`Are you sure you want to delete ${nameArray.join(', ')}?`)) return;
		if (_ids.length > 1) {
			// If multiple cards are deleted, ask if really want to delete them all
			if (!window.confirm(`Are you really sure? Multiple cards will be deleted!`)) return;
		}
		_ids.forEach((id) => this.DELETE(id));
		// Save Changes
		this.cache();
	}
	///////////////////////
	// Private Functions //
	///////////////////////
	private returnUniqueId(): CardID {
		let newId: CardID;
		// Create a new ID until it's unique
		do {
			newId = generatePrefixedUUID('card');
		} while (this.idSet.has(newId));
		return newId;
	}

	// Private SUDO functions
	// Includes API calls for DB manipulation

	// DELETE A CARD (reference by ID)
	private DELETE(_id: CardID) {
		let _idSet = this.idSet;
		let _cards = this.cards;
		if (this.cards.length < 2) {
			alert('Cannot destroy last card');
			throw new Error('Cannot destroy last card');
		}
		try {
			// Remove card from Cards
			const _targetCard = this.getCard(_id);
			_cards = _cards.filter((card) => card.id !== _targetCard.id); //Filter out the deleted card
			// Update idSet
			if (!_idSet.has(_id)) return console.error(`ID (${_id}) not found in idSet`);
			_idSet.delete(_id);
			// Update Cards
			this.cards = _cards;
			this.idSet = _idSet;
		} catch (error) {
			// If card not found, re-throw error
			console.error(error);
		}
	}

	// CREATE A NEW CARD
	private POST(userId: UserID, card?: Partial<Card>): StoredCard {
		// Create a new ID
		const newId = this.returnUniqueId();
		// Instantiate a new card
		const newCard = new StoredCard({
			id: newId,
			ownerId: userId,
			clientUserID: userId,
			cardInfo: card
		});
		// Add the new card to the store
		this.cards = [...this.cards, newCard];
		// Update the idSet
		this.idSet.add(newId);
		// Return the new card (for optional further processing)
		return newCard;
	}

	// UPDATE A CARD (reference by ID)
	private PUT(_id: CardID, cardUpdate: Partial<Card>): StoredCard {
		let _card: StoredCard;
		try {
			_card = this.getCard(_id); // Check if the card exists
		} catch (error) {
			throw error;
		}
		// Create an updated card
		// FIX: check if this works!
		const updatedCard = Object.assign(_card, cardUpdate);
		// Update the cards array
		const newCards = this.cards.map((card) => (card.id == _id ? updatedCard : card));
		this.cards = newCards;
		// Return the updated card (for optional further processing)
		return updatedCard;
	}
}

// SERIALIZING FOR CARDS
type JSONifiedCardObject = Record<keyof PrismaCard, JSON>;
export function serializeCard(card: StoredCard | Partial<StoredCard>): JSONifiedCardObject {
	// NOTE: serialization does not handle card permissions, these need to be set separately via the card API
	const json: JSONifiedCardObject = {
		// DB Info
		id: clone(card?.id),
		createdAt: clone(card.createdAt),
		updatedAt: clone(card.updatedAt),
		// Sharing and Permissions
		ownerId: clone(card.ownerId),
		public: clone(card.public),
		// Card Info
		name: clone(card.name),
		type: clone(card.type),
		subtitle: clone(card.subtitle),
		icon: clone(card.icon),
		description: clone(card.description),
		image: clone(card.image),
		stylePreset: clone(card.stylePreset),
		style: clone(card.style),
		systems: clone(card.systems),
		mechanics: clone(card.mechanics)
	};
	return Object(clone(json));
}
