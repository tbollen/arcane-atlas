import { writable } from 'svelte/store';
import { Item } from '$lib/types/Item';
import { defaultTemplates } from '$lib/stores/defaultTemplates';
import { startingItems } from '$lib/stores/defaultTemplates';
import {
	type CardStylePreset,
	cardStylePresets,
	defaultCardStyle
} from '$lib/core/presets/cardStylePresets';
import { localStorageKeys as lsk } from '$lib/metadata/localStorageKeys';

// Env variables
const replaceString = 'replaceMe';
const defaultUser = 'Guest';

export let testItem = new Item({
	name: 'Card name',
	type: 'Item',
	description:
		'Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident soluta repellendus omnis excepturi? Esse obcaecati, harum iure fugit eaque earum.',

	skillCheck: {
		characteristic: 'Agility',
		skill: 'Acrobatics'
	},

	fields: [
		{
			name: 'Defense',
			description: 'Reflex'
		},
		{
			name: 'Use',
			description: 'Action'
		}
	]
});

export type FieldTypes = 'aspects' | 'specials' | 'fields';

// Generate a random ID, used for new items
function generateShortID(length: number = 8, prefix: string = ''): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = prefix;
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * chars.length);
		result += chars[randomIndex];
	}
	return result;
}

class StoredItem extends Item {
	id: string;
	isActive: boolean = false;
	isSelected: boolean = false;
	creator: string;
	dateCreated: Date;

	constructor(_storedItem?: Partial<StoredItem>, _id?: string) {
		// Apply values from Item
		super(_storedItem as Partial<Item>);
		// Set ID
		this.id = _id || _storedItem?.id || replaceString;
		// Set Creator (placeholder for now)
		this.creator = _storedItem?.creator || defaultUser;
		// Set Date Created to now
		this.dateCreated = _storedItem?.dateCreated || new Date();
	}

	// Methods for adding new fields and editing
	addEmptyField(fieldType: FieldTypes) {
		const emptyField = { name: fieldType, description: 'text' };
		let _fields = this[fieldType];
		if (_fields) {
			// If there are already fields, push
			_fields.push(emptyField);
		} else {
			// Otherwise, create a new array
			_fields = [emptyField];
		}
		// Update to match
		this[fieldType] = [..._fields];
		this.update();
	}

	removeField(fieldType: FieldTypes, index: number) {
		let _fields = this[fieldType];
		if (!_fields) throw new Error(`Field type ${fieldType} not found in ${this.name} (${this.id})`);
		// If there are already fields, remove
		_fields.splice(index, 1);
		// Update to match
		this[fieldType] = [..._fields];
		this.update();
	}

	// Image editing
	resetImagePosition(property?: 'x_offset' | 'y_offset' | 'rotation' | 'scale') {
		if (this.image == undefined) return;
		if (property) this.image[property] = property == 'scale' ? 100 : 0;
		this.image.x_offset = 0;
		this.image.y_offset = 0;
		this.image.rotation = 0;
		this.image.scale = 100;
		this.update();
	}

	// Styling
	useStylePreset(preset: CardStylePreset | 'random') {
		if (preset == 'random') {
			const _presets = Object.keys(cardStylePresets).filter(
				(key) => key != 'custom' && key != 'default'
			);
			preset = _presets[Math.floor(Math.random() * _presets.length)];
		}
		const _stylePreset = cardStylePresets[preset];
		// Assign for each category the values from the preset
		this.style.color = Object.assign(this.style.color, _stylePreset.color);
		this.style.font = Object.assign(this.style.font, _stylePreset.font);
		this.style.fontsize = Object.assign(this.style.fontsize, _stylePreset.fontsize);
		// Set preset
		this.stylePreset = preset;
		this.update();
	}

	private update() {
		// TODO: Remove or fix!
	}
}

// Exporting type for easy reference
export type { StoredItem };

