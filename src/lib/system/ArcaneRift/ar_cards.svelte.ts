// Basic Types to use in the system
type Field = {
	label: string;
	value: string;
};

type Aspect = {
	short: string;
	description: string;
};

export type ArcaneRiftCard = {
	// Arcane Rift specific mechanics here
	aspects: Aspect[];
	fields: Field[];
	check: {
		characteristic?: string;
		skill?: string;
	};
};

// Functions to manipulate the cards for the Arcane Rift system
export const ar = {
	doThis(): void {
		console.log('doThis');
	}
};

// Card Class
// This class is used when the selected system is Arcane Rift, and extends the StoredCard class with system-specific mechanics and functionality
// import { StoredCard } from '$lib/core/cards/cardStore.svelte';
// export class AR_Card extends StoredCard {
// 	constructor(card?: Partial<StoredCard> & { mechanics?: Partial<ArcaneRiftCard> }) {
// 		// Init as usual
// 		super(card?.id ?? ('' as any), card);
// 		// Make sure Systems include arcaneRift (as it is added here)
// 		if (!this.systems.includes('arcaneRift')) this.systems.push('arcaneRift');
// 		// Set mechanics
// 		this.mechanics.arcaneRift = {
// 			aspects: card?.mechanics?.aspects ?? [],
// 			fields: card?.mechanics?.fields ?? [],
// 			check: card?.mechanics?.check ?? {}
// 		};
// 	}
// 	///////////////////////////////
// 	// System specific functions //
// 	///////////////////////////////
// 	// Aspect functions
// 	addAspect(aspect: Aspect) {
// 		this.mechanics.arcaneRift?.aspects.push(aspect);
// 	}

// 	removeAspect(target: number | Aspect) {
// 		if (!this.mechanics.arcaneRift) return;
// 		if (typeof target === 'number') {
// 			// Remove by index
// 			if (target < 0 || target >= this.mechanics.arcaneRift.aspects.length) return;
// 			this.mechanics.arcaneRift.aspects.splice(target, 1);
// 		} else {
// 			// Remove by value
// 			this.mechanics.arcaneRift.aspects = this.mechanics.arcaneRift.aspects.filter(
// 				(a: Aspect) => a !== target
// 			);
// 		}
// 	}

// 	// Field functions
// 	addField(field: Field) {
// 		this.mechanics.arcaneRift?.fields.push(field);
// 	}

// 	removeField(target: number | Field) {
// 		if (!this.mechanics.arcaneRift) return;
// 		if (typeof target === 'number') {
// 			// Remove by index
// 			if (target < 0 || target >= this.mechanics.arcaneRift.fields.length) return;
// 			this.mechanics.arcaneRift.fields.splice(target, 1);
// 		} else {
// 			// Remove by value
// 			this.mechanics.arcaneRift.fields = this.mechanics.arcaneRift.fields.filter(
// 				(f: Field) => f !== target
// 			);
// 		}
// 	}
// }
