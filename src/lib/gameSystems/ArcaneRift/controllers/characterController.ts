import {
	arcaneRiftDefaultCharacterRules,
	type ArcaneRiftCharacterMechanics,
	type ArcaneRiftCharacterRules as Rules,
	type Consequence,
	type ConsequenceRoll,
	type Aspect,
	type Characteristic,
	type Skill,
	type ConsequenceVariant
} from '../ar_characters';

export class ArcaneRiftCharacterController {
	// Set rules to be default rules
	rules: Rules;

	constructor(
		private getMechanics: () => ArcaneRiftCharacterMechanics,
		private setMechanics: (mechanics: ArcaneRiftCharacterMechanics) => void,
		rules?: Rules
	) {
		console.log('Arcane Rift Controller initialized');
		console.log('Retrieved Mechanics:', getMechanics());
		this.rules = rules || arcaneRiftDefaultCharacterRules;
	}

	// ----------------------
	// INIT

	applyRules(rules: Rules) {
		// Get copy of mechanics
		let m = this.getMechanics();
		// Remove stats (characteristics and skills) that do not exist in rules
		const filteredCharacteristics = Object.fromEntries(
			Object.entries(m.stats.characteristics).filter(([key]) =>
				rules.stats.characteristics.find((c) => c.name === key)
			)
		);
		// Remove skills that do not exist in rules, or that do not have a characteristic in newCharacteristics
		const filteredSkills = Object.fromEntries(
			Object.entries(m.stats.skills).filter(([key]) =>
				rules.stats.skills.find(
					(s) =>
						s.name === key && rules.stats.characteristics.find((c) => c.name === s.characteristic)
				)
			)
		);

		// Create new characteristics
		let templateCharacteristics: Record<string, Characteristic> = {};
		for (const characteristic of rules.stats.characteristics) {
			templateCharacteristics[characteristic.name] = templateCharacteristics[
				characteristic.name
			] || { ...characteristic, value: rules.characteristics.minValue };
		}

		// Create new skills
		let templateSkills: Record<string, Skill> = {};
		for (const skill of rules.stats.skills) {
			templateSkills[skill.name] = templateSkills[skill.name] || { ...skill, value: 0 };
		}

		// Set new characteristics and skills
		m.stats.characteristics = templateCharacteristics;
		m.stats.skills = templateSkills;

		// Set rules (match)
		this.rules = rules;
		// Set mechanics
		this.setMechanics(m);
	}

	// ----------------------
	// STATS

	updateCharacteristic(characteristic: string, value: number) {
		let m = this.getMechanics();
		// Check if characteristic exists
		if (!m.stats.characteristics[characteristic])
			throw new Error(`Characteristic ${characteristic} does not exist`);

		// Check Rules
		if (value < this.rules.characteristics.minValue) {
			throw new Error(
				`Value for ${characteristic} below minimum (${this.rules.characteristics.minValue})`
			);
		}
		if (value > this.rules.characteristics.maxValue) {
			throw new Error(
				`Value for ${characteristic} above maximum (${this.rules.characteristics.maxValue})`
			);
		}
		// Check sum
		const sum = Object.values(m.stats.characteristics)
			.map((c) => c.value)
			.reduce((sum, val) => sum + val, 0);
		if (
			sum >= this.rules.characteristics.maxSum &&
			value > m.stats.characteristics[characteristic].value
		) {
			throw new Error(
				`Sum of characteristics above maximum (${this.rules.characteristics.maxSum})`
			);
		}

		// Update
		m.stats.characteristics[characteristic].value = value;
		// Set
		this.setMechanics(m);
	}

	updateSkill(skill: Skill, mastery: number) {
		let m = this.getMechanics();
		if (!m.stats.skills[skill.name])
			throw new Error(`Skill with name: "${skill.name}" does not exist`);
		// Check Rules
		if (mastery > this.rules.skills.maxMastery)
			throw new Error(`Mastery for ${skill} above maximum (${this.rules.skills.maxMastery})`);
		// Check sum
		const sum = Object.values(m.stats.skills)
			.map((s) => s.value)
			.reduce((sum, val) => sum + val, 0);
		if (sum > this.rules.skills.maxSum) throw new Error('Max total mastery reached');

		// Update Mechanics

		m.stats.skills[skill.name].value = mastery;
		// Set
		this.setMechanics(m);
	}

