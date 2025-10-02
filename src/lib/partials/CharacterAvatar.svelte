<script lang="ts">
	import { page } from '$app/stores';

	export let fallbackUser = {
		name: 'Character',
		image: 'https://robohash.org/test',
		id: 'test'
	};

	// Get session data (user info)
	$: user = $page.data.user || fallbackUser;
	$: console.log('user:', user);
</script>

{#if $page.data.user}
	<a href="./account" id="characterAvatar">
		<img src={user.image || `https://robohash.org/${user.name}`} alt={user.name} />
		<span>{user.name}</span>
	</a>
{:else}
	<a href="./login" id="characterAvatar">
		<img src={user.image || `https://robohash.org/${user.name}`} alt="login" />
		<span>Login</span>
	</a>
{/if}

<style>
	a#characterAvatar {
		/* Reset */
		color: unset;
		text-decoration: unset;
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
