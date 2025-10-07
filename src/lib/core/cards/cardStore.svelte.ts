// Utils
import { type Prefixed_UUID, generatePrefixedUUID } from '$lib/utils/uuid';
import { clone } from '$lib/utils/serializing';
import { checkWebStorage, lsk } from '$lib/utils/storage/keys';

import { Card } from '$lib/core/cards/card.svelte';
// import type { Card as PrismaCard } from '@prisma/client';

// Import defaults
import { defaultTemplates } from '$lib/core/cards/defaultTemplates';

// Shorthand for card id
type CardID = Prefixed_UUID<'card'>;

// StoredCard Class (Card with ID)
export class StoredCard extends Card {
	id: CardID;

	constructor(id: CardID | 'new', card?: Partial<Card>) {
		super(card);
		if (id === 'new') id = generatePrefixedUUID('card');
		this.id = id;
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
			multiStore?: CardStore[];
			store?: CardStore;
			cards?: StoredCard[];
			templates?: Partial<Card>[];
		} = {}
	) {
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

	private PUT(_id: CardID, cardUpdate: Partial<Card>): StoredCard {
		try {
			this.getCard(_id); // Check if the card exists
		} catch (error) {
			throw error;
		}
		// Create an updated card
		const _card = this.getCard(_id);
		const updatedCard = new StoredCard(_card.id, { ..._card, ...cardUpdate });
		// Update the cards array
		this.cards = this.cards.map((card) => (card.id === _id ? updatedCard : card));
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

	private async addCardToDB(card: StoredCard) {
		// Push the new card to the database
		const response = fetch(`/api/cards`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(card)
		})
			.then((response) => response.json())
			.then((data) => {
				console.log(data);
			})
			.catch((error) => {
				console.error(error);
			});
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
	private DELETE(_id: CardID) {
		let _idSet = this.idSet;
		let _items = this.cards;
		if (this.cards.length < 2) {
			alert('Cannot destroy last item');
			throw new Error('Cannot destroy last item');
		}
		try {
			// Remove item from Items
			const _targetItem = this.getCard(_id);
			_items = _items.filter((item) => item.id !== _targetItem.id);
			// Update idSet
			if (!_idSet.has(_id)) return console.error(`ID (${_id}) not found in idSet`);
			_idSet.delete(_id);
			// Update Items
			this.cards = _items;
			this.idSet = _idSet;
		} catch (error) {
			// If item not found, re-throw error
			console.error(error);
		}
	}
}

// SERIALIZING FOR CARDS
export function serializeCard(card: StoredCard | Partial<StoredCard>): JSON {
	const json = clone({
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
	return json;
}