// ItemStore
class ItemStore {
	items: StoredItem[] = [];
	templates: Item[] = [];
	idSet: Set<string> = new Set();
	idSettings = {
		idLength: 8,
		setName: 'c'
	};
	activeItem?: StoredItem;

	constructor(
		i: {
			_store?: ItemStore;
			_items?: StoredItem[];
			_templates?: Item[];
		} = {}
	) {
		// If an exisiting store is given,
		if (i._store) {
			// Override all other values
			i._items = i._store.items;
			i._templates = i._store.templates;
		}
		// Create items from given items (* instead of setting it, to support migrations)
		this.items = i._items ? i._items.map((item) => new StoredItem(item)) : [];
		// Same for templates
		this.templates = i._templates ? i._templates.map((item) => new Item(item)) : defaultTemplates;

		// Fix when no items are given
		if (this.items.length == 0) {
			// for each item in startingItems, add to items
			startingItems.forEach((item) => this.addNewItem(item));
		}

		// Make the idSet
		this.idSet = new Set(this.items.map((item) => item.id));
		// Initialise active item, by setting this.activeItem correctly!
		this.initActiveItem();
	}
	// Basic Methods

	getItem(_target: string | StoredItem): StoredItem {
		if (_target instanceof StoredItem) return _target; // If item is given, return it
		// Otherwise, return the item with the given id
		const _item = this.items.find((item) => item.id.toString() === _target.toString());
		if (!_item) throw new Error(`Item with id: ${_target} not found in items`);
		return _item;
	}

	getFirstItem(): StoredItem {
		if (this.items.length == 0) this.addNewItem();
		return this.items[0];
	}

	getItemId(_item: StoredItem): string {
		if (!this.items.includes(_item)) throw new Error(`Given Item not found in items`);
		return _item.id;
	}

	setItem(_id: string, itemUpdate: Partial<Item>) {
		// Get the items and update	the selected item
		let _items = this.items;
		try {
			this.getItem(_id); // Check if item exists
		} catch (error) {
			throw error;
		}
		_items = _items.map((item) => {
			if (item.id === _id) {
				return { ...item, ...itemUpdate } as StoredItem; //Override given properties from itemUpdate
			} else {
				return item;
			}
		});
		// Update the itemstore
		this.items = _items;
	}

	// Item Management

	/**
	 * Prepares a new StoredItem with a unique ID, ready to be added to the store.
	 *
	 * @param _item Optional partial item to prepare. If not given, active item will be used. If no active item, an empty object will be used
	 * @returns A new StoredItem with a unique ID
	 */
	prepareItem(_item?: Partial<StoredItem>): StoredItem {
		// Use given item, or active item, or empty object
		let itemToPrepare = _item ?? {};
		// If item has an ID that already exists, generate a new one
		if (itemToPrepare.id && this.idSet.has(itemToPrepare.id)) {
			itemToPrepare = { ...itemToPrepare, id: this.generateUniqueId() };
		}
		// Create new StoredItem
		const newItem = new StoredItem(itemToPrepare, itemToPrepare.id || this.generateUniqueId());
		// Return the new item
		return newItem;
	}

	/**
	 * Adds a new item to the store.
	 *
	 * Prepares the item using optional properties, adds it to the items array,
	 * updates the ID set, saves the changes, and sets the new item as active.
	 * Logs the addition and returns the new item's ID.
	 *
	 * @param _item - Optional partial item data to initialize the new item.
	 * @returns The unique ID of the newly added item.
	 */
	addNewItem(_item?: Partial<StoredItem>): string {
		// Prepare item with optional properties
		const newItem = this.prepareItem(_item);
		// Add to items
		this.items = [...this.items, newItem];
		// Add id to idSet
		this.idSet.add(newItem.id);
		// Save changes
		this.save();
		// Set Active Item
		this.setActiveItem(newItem);
		// Logging
		console.log(`New${_item ? '' : ' empty'} item added to database:`, newItem);
		// Return ID
		return newItem.id;
	}

