<script lang="ts">
	import { goto } from '$app/navigation';

	const user = data.user;

	import { authClient } from '$lib/utils/auth/auth-client';
	interface Props {
		data: any;
	}

	let { data }: Props = $props();

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
	<button onclick={logOut}>Log Out</button>
{:else}
	<p>Not logged in</p>
{/if}
