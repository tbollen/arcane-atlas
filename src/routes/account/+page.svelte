<script lang="ts">
	// UI Component
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { Spinner } from '$lib/components/ui/spinner';

	// Navigation
	import { goto, invalidateAll } from '$app/navigation';

	import { authClient } from '$lib/utils/auth/auth-client';
	import Icon from '@iconify/svelte';
	interface Props {
		data: any;
	}

	let { data }: Props = $props();
	let user = $derived(data.user);

	async function logOut() {
		try {
			await authClient.signOut();
		} catch (e) {
			console.error(e);
		}
		invalidateAll(); //Trick to reload context and update Avatar and locals
		console.log('Signed out');
		goto('/login');
	}

	async function resendVerificationEmail() {
		invalidateAll();
		if (user.emailVerified) {
			alert('Email already verified');
			return;
		}
		isSending = true;
		setTimeout(() => (isSending = false), 2000);
		try {
			await authClient.sendVerificationEmail({ email: user.email });
		} catch (e) {
			alert(e);
		}
	}
	// Helper for showing spinner when sending
	let isSending = $state(false);

	// DELETE ACCOUNT
	async function deleteAccount() {
		if (confirm('Are you sure you want to delete your account?')) {
			try {
				await authClient.deleteUser({ callbackURL: '/login' });
			} catch (e) {
				console.error(e);
			}
		}
	}

	console.error('Data:', data);
</script>

<main>
	{#await user}
		<p>Loading...</p>
	{:then user}
		{#if user}
			<h1 class="text-3xl font-bold underline">Account</h1>

			{#if !user.emailVerified}
				<Alert.Root variant="warn">
					<Icon icon="mdi:alert" />
					<Alert.Title>Verify your email</Alert.Title>
					<Alert.Description>
						<p>
							Your email address has not been verified. Please check your inbox for a verification
							or click resend to send the verification email again.
						</p>
						<Button variant="bold" disabled={isSending} onclick={resendVerificationEmail}>
							{#if isSending}
								Sending...<Spinner />
							{:else}
								Resend
							{/if}
						</Button>
					</Alert.Description>
				</Alert.Root>
			{/if}
			<p>Logged in as {user.name}</p>
			<p>Email: {user.email}</p>
			<img src={user.image} alt={user.name} />
			<br />
			<div class="flex flex-row gap-2">
				<Button variant="destructive" onclick={logOut}>Log Out</Button>
				<Button variant="destructive" onclick={deleteAccount}>Delete Account</Button>
			</div>
		{:else}
			<p>Not logged in, redirecting to login</p>
		{/if}
	{:catch error}
		<p>Error: {error.message}</p>
	{/await}
</main>
