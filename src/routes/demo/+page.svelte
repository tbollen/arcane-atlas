<script lang="ts">
	import { onMount } from 'svelte';
	import { authClient } from '$lib/utils/auth/auth-client';
	import Button from '$lib/components/coreComponents/Button.svelte';
	import { sign } from 'crypto';

	let emailInput: string = '';
	let passwordInput: string = '';
	let nameInput: string = '';

	async function signUp(
		_email: string = emailInput,
		_password: string = passwordInput,
		_name: string = nameInput
	) {
		if (!_email) throw new Error('Email is required');
		if (!_password) throw new Error('Password is required');
		if (!_name) throw new Error('Name is required');

		try {
			const res = await authClient.signUp.email({
				email: _email,
				password: _password,
				name: _name
			});
		} catch (error) {
			alert(error);
		}
	}

	async function signOut() {
		try {
			await authClient.signOut();
		} catch (error) {
			alert(error);
		}
	}

	async function getSession() {
		return authClient.getSession();
	}

	let sessionPromise = getSession();
	let loading = true;
	let session: any = null;

	sessionPromise
		.then((s) => {
			session = s;
			loading = false;
		})
		.catch((e) => {
			console.error(e);
			loading = false;
		});

	$: console.log(session, loading);

	onMount(() => {
		sessionPromise = getSession();
		loading = true;
	});
</script>

<h1>Demo</h1>
<h2>Login and Auth</h2>

{#if loading}
	<p>Loading...</p>
{:else if session}
	<p>Logged in as {session.data?.user.name}</p>
	<Button on:click={signOut}>Sign Out</Button>
{:else}
	<p>Not logged in</p>
	<Button
		on:click={() => {
			authClient.signIn.email({ email: emailInput, password: passwordInput });
		}}>Sign In</Button
	>
{/if}

<p>{loading ? 'Pending' : 'Ready!'}</p>
<form
	style="display: flex; flex-direction: column;"
	on:submit={() => {
		authClient.signIn.email({ email: emailInput, password: passwordInput });
	}}
>
	<input
		type="email"
		placeholder="Email"
		required
		on:invalid={() => {
			nameInput = '';
		}}
		bind:value={emailInput}
	/>
	<input type="password" placeholder="Password" required bind:value={passwordInput} />
	<input type="submit" value="Sign In" />
</form>
<br />
<br />
<form
	style="display: flex; flex-direction: column;"
	on:submit={() => {
		signUp(emailInput, passwordInput, nameInput);
	}}
>
	<input type="text" placeholder="Name" required bind:value={nameInput} />
	<input
		type="email"
		placeholder="Email"
		required
		on:invalid={() => {
			nameInput = '';
		}}
		bind:value={emailInput}
	/>
	<input type="password" placeholder="Password" required bind:value={passwordInput} />
	<input type="submit" value="Sign Up" />
</form>

<ul>
	{#each [] as item}
		<li>{item}</li>
	{/each}
</ul>
