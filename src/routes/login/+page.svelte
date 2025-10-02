<script lang="ts">
	import { onMount } from 'svelte';
	import { authClient } from '$lib/utils/auth/auth-client';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { enhance } from '$app/forms';

	let session: any;

	// +page.server.ts form actions return 'form' as an object with the form data
	interface Props {
		form: any;
	}

	let { form }: Props = $props();

	onMount(async () => {
		session = await authClient.getSession();
		if (session && session?.data?.user) goto(`${base}/account`);
	});
</script>

<main>
	{#if form?.message}
		<p>{form.success ? 'Success' : 'Error'}: {form.message}</p>
	{/if}
	<h1>Sign In</h1>
	<form method="POST" use:enhance>
		<label for="email">Email</label>
		<input type="email" name="email" />
		<label for="password">Password</label>
		<input type="password" name="password" />
		<button formaction="?/signIn" type="submit">Sign In</button>
	</form>
	<br />

	<h1>Sign Up</h1>
	<form method="POST" use:enhance>
		<label for="name">Name</label>
		<input type="text" name="name" required />
		<label for="email">Email</label>
		<input type="email" name="email" required />
		<label for="password">Password</label>
		<input type="password" name="password" required />
		<button type="submit" formaction="?/signUp">Sign Up</button>
	</form>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		gap: 1rem;
	}
</style>