	// ----------------------
	// ASPECTS

	addAspect(aspect: Aspect) {
		let m = this.getMechanics();
		// Check Rules
		if (m.aspects.length >= this.rules.aspects.maxAmount) {
			throw new Error('Max number of aspects reached');
		}

		if (aspect.short.length == 0) throw new Error('Aspect short name cannot be empty');

		// Update Mechanics
		m = {
			...m,
			aspects: [...m.aspects, aspect]
		};

		// Set
		this.setMechanics(m);
	}

	removeAspect(target: number | Aspect) {
		let m = this.getMechanics();
		// Get index from target
		const index =
			typeof target == 'number'
				? target
				: m.aspects.findIndex((a) => a.description == target.description);
		// Update Mechanics
		m = {
			...m,
			aspects: [...m.aspects.slice(0, index), ...m.aspects.slice(index + 1)]
		};

		// Set
		this.setMechanics(m);
	}

	moveAspect(target: number | Aspect, newIndex: number) {
		let m = this.getMechanics();
		// Get index from target
		const index =
			typeof target == 'number'
				? target
				: m.aspects.findIndex((a) => a.description == target.description);
		// Update Mechanics
		if (index == -1) throw new Error(`Aspect with description '${target}' does not exist`);

		if (newIndex < 0 || newIndex > m.aspects.length - 1) throw new Error('New index out of bounds');

		// Copy array
		const aspects = [...m.aspects];

		// Remove item
		const [item] = aspects.splice(index, 1);

		// Insert item at newIndex
		aspects.splice(newIndex, 0, item);
		m = {
			...m,
			aspects
		};

		// Set
		this.setMechanics(m);
	}

	// ----------------------
	// CONSEQUENCES

	// GETTERS for info
	/**
	 * Get minimum and maximum numeric consequence rolls from rules
	 * @returns Object with min and max properties, null if no numeric rolls exist
	 */
	getMinMaxConsequenceRolls(): { min: number | null; max: number | null } {
		const rolls = this.rules.consequences
			.map((c) => (typeof c.roll === 'number' ? c.roll : Infinity))
			.filter((r) => r !== Infinity);
		if (rolls.length === 0) {
			return { min: null, max: null };
		}
		return {
			min: Math.min(...rolls),
			max: Math.max(...rolls)
		};
	}

	/**
	 * Get sorted list of unique consequence variants from rules
	 * @returns Array of unique ConsequenceVariant, sorted by roll value (mildest [0] to most severe [last])
	 */
	getSortedConsequenceVariants(): ConsequenceVariant[] {
		// Get unique variants from rules, sorted by roll value
		const variants = Array.from(
			new Set(
				this.rules.consequences
					.slice()
					.sort((a, b) => this.rollToNumber(a.roll) - this.rollToNumber(b.roll))
					.map((c) => c.variant)
			)
		);
		return variants;
	}

	private placeConsequences(
		consequences: Consequence[]
	): ArcaneRiftCharacterMechanics['consequences'] {
		let m = this.getMechanics();
		// Create template array to populate ([null, null, ...] for every slot)
		let templateConsequences: typeof m.consequences = Array.from(
			{ length: this.rules.consequences.length },
			() => null
		);

		// Get consequences from passed in variables,
		// - sort from lowest to highest roll
		// - filter out null
		// - add new consequence as last item
		const consequencesToPlace = consequences.filter((c) => c != null);

		const placeConsequence = (
			c: { text: string; roll: ConsequenceRoll },
			startIndex = 0
		): boolean => {
			// Loop through all consequence slots in the rules
			for (let i = startIndex; i < this.rules.consequences.length; i++) {
				const rule = this.rules.consequences[i];
				// Check if this slot is suitable (rule.roll >= consequence.roll)
				if (this.rollToNumber(rule.roll) >= this.rollToNumber(c.roll)) {
					// Check if slot is empty
					if (templateConsequences[i] == null) {
						templateConsequences[i] = {
							text: c.text,
							roll: rule.roll, //IMPORTANT, updates the roll to match the rule!
							variant: rule.variant
						};
						return true;
					} else {
						// Slot is not empty, check if a higher slot is available
						return placeConsequence(c, i + 1);
					}
					// If rule.roll < consequence.roll, check next slot in for-loop
				} else {
					return placeConsequence(c, i + 1);
				}
			}
			// If NO slot is suitable, return false
			return false;
		};

		// Go through consequences to place
		for (const c of consequencesToPlace) {
			// Place each
			let placed = placeConsequence(c);
			if (!placed) {
				throw new Error('No slot available for consequence');
			}
		}
		return templateConsequences;
	}

