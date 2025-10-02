<script lang="ts">
	import { goto } from '$app/navigation';

	export let data; // data is the result of the server-side load function
	const user = data.user;

	import { authClient } from '$lib/utils/auth/auth-client';

	async function logOut() {
		try {
			await authClient.signOut();
		} catch (e) {
			console.error(e);
		}
		console.log('Signed out');
		goto('/login');
	}
</script>

<br />
<br />
This is my account!

{#if user}
	<p>Logged in as {user.name}</p>
	<p>Email: {user.email}</p>
	<img src={user.image} alt={user.name} />
	<br />
	<button on:click={logOut}>Log Out</button>
{:else}
	<p>Not logged in</p>
{/if}
