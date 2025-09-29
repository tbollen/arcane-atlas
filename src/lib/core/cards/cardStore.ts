// Basic Types
import { type Prefixed_UUID, generatePrefixedUUID } from '$lib/utils/uuid';

import { Card } from './card';

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
	activeTemplate?: Partial<Card>;

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

	// Saving
	save() {
		const _items = JSON.stringify(this.cards);
		// this.setLocalStorage(lsk.items, _items);
		// this.setLocalStorage(lsk.activeItem, JSON.stringify(this.getActiveItem().id));
	}

	// Removing a card
	destroy(id: CardID | CardID[]): void {
		if (!Array.isArray(id)) id = [id];
		const nameArray = id.map((id) => this.getCard(id).name);
		if (!window.confirm(`Are you sure you want to delete ${nameArray.join(', ')}?`)) return;
		if (id.length > 1) {
			// If multiple items are deleted, ask if really want to delete them all
			if (!window.confirm(`Are you really sure? Multiple items will be deleted!`)) return;
		}
		id.forEach((id) => this.sudoDestroy(id));
	}

	// Private Functions
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
