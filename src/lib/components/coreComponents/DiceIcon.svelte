<script lang="ts">
	type Dice = {
		type: string;
		unicodeCharacter: string;
		tooltip?: string;
		color: string;
	};

	let diceDict: Record<string, Dice> = {
		boost: {
			type: 'boost',
			unicodeCharacter: '&#x25A0',
			tooltip: 'Boost Die',
			color: 'var(--blossom)'
		},
		setback: {
			type: 'setback',
			unicodeCharacter: '&#x25A0',
			tooltip: 'Setback Die',
			color: 'var(--obsidian)'
		},
		ability: {
			type: 'ability',
			unicodeCharacter: '&#x25C6',
			tooltip: 'Ability Die',
			color: 'green'
		},
		difficulty: {
			type: 'difficulty',
			unicodeCharacter: '&#x25C6',
			tooltip: 'Difficulty Die',
			color: 'var(--weave)'
		},
		proficiency: {
			type: 'proficiency',
			unicodeCharacter: '&#11042',
			tooltip: 'Proficiency Die',
			color: '#ffbf00'
		},
		challenge: {
			type: 'challenge',
			unicodeCharacter: '&#11042',
			tooltip: 'Challenge Die',
			color: 'var(--threat)'
		}
	};

	interface Props {
		dice: keyof typeof diceDict;
	}

	let { dice }: Props = $props();
</script>

<span class="dice {diceDict[dice].type}" style="color: {diceDict[dice].color};">
	{diceDict[dice].unicodeCharacter}
</span>
