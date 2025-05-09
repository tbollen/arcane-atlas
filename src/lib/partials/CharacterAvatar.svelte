<script lang="ts">
	export let character = {
		name: 'Character',
		image: 'https://robohash.org/test',
		id: 'test'
	};
</script>

<button id="characterAvatar">
	<img src={character.image} alt={character.name} />
	<span>{character.name}</span>
</button>

<style>
	button {
		/* Reset */
		all: unset;
		cursor: pointer;
	}
	#characterAvatar {
		height: 2rem;
		/* Styling */
		padding: 0.2rem;
		padding-right: 1em;
		background-color: var(--color-blossom-3);
		border-radius: 999px;
		/* Layout */
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	#characterAvatar img {
		border-radius: 50%;
		height: 100%;
	}

	#characterAvatar span {
		font-weight: 500;
	}

	#characterAvatar:hover {
		background-color: var(--color-threat-4);
	}
</style>