	// SLOT FINDING

	/**
	 * Calculate the severity variant and index for a given roll
	 * @param roll  The consequence roll to evaluate
	 * @returns  An object containing:
	 *   - canPlace: boolean indicating if the consequence can be placed
	 *   - variant: the severity variant of the consequence
	 *   - index: the index of the consequence slot in the rules
	 * Never throws!
	 */
	findConsequenceSlotFromRoll(roll: ConsequenceRoll): {
		canPlace: boolean;
		variant: ConsequenceVariant;
		index: number;
	} {
		let m = this.getMechanics();
		const rules = this.rules;
		// Convert ConsequenceRoll to number for comparison
		const rollNum = this.rollToNumber(roll);
		// Find the index of the first slot in the rules that can hold this roll
		const firstFittingIndex = rules.consequences.findIndex(
			(slot) => rollNum <= this.rollToNumber(slot.roll)
		);
		// If no fitting slot found, all slots are too small for the roll
		if (firstFittingIndex === -1) {
			// Then return the last slot and say: "cannot place"
			return {
				canPlace: false,
				variant: rules.consequences[rules.consequences.length - 1].variant,
				index: rules.consequences.length - 1
			};
		}

		// If slot is found but full, check next slot (until a free slot is found or no more slots)
		for (let i = firstFittingIndex; i < rules.consequences.length; i++) {
			// Check if slot is empty
			if (m.consequences[i] == null) {
				// If empty, return this slot
				return {
					canPlace: true,
					variant: rules.consequences[i].variant,
					index: i
				};
			}
		}

		// Otherwise, all slots that can hold the roll are full. Then, return last slot but say: "cannot place"
		return {
			canPlace: false,
			variant: rules.consequences[rules.consequences.length - 1].variant,
			index: rules.consequences.length - 1
		};
	}

	/**
	 * Find the first available slot for a given consequence variant
	 * @param variant The consequence variant to find a slot for
	 * @returns An object containing:
	 *   - canPlace: boolean indicating if the consequence can be placed
	 *   - index: the index of the consequence slot in the rules
	 * @throws Error if the variant does not exist in the rules
	 */
	findConsequenceSlotFromVariant(variant: ConsequenceVariant): {
		canPlace: boolean;
		index: number;
	} {
		let m = this.getMechanics();
		const rules = this.rules;
		// Find first available and empty slot for this variant
		const slots = rules.consequences.map((c, i) => c.variant == variant);
		// Check if variant exists, should not happen (technically...)
		if (slots.every((s) => s === false))
			throw new Error(`Consequence variant "${variant}" does not exist in rules`);
		// Check for the matching slots if any slot is empty (when dealing with multiple slots of the same variant)
		const slotIndex = slots.findIndex((s, i) => s === true && m.consequences[i] == null);
		// Can it be placed?
		const canPlace = slotIndex !== -1 && m.consequences[slotIndex] == null;

		// Return info
		return {
			canPlace,
			index: slotIndex
		};
	}

	// ADD / REMOVE CONSEQUENCE

