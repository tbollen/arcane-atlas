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

	calculateSeverityFromRoll(roll: ConsequenceRoll): ConsequenceVariant {
		let m = this.getMechanics();
		// Find matching consequence
		const rollNum = this.rollToNumber(roll);
		// Find the first slot where the roll made is equal or smaller than the consequence roll from the rules, AND the slot is empty (null)
		const firstAvailableSlot = this.rules.consequences.find(
			(slot, index) => rollNum <= this.rollToNumber(slot.roll) && m.consequences[index] == null
		);
		// If no slot found, all slots are full
		if (!firstAvailableSlot) throw new Error('All slots are full! Take an extreme consequence.');
		return firstAvailableSlot.variant;
	}

	addConsequence(consequence: Omit<Consequence, 'variant'>) {
		let m = this.getMechanics();
		// Set shorthands
		let text = consequence.text;
		let roll = consequence.roll;

		// Check if input is valid
		if (text.length == 0) throw new Error('Consequence text cannot be empty');
		if (typeof roll === 'number' && roll < 1)
			throw new Error('Consequence roll must be at least 1');

		let variant =
			this.rules.consequences.find((c) => c.roll == roll)?.variant ?? // Find consequence with matching roll
			this.rules.consequences[0].variant; // else, return first variant

		// Get existing consequences,
		// - sort from lowest to highest roll
		// - filter out null
		// - add new consequence as last item
		const consequencesToPlace = [
			...m.consequences
				.filter((c) => c !== null)
				.sort((a, b) => this.rollToNumber(a.roll) - this.rollToNumber(b.roll)),
			{ text, roll, variant }
		];
		// Place consequences
		const newConsequences = this.placeConsequences(consequencesToPlace);
		// Update and set mechanics
		m = { ...m, consequences: newConsequences };
		this.setMechanics(m);
		//
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
