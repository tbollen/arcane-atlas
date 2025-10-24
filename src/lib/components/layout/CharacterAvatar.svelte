<script lang="ts">
	// UI Components
	import * as Avatar from '$lib/components/ui/avatar';
	import Icon from '@iconify/svelte';

	// user and character are passed from layout to this component THROUGH the Navbar component!
	let { user, character } = $props();
</script>

{#if user}
	<a href="/account" id="characterAvatar" class=" transition-all">
		<img src={user.image} alt={user.name} />
		<div class="flex-col">
			<div class="leading-none font-medium">{user.name}</div>
			{#if character}
				<div class="text-xs leading-none text-muted-foreground">{character.name}</div>
			{/if}
		</div>
	</a>
{:else}
	<a href="/login" id="characterAvatar">
		<Icon icon="mdi:account" />
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
		height: 2.5rem;
		/* Styling */
		padding: 0.2rem;
		padding-right: 1em;
		background-color: var(--color-blossom-3);
		border-radius: 999px;
		/* Layout */
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5em;
	}
	#characterAvatar img {
		border-radius: 50%;
		height: 100%;
	}

	#characterAvatar:hover {
		background-color: var(--color-blossom-4);
	}
</style>
