<script lang="ts">
	const character = {
		name: 'Neovald',
		image: 'https://robohash.org/test',
		id: 'test',
		aspects: ['Aspect 1', 'Aspect 2', 'Aspect 3', 'Aspect 4', 'Aspect 5']
	}; //TODO get character and user data

	let values: number[] = $state([]);

	import { characteristics, skillList } from '$lib/gameSystems/ArcaneRift/ar_skillCheckList';
</script>

<section id="sheet">
	<!-- Name -->
	<section id="name">
		<div class="freeMarker">Character</div>
		<div class="name">{character.name}</div>
	</section>
	<!-- Image -->
	<section id="image">
		<img src={character.image} alt={character.name} />
	</section>
	<!-- Characteristics -->
	<section id="characteristics">
		{#each characteristics as characteristic, index}
			<div class="characteristic">
				<div class="name" id={characteristic}>{characteristic}</div>
				<input type="number" bind:value={values[index]} />
				<div class="skills">
					{#each skillList[characteristic] as skill}
						<div class="skillName">
							{skill}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</section>
	<section id="aspects">
		<div class="marker">Aspects</div>
		{#each character.aspects as aspect, index}
			<div class="aspect lineItem">{aspect}</div>
		{/each}
	</section>
	<!-- Stress -->
	<section id="stress">
		<div class="marker">Stress</div>
	</section>
	<!-- Shortlist -->
	<section id="shortlist">
		<div class="marker">Shortlist</div>
		{#each Array.from({ length: 6 }) as _, i}
			<div class="lineItem">something {i + 1}</div>
		{/each}
	</section>
	<!-- Consequences -->
	<section id="consequences">
		<div class="marker">Consequences</div>
	</section>
</section>

<style>
	#sheet {
		/* Variables */
		--border: 3px solid var(--color-obsidian-0);
		--img-size: 260px;

		/* Layout */
		display: grid;
		grid-template-areas:
			'name name image'
			'characteristics aspects image'
			'characteristics aspects stress'
			'characteristics shortlist consequences';
		grid-template-columns: min-content 1fr var(--img-size);
		--spacing: 1.5rem;
		gap: var(--spacing);
		padding: var(--spacing);
	}

	#name {
		grid-area: name;
		border: var(--border);
		height: 5em;
	}

	#name .name {
		/* Text Style */
		font-size: 1.2rem;
		font-weight: 400;
		/* Layout */
		margin-left: 1em;
		margin-top: 0.6em;
	}

	#image {
		border: var(--border);
		height: var(--img-size);
		aspect-ratio: 1 / 1;
		grid-area: image;
	}

	#image img {
		height: 100%;
		width: 100%;
		object-fit: cover;
	}

	#characteristics {
		grid-area: characteristics;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 1em;
	}

	.characteristic {
		--box-size: 3rem;
		display: grid;
		grid-template-columns: var(--box-size) min-content;
		min-width: fit-content;
		gap: 0.5em;
	}

	.characteristic .name {
		/* Text Style */
		font-size: 1rem;
		font-weight: 500;
		text-transform: uppercase;
		grid-column: 1 / 3;
		border-bottom: solid 3px var(--color-obsidian-0);
	}

	.characteristic input {
		width: var(--box-size);
		height: var(--box-size);
		/* Style */
		border: var(--border);
		box-shadow: 2px 2px 5px var(--color-obsidian-0);
		/* Text Style */
		appearance: none;
		font-family: 'Gotham', sans-serif;
		text-align: center;
		font-size: 2em;
		font-weight: 600;
	}

	.characteristic input:invalid {
		border-color: var(--color-threat-3);
	}

	.characteristic input::-webkit-outer-spin-button,
	.characteristic input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.characteristic .skills {
		display: flex;
		flex-direction: column;
	}

	#aspects {
		grid-area: aspects;
	}

	.lineItem {
		border-bottom: 1px solid var(--color-obsidian-3);
		padding: 0.2em 0.6em;
		line-height: 2;
	}

	/* Globals */

	.marker,
	.freeMarker {
		/* Color */
		background-color: var(--color-obsidian-0);
		color: var(--color-pearl-4);
		/* Text Style */
		font-size: 1rem;
		font-weight: 500;
		text-transform: uppercase;
		/* Layout */
		padding: 1.2em 0.2em 0.2em 0.6em;
	}

	.freeMarker {
		width: min-content;
		padding: 0.2em;
		padding-right: 6em;
	}
</style>