	/**
	 * Add a consequence by specifying its roll
	 * @param consequence Consequence without variant
	 */
	addConsequenceByRoll(consequence: Omit<Consequence, 'variant'>) {
		let m = this.getMechanics();
		// Set shorthands
		let text = consequence.text;
		let roll = consequence?.roll;

		// Check if input is valid
		if (text.length == 0) throw new Error('Consequence text cannot be empty');
		if (typeof roll === 'number' && roll < 1)
			throw new Error('Consequence roll must be at least 1');

		// Derive variant using findConsequenceSlotFromRoll
		let slotInfo = this.findConsequenceSlotFromRoll(roll);

		// Check if can place
		if (!slotInfo.canPlace)
			throw new Error('Consequence of this roll cannot be placed, all slots are full');
		if (m.consequences[slotInfo.index] != null)
			throw new Error('Internal error: Calculated consequence slot is already occupied');

		// Place consequence and set mechanics
		let variant = slotInfo.variant;
		m.consequences[slotInfo.index] = { text, roll, variant };
		this.setMechanics(m);
	}

	/**
	 * Add a consequence by specifying its variant
	 * @param consequence Consequence without roll
	 * @throws Error if consequence text is empty, or if no available slot for the variant exists
	 */
	addConsequenceByVariant(consequence: Omit<Consequence, 'roll'>) {
		let m = this.getMechanics();
		// Set shorthands
		let text = consequence.text;
		let variant = consequence?.variant;
		// Check if input is valid
		if (text.length == 0) throw new Error('Consequence text cannot be empty');

		// Use findConsequenceSlotFromVariant to get slot info
		const slotInfo = this.findConsequenceSlotFromVariant(variant);

		// Check if can place
		if (!slotInfo.canPlace)
			throw new Error(`No available slot for consequence variant "${variant}"`);

		// Get roll from rules
		let roll = this.rules.consequences[slotInfo.index].roll;

		// Add consequence and set mechanics
		m.consequences[slotInfo.index] = { text, variant, roll };
		this.setMechanics(m);
	}

	// Removing and demoting consequences

	/**
	 * Check if a consequence can be demoted to the next lower severity slot.
	 * @param target The consequence or its index to check for demotion
	 * @returns An object containing:
	 *   - canDemote: boolean indicating if the consequence can be demoted
	 *   - nextVariant: the variant of the next lower severity slot, or null if cannot demote
	 *   - nextIndex: the index of the next lower severity slot, or null if cannot demote
	 * @throws Never throws!
	 */
	checkDemoteConsequenceSlot(target: number | Consequence): {
		canDemote: boolean;
		nextVariant: ConsequenceVariant | null;
		nextIndex: number | null;
	} {
		let m = this.getMechanics();
		// Get index from target
		const notFound = { canDemote: false, nextVariant: null, nextIndex: null };
		const index =
			typeof target == 'number' ? target : m.consequences.findIndex((c) => c?.text == target.text);
		// Check if index is valid
		if (index == -1) return notFound;
		// Get consequence to demote
		const consequenceToDemote = m.consequences[index];
		if (consequenceToDemote == null) return notFound;

		// Find next lower slot in rules by variant
		const sortedVariants = this.getSortedConsequenceVariants();
		const currentVariantIndex = sortedVariants.findIndex((v) => v == consequenceToDemote.variant);
		if (currentVariantIndex == -1) return notFound; // Should not happen!
		// If already lowest variant, cannot demote
		if (currentVariantIndex == 0) return { canDemote: false, nextVariant: null, nextIndex: null };
		// Get next lower variant
		const nextVariant = sortedVariants[currentVariantIndex - 1];
		// Find next lower slot index in mechanics
		const slotInfo = this.findConsequenceSlotFromVariant(nextVariant);
		if (!slotInfo.canPlace) return { canDemote: false, nextVariant: null, nextIndex: null };
		// Return info
		return { canDemote: true, nextVariant, nextIndex: slotInfo.index };
	}