	duplicateItem(_base: string | StoredItem) {
		try {
			const _targetItem = this.getItem(_base);
			const _newItem = { ..._targetItem };
			this.addNewItem(_newItem);
			this.updateItems();
			this.save();
		} catch (error) {
			throw error;
		}
	}

	destroy(id: string | string[]) {
		if (!Array.isArray(id)) id = [id];
		const nameArray = id.map((id) => this.getItem(id).name);
		if (!window.confirm(`Are you sure you want to delete ${nameArray.join(', ')}?`)) return;
		if (id.length > 1) {
			// If multiple items are deleted, ask if really want to delete them all
			if (!window.confirm(`Are you really sure? Multiple items will be deleted!`)) return;
		}
		id.forEach((id) => this.sudoDestroy(id));
	}

	private sudoDestroy(_id: string) {
		let _idSet = this.idSet;
		let _items = this.items;
		if (this.items.length < 2) {
			alert('Cannot destroy last item');
			throw new Error('Cannot destroy last item');
		}
		try {
			// Remove item from Items
			const _targetItem = this.getItem(_id);
			_items = _items.filter((item) => item.id !== _targetItem.id);
			// Update idSet
			if (!_idSet.has(_id)) return console.error(`ID (${_id}) not found in idSet`);
			_idSet.delete(_id);
			// Update Items
			this.items = _items;
			this.idSet = _idSet;
			// Save Changes
			this.save();
			window.location.reload();
		} catch (error) {
			// If item not found, re-throw error
			console.error(error);
		}
	}

	// Active Item Stuff
	private async initActiveItem() {
		if (this.activeItem !== undefined)
			return console.error('Active Item already initialized', this.activeItem); // Already initialized, return
		try {
			// Await the result of getLocalStorage since it's asynchronous
			const _localStorageID = await this.getLocalStorage(lsk.activeItem);
			console.debug('Active Item ID:', _localStorageID, this.idSet);
			// Set activeItem based on the value from localStorage
			this.setActiveItem(_localStorageID.toString());
		} catch (error) {
			// If localStorage is empty, or the ID is not valid, set activeItem to the first item
			console.error(error);
			this.activeItem = this.getFirstItem();
		}
	}

	getActiveItem(): StoredItem {
		if (this.activeItem) return this.activeItem;
		return this.getFirstItem();
	}

	setActiveItem(_target: string | StoredItem) {
		if (_target instanceof StoredItem) this.activeItem = _target;
		else this.activeItem = this.getItem(_target);
		this.save();
	}

	// Item editing
	itemSetSuper(updates: Partial<StoredItem>) {
		Object.assign(this.getActiveItem(), updates);
	}

	// Field editing
	addEmptyField(_target: string | StoredItem, fieldType: FieldTypes = 'fields') {
		let _item = this.getItem(_target);
		_item.addEmptyField(fieldType);
		this.setItem(_item.id, _item);
	}

	removeField(_target: string | StoredItem, fieldType: FieldTypes = 'fields', index: number) {
		let _item = this.getItem(_target);
		_item.removeField(fieldType, index);
		this.setItem(_item.id, _item);
	}
	// DB Editing

	// ID Stuff
	private generateUniqueId(): string {
		let _itemId = generateShortID(this.idSettings.idLength, this.idSettings.setName);
		while (this.idSet.has(_itemId)) {
			_itemId = generateShortID(this.idSettings.idLength, this.idSettings.setName);
		}
		return _itemId;
	}

	private updateItems() {
		// editItem.update(() => this.getActiveItem());
		this.items = [...this.items];
	}

	// Saving
	save() {
		const _items = JSON.stringify(this.items);
		this.setLocalStorage(lsk.items, _items);
		this.setLocalStorage(lsk.activeItem, JSON.stringify(this.getActiveItem().id));
	}

