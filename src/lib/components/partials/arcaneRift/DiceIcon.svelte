<script lang="ts" module>
	/**
	 * The following font was used to create these dice icons:
	 * @link https://github.com/themensch/FFG-Genesys-Glyphs-and-Dice/blob/master/GenesysGlyphsAndDice-3.0.otf
	 */

	export const genesysDiceSymbolsMap = {
		advantage: 'a',
		despair: 'd',
		failure: 'f',
		success: 's',
		threat: 'h',
		triumph: 't'
	} as const;

	export const genesysDiceTypesMap = {
		combatRating: 'c',
		downChevron: 'y',
		generalRating: 'g',
		hollowDiamond: 'J',
		hollowHexagon: 'K',
		hollowSquare: 'L',
		minus: 'v',
		plus: 'w',
		socialRating: 'p',
		solidDiamond: 'k',
		solidHexagon: 'l',
		solidSquare: 'j',
		upChevron: 'x'
	} as const;

	export type GenesysDiceSymbol = keyof typeof genesysDiceSymbolsMap;
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import * as Tooltip from '$lib/components/ui/tooltip';

	let {
		class: className,
		symbol,
		richColor,
		tooltip = true
	}: {
		class?: HTMLAttributes<HTMLDivElement>['class'];
		symbol: GenesysDiceSymbol;
		richColor?: boolean;
		tooltip?: string | boolean;
	} = $props();

	function captialize(str: string) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
</script>

{#if tooltip}
	<Tooltip.Provider>
		<Tooltip.Root>
			<Tooltip.Trigger>
				{@render icon()}
			</Tooltip.Trigger>
			<Tooltip.Content
				><p>
					{(typeof tooltip === 'string' && tooltip) || captialize(String(symbol))}
				</p></Tooltip.Content
			>
		</Tooltip.Root>
	</Tooltip.Provider>
{:else}
	{@render icon()}
{/if}

{#snippet icon()}
	<span class="{className} genesys {richColor ? symbol : ''}">{genesysDiceSymbolsMap[symbol]}</span>
{/snippet}

<style lang="postcss">
	/*****
* Font declaration
*****/

	@font-face {
		font-family: 'Genesys';
		src:
			url('GenesysGlyphsAndDice-3.0.otf') format('otf'),
			url('genesysglyphsanddice.woff2') format('woff2'),
			url('genesysglyphsanddice.woff') format('woff');
		font-weight: normal;
		font-style: normal;
	}

	/*****
* Base style
*****/

	.genesys {
		font-family: 'Genesys';
	}

	/* DICE SYMBOLS */

	.genesys.triumph {
		color: #ffbf00;
	}

	.genesys.despair {
		color: #9f332b;
		font-weight: 800;
	}

	.genesys.success {
		color: green;
	}

	.genesys.failure {
		color: #c93227;
	}

	.genesys.advantage {
		color: #4f97d1;
	}

	.genesys.threat {
		color: #00273c;
	}

	/* DICE */

	.genesys.dice {
		-webkit-text-stroke: 1.05em black;
	}

	.genesys.proficiency {
		color: #fde600;
	}
	.genesys.ability {
		color: #45ad48;
	}
	.genesys.boost {
		color: #80cec4;
	}
	.genesys.setback {
		color: #231f20;
	}
	.genesys.challenge {
		color: #771214;
	}
	.genesys.difficulty {
		color: #552c7f;
	}
	.genesys.combat {
		color: #c93227;
	}
	.genesys.social {
		color: #145282;
	}
	.genesys.general {
		color: #00773b;
	}
</style>
