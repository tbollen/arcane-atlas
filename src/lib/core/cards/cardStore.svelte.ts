// Utils
import { type Prefixed_UUID, generatePrefixedUUID } from '$lib/utils/uuid';
import { clone } from '$lib/utils/serializing';
import { checkWebStorage, lsk } from '$lib/utils/storage/keys';

// Prisma Schema Types
import { type card as PrismaCard } from '@prisma/client';

import { Card } from '$lib/core/cards/card.svelte';
// import type { Card as PrismaCard } from '@prisma/client';

// Import defaults
import { defaultTemplates } from '$lib/core/cards/defaultTemplates';

// Shorthand for card id
export type CardID = Prefixed_UUID<'card'>;

export const CARD_CONTEXT_KEY: string = 'db_cardStore' as const;

// StoredCard Class (Card with ID)
export class StoredCard extends Card {
	id: CardID;

	constructor(id: CardID | 'new', card?: Partial<Card> | PrismaCard) {
		super(card);
		if (id === 'new') id = generatePrefixedUUID('card');
		this.id = id;
	}

	public cardToPrisma(): PrismaCard {
		const _card = this;
		return {
			id: _card.id,
			creatorId: _card.creatorId ?? '',
			createdAt: _card.createdAt,
			updatedAt: _card.updatedAt,
			userIds: _card.userIds,
			campaignIds: _card.campaignIds,
			characterIds: _card.characterIds,
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
// ItemStore Class //
/////////////////////
export class CardStore {
	cards: StoredCard[] = $state([]);
	templates: Partial<Card>[] = $state(defaultTemplates);
	private idSet: Set<CardID> = $state(new Set());

	constructor(
		init: {
			json?: JSON;
			prisma?: PrismaCard[];
			multiStore?: CardStore[];
			store?: CardStore;
			cards?: StoredCard[];
			templates?: Partial<Card>[];
		} = {}
	) {
		// If The cards from the Prisma DB are given, use that
		if (init.prisma) {
			this.cards = init.prisma.map((card) => new StoredCard(card.id as CardID, card));
		}
		// If an exisiting store is given,
		if (init.json) {
			const _obj = Object(init.json);
			const _cards = Object.hasOwn(_obj, 'cards') ? _obj.cards : [];
			const _templates = Object.hasOwn(_obj, 'templates') ? _obj.templates : [];
			this.cards = _cards.map(
				(card: StoredCard) => new StoredCard(card.id ? card.id : this.returnUniqueId(), card) // If the card has an ID, use it, otherwise generate a new one
			);
			this.templates = _templates;
		}
		if (init.multiStore) {
			// Merge all stores together
			init.multiStore.forEach((store) => {
				this.cards = [...this.cards, ...store.cards];
				this.templates = [...this.templates, ...store.templates];
			});
		} else if (init.store) {
			// Override all other values
			init.cards = init.store.cards;
			init.templates = init.store.templates;
		}

		// Create items from given items
		const _cardsToOVerwrite = init.cards
			? init.cards.map((card) => new StoredCard(card.id, card)) // If cards are given, create StoredCards from this data
			: []; // If no cards are given, create a default card with a unique ID
		_cardsToOVerwrite.forEach((card) => {
			if (!this.idSet.has(card.id)) {
				this.POST(card); // If the card doesn't exist, add it
			} else {
				this.PUT(card.id, card); // If the card does exist, update it
			}
		});
		if (this.cards.length === 0) {
			// If no cards are given, add a default card
			console.debug('No cards given in initialization of the card store; adding default card');
			this.POST();
		}

		// Same for templates
		const _templatesToOverwrite = init.templates
			? init.templates.map((template) => new Card(template))
			: [];
		_templatesToOverwrite.forEach((template) => [...this.templates, template]); //Add no matter what, duplicates are allowed!

		// Make the idSet (overwrite whatever was there before)
		this.idSet = new Set(this.cards.map((item) => item.id));
		// After init, cache the store
		this.cache();
	}

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
	addNew(card?: Partial<Card>): StoredCard {
		// Run POST
		const newCard = this.POST(card);
		// Save changes
		this.cache();
		// Return the new card (for optional further processing)
		return newCard;
	}

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
	destroy(_id: CardID | CardID[]): void {
		if (!Array.isArray(_id)) id: _id = [_id];
		const nameArray = _id.map((id) => this.getCard(id).name);
		if (!window.confirm(`Are you sure you want to delete ${nameArray.join(', ')}?`)) return;
		if (_id.length > 1) {
			// If multiple items are deleted, ask if really want to delete them all
			if (!window.confirm(`Are you really sure? Multiple items will be deleted!`)) return;
		}
		_id.forEach((id) => this.DELETE(id));
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
			alert('Cannot destroy last item');
			throw new Error('Cannot destroy last item');
		}
		try {
			// Remove card from Cards
			const _targetCard = this.getCard(_id);
			_cards = _cards.filter((item) => item.id !== _targetCard.id); //Filter out the deleted card
			// Update idSet
			if (!_idSet.has(_id)) return console.error(`ID (${_id}) not found in idSet`);
			_idSet.delete(_id);
			// Update Items
			this.cards = _cards;
			this.idSet = _idSet;
		} catch (error) {
			// If item not found, re-throw error
			console.error(error);
		}
	}

	// CREATE A NEW CARD
	private POST(card?: Partial<Card>): StoredCard {
		// Create a new ID
		const newId = this.returnUniqueId();
		// Instantiate a new card
		const newCard = new StoredCard(newId, card);
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
		const updatedCard = new StoredCard(_card.id, { ..._card, ...serializeCard(cardUpdate) });
		// Update the cards array
		const newCards = this.cards.map((card) => (card.id == _id ? updatedCard : card));
		this.cards = newCards;
		// Return the updated card (for optional further processing)
		return updatedCard;
	}
}

// SERIALIZING FOR CARDS
export function serializeCard(card: StoredCard | Partial<StoredCard>): Object {
	const obj = clone({
		id: clone(card?.id),
		creatorId: clone(card.creatorId),
		createdAt: clone(card.createdAt),
		updatedAt: clone(card.updatedAt),
		userIds: clone(card.userIds),
		campaignIds: clone(card.campaignIds),
		characterIds: clone(card.characterIds),
		name: clone(card.name),
		type: clone(card.type),
		subtitle: clone(card.subtitle),
		icon: clone(card.icon),
		description: clone(card.description),
		image: clone(card.image),
		stylePreset: clone(card.stylePreset),
		style: clone(card.style),
		mechanics: clone(card.mechanics)
	});
	return obj;
}
