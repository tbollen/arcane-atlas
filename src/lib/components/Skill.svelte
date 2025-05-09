<script lang="ts">
	export let card;
	export let colorize: boolean | string = true;
	let _color = typeof colorize !== 'string' ? 'var(--threat)' : colorize; // Set default if not set
</script>

{#if card.skillCheck}
	<div id="skillcheck" class="field">
		<div id="characteristic">{card.skillCheck.characteristic}</div>
		<div class:colorized={colorize !== false} style="--colorize-color: {_color}" id="skill">
			{card.skillCheck.skill}
		</div>
	</div>
{/if}

<style>
	#skillcheck > * {
		-webkit-print-color-adjust: exact; /* For WebKit browsers */
		color-adjust: exact; /* Standard property */
	}

	#skillcheck {
		display: flex;
		flex-direction: column;
		/* Placement */
		align-items: flex-start;
		grid-column-start: 1;
		grid-column-end: 3;
	}

	#skillcheck > #characteristic {
		font-size: 10pt;
		font-weight: 500;
	}

	#skillcheck > #skill {
		font-size: 14pt;
		font-weight: bold;
	}

	#skill.colorized {
		background-color: var(--colorize-color);
		border: 0.2em solid var(--colorize-color);
		color: white;
	}
</style>
