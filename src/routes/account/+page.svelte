<script lang="ts">
	// UI Component
	import { Button } from '$lib/components/ui/button';

	// Navigation
	import { goto } from '$app/navigation';

	import { authClient } from '$lib/utils/auth/auth-client';
	interface Props {
		data: any;
	}

	let { data }: Props = $props();
	const user = data.user;

	async function logOut() {
		try {
			await authClient.signOut();
		} catch (e) {
			console.error(e);
		}
		console.log('Signed out');
		goto('/login');
	}

	console.error('Data:', data);
</script>

{#await user}
	<p>Loading...</p>
{:then user}
	{#if user}
		<p>Logged in as {user.name}</p>
		<p>Email: {user.email}</p>
		<img src={user.image} alt={user.name} />
		<br />
		<Button variant="destructive" onclick={logOut}>Log Out</Button>
	{:else}
		<p>Not logged in</p>
	{/if}
{:catch error}
	<p>Error: {error.message}</p>
{/await}