	// LocalStorage
	private async checkLocalStorage(): Promise<boolean> {
		// Check if we're running in a browser environment and localStorage is available
		if (typeof window === 'undefined' || !window.localStorage) {
			await new Promise((resolve) => {
				const interval = setInterval(() => {
					// Wait until window and localStorage are both available
					if (typeof window !== 'undefined' && window.localStorage) {
						clearInterval(interval);
						resolve(true);
					}
				}, 100);
			});
			return true; // localStorage is now initialized
		}
		return true; // localStorage is already initialized
	}

	private async setLocalStorage(key: string, value: string, debug: boolean = true) {
		if (!(await this.checkLocalStorage())) return;
		localStorage.setItem(key, value);
		// Debugging
		if (!debug) return;
		console.debug('Set localStorage', key, JSON.parse(value));
	}

	private async getLocalStorage(key: string): Promise<string> {
		if (!(await this.checkLocalStorage())) {
			throw new Error('Cannot get localStorage: localStorage not Initialized');
		}

		const value = localStorage.getItem(key);
		if (!value || !(key in localStorage)) {
			throw new Error(`Key ${key} not found in localStorage`);
		}
		return JSON.parse(value);
	}

	// Downloading

	/**
	 * Download items, IDs can be given to download specific items
	 * @param id Single ID or Array of IDs to download. If empty, all items will be downloaded
	 */
	download(id: string | string[] = []) {
		if (!Array.isArray(id)) id = [id];
		let _items = this.items;
		if (id.length > 0) {
			_items = id.map((id) => this.getItem(id));
		}
		if (_items.length === 0) throw new Error('No valid IDs given');
		this.sudoDownload(_items);
	}

	private sudoDownload(targetItems: StoredItem[] = this.items) {
		const _items = JSON.stringify(targetItems);
		const blob = new Blob([_items], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'items.json';
		link.click();
	}

	// Uploading

	uploadOverride() {
		if (!window.confirm('Are you sure you want to override the current items?')) return;
		this.sudoUpload(true);
	}

	upload() {
		this.sudoUpload();
	}

	private sudoUpload(override: boolean = false) {
		// Create a file input element
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = '.json'; // Only accept JSON files

		// When a file is selected, read its contents
		fileInput.addEventListener('change', (e) => {
			const selectedFile = (e.target as HTMLInputElement)?.files?.[0];
			if (!selectedFile) return; // If no file is selected, exit

			// Create a FileReader to read the file
			const reader = new FileReader();
			reader.onload = (event) => {
				const file = event.target?.result as string;
				console.log('Uploaded file items:', JSON.parse(file));
				// Create the items from the uploaded file
				const newItems = JSON.parse(file);
				// Create new Items from the uploaded file
				Object.entries(newItems).forEach(([id, item]) => {
					if (!item || typeof item !== 'object') throw new Error('Invalid item');
					const _item: Partial<StoredItem> = { ...item };
					this.addNewItem(_item);
				});

				// Reload the page to show the new items
				window.location.reload();
			};
			// Start reading the file
			reader.readAsText(selectedFile);
		});

		// Make the file input element visible and clickable
		fileInput.click();
	}

	//

	private serialize(): JSON {
		const stringifiedItems = JSON.stringify(this.items);
		return JSON.parse(stringifiedItems);
	}
}
// END OF ITEMSTORE

// Get items from local storage
let localStoreItems = undefined;
if (typeof window !== 'undefined' && window.localStorage) {
	localStoreItems = localStorage.getItem(lsk.items);
	if (localStoreItems) {
		localStoreItems = new ItemStore({ _items: JSON.parse(localStoreItems) });
		console.log('Items loaded from local storage:', localStoreItems);
	}
}

// Init store
// export let items = new ItemStore();
export let items =
	localStoreItems instanceof ItemStore
		? new ItemStore({ _store: localStoreItems })
		: new ItemStore();