	/**
	 * Demote a consequence to the next lower severity slot.
	 * Looks if the next lower slot is available, and moves the consequence there.
	 * @param target
	 */
	demoteConsequence(target: number | Consequence, newText?: string) {
		let m = this.getMechanics();
		// Get index from target
		const index =
			typeof target == 'number' ? target : m.consequences.findIndex((c) => c?.text == target.text);
		// Check if index is valid
		if (index == -1) throw new Error('Consequence to demote not found');
		// Get consequence to demote
		const consequenceToDemote = m.consequences[index];
		if (consequenceToDemote == null) throw new Error('Cannot demote null consequence');
		// Check if can demote
		const demoteInfo = this.checkDemoteConsequenceSlot(index);
		if (!demoteInfo.canDemote || demoteInfo.nextIndex == null || demoteInfo.nextVariant == null)
			throw new Error('Consequence cannot be demoted, no available lower slot');
		// Demote (remove and add  new at lower slot)
		// Remove from current slot
		m.consequences[index] = null;
		// Add to new slot
		m.consequences[demoteInfo.nextIndex] = {
			text: newText || consequenceToDemote.text,
			roll: this.rules.consequences[demoteInfo.nextIndex].roll,
			variant: demoteInfo.nextVariant
		};
		// Set mechanics
		this.setMechanics(m);
	}

	removeConsequence(target: number | Consequence) {
		let m = this.getMechanics();
		// Check, cannot remove null
		if (target == null) throw new Error('Cannot remove null consequence');
		// Get index from target
		const index =
			typeof target == 'number' ? target : m.consequences.findIndex((c) => c?.text == target.text);

		// Update Mechanics
		m = {
			...m,
			consequences: [...m.consequences.slice(0, index), ...m.consequences.slice(index + 1)]
		};

		this.setMechanics(m);
	}

	// ----------------------
	// STRESS

	updateStressTracks() {
		let m = this.getMechanics();
		// Create empty stress tracks from rules
		let templateTracks = this.rules.stressTracks.variants.map((variant) => ({
			variant,
			value: 0,
			max: Math.floor(this.rules.stressTracks.maxAllowed / 2 + 1)
		}));
		// Get tracks where the variant matches the rules
		const tracksToKeep = m.stressTracks.filter((t) =>
			this.rules.stressTracks.variants.includes(t.variant)
		);

		templateTracks = templateTracks.map((track) => {
			// Find matching track from tracksToKeep
			const matchingTrack = tracksToKeep.find((t) => t.variant == track.variant);
			return matchingTrack ? matchingTrack : track;
		});
		m.stressTracks = templateTracks;
		this.setMechanics(m);
	}

	setStressTrackValue(variant: string, value: number) {
		let m = this.getMechanics();
		// Check value
		if (value < 0) throw new Error('Stress value cannot be negative');
		if (value > this.rules.stressTracks.maxAllowed)
			throw new Error(`Stress value cannot be higher than ${this.rules.stressTracks.maxAllowed}`);
		// Find track
		const trackIndex = m.stressTracks.findIndex((t) => t.variant == variant);
		if (trackIndex == -1) throw new Error(`Stress track with variant "${variant}" not found`);
		// Check vs character Maximum
		if (value > m.stressTracks[trackIndex].max)
			throw new Error(
				`Stress value for ${variant} cannot be higher than track maximum (${m.stressTracks[trackIndex].max})`
			);
		// Update
		m.stressTracks[trackIndex].value = value;
		this.setMechanics(m);
	}

	setStressTrackMax(variant: string, max: number) {
		let m = this.getMechanics();
		// Check max
		if (max < 1) throw new Error('Stress track maximum must be at least 1');
		// Check vs Rules
		if (max > this.rules.stressTracks.maxAllowed)
			throw new Error(
				`Stress track maximum cannot be higher than ${this.rules.stressTracks.maxAllowed}`
			);
		// Find track
		const trackIndex = m.stressTracks.findIndex((t) => t.variant == variant);
		if (trackIndex == -1) throw new Error(`Stress track with variant "${variant}" not found`);

		// Update
		m.stressTracks[trackIndex].max = max;

		// Check if current value exceeds new max
		if (m.stressTracks[trackIndex].value > max) {
			m.stressTracks[trackIndex].value = max;
		}
		this.setMechanics(m);
	}

	// ----------------------
	// HELPERS

	private rollToNumber(roll: ConsequenceRoll): number {
		if (typeof roll === 'string') return Infinity;
		return roll;
	}

	/////////////////
	//END OF CLASS //
	/////////////////
}
