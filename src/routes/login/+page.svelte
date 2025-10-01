<script lang="ts">
	import { onMount } from 'svelte';
	import { authClient } from '$lib/utils/auth/auth-client';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	let nameInput = '';
	let emailInput = '';
	let passwordInput = '';

	let session: any;

	onMount(async () => {
		session = await authClient.getSession();
		if (session && session?.data?.user) goto(`${base}/account`);
	});

	async function signUp() {
		try {
			await authClient.signUp.email({
				email: emailInput,
				password: passwordInput,
				name: nameInput
			});
		} catch (error) {
			console.error(error);
			alert(error);
		}
	}

	async function signIn() {
		try {
			await authClient.signIn.email({
				email: emailInput,
				password: passwordInput
			});
			goto(`${base}/account`);
		} catch (error) {
			console.error(error);
			alert(error);
		}
	}
</script>

<main>
	<h1>Sign In</h1>
	<form on:submit={signIn}>
		<label for="emailInput">Email</label>
		<input type="email" bind:value={emailInput} required />
		<label for="passwordInput">Password</label>
		<input type="password" bind:value={passwordInput} required />
		<button type="submit">Sign In</button>
	</form>
	<br />

	<h1>Sign Up</h1>
	<form on:submit={signUp}>
		<label for="name">Name</label>
		<input type="text" bind:value={nameInput} required />
		<label for="emailInput">Email</label>
		<input type="email" bind:value={emailInput} required />
		<label for="passwordInput">Password</label>
		<input type="password" bind:value={passwordInput} required />
		<button type="submit">Sign Up</button>
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
