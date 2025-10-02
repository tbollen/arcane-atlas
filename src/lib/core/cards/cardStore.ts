// Basic Types
import { type Prefixed_UUID, generatePrefixedUUID } from '$lib/utils/uuid';

import { Card } from '$lib/core/cards/card';
// import type { Card as PrismaCard } from '@prisma/client';

// Shorthand for card id
type CardID = Prefixed_UUID<'card'>;

// StoredCard Class (Card with ID)
export class StoredCard extends Card {
	id: CardID;

	constructor(id: CardID, card?: Partial<Card>) {
		super(card);
		this.id = id;
	}
}

/////////////////////
// ItemStore Class //
/////////////////////
export class CardStore {
	cards: StoredCard[] = [];
	templates: Partial<Card>[] = [];
	private idSet: Set<CardID> = new Set();

	constructor(
		_: {
			multiStore?: CardStore[];
			store?: CardStore;
			cards?: StoredCard[];
			templates?: Partial<Card>[];
		} = {}
	) {
		// If an exisiting store is given,
		if (_.multiStore) {
			// Merge all stores together
			_.multiStore.forEach((store) => {
				this.cards = [...this.cards, ...store.cards];
				this.templates = [...this.templates, ...store.templates];
			});
		} else if (_.store) {
			// Override all other values
			_.cards = _.store.cards;
			_.templates = _.store.templates;
		}
		// Create items from given items (* instead of setting it, to support migrations)
		this.cards = _.cards ? _.cards.map((card) => new StoredCard(card.id, card)) : [];
		// Same for templates
		this.templates = _.templates ? _.templates.map((item) => new Card(item)) : [];

		// Make the idSet
		this.idSet = new Set(this.cards.map((item) => item.id));
	}

	///////////////////
	// GET Functions //
	///////////////////

	// Get Card from local Store
	getCard(_target: CardID | StoredCard): StoredCard {
		if (_target instanceof StoredCard) return _target; // If it's already a StoredCard, return it
		const _card = this.cards.find((card) => card.id.toString() === _target.toString());
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

	// Settintg / updating properties of a specific card
	setCard(_id: CardID, cardUpdate: Partial<StoredCard>): StoredCard {
		// Ensure the card exists
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
		// Save changes
		this.save();
		// Return the updated card (for optional further processing)
		return updatedCard;
	}

	//////////////////
	// DB Functions //
	//////////////////

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
		// Create a new ID
		const newId = this.returnUniqueId();
		// Instantiate a new card
		const newCard = new StoredCard(newId, card);
		// Add the new card to the store
		this.cards = [...this.cards, newCard];
		// Update the idSet
		this.idSet.add(newId);
		// Save changes
		this.save();
		// Return the new card (for optional further processing)
		return newCard;
	}

	// Saving
	save() {
		const _items = JSON.stringify(this.cards);
		// this.setLocalStorage(lsk.items, _items);
		// this.setLocalStorage(lsk.activeItem, JSON.stringify(this.getActiveItem().id));
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
		_id.forEach((id) => this.sudoDestroy(id));
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
	private sudoDestroy(_id: CardID) {
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
			// Save Changes
			this.save();
			window.location.reload();
		} catch (error) {
			// If item not found, re-throw error
			console.error(error);
		}
	}
}
