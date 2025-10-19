<script lang="ts">
	// Client stuff
	import { onMount } from 'svelte';
	import { authClient } from '$lib/utils/auth/auth-client';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { enhance } from '$app/forms';

	// Server stuff
	import type { PageData } from './$types';

	// UI Components
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card/';
	import { page } from '$app/state';

	let data: PageData = $props();

	let formResponse = $derived(data.formResponse);
	let user = $derived(data.user);

	// Page param for registering / logging in
	let showSignUp: boolean = $state(false);

	$effect(() => {
		console.error(formResponse);
	});

	let session: any;

	onMount(async () => {
		session = await authClient.getSession();
		if (session && session?.data?.user) goto(`${base}/account`);
	});
</script>

<main>
	{#if formResponse?.message}
		<p>{formResponse?.success ? 'Success' : 'Error'}: {formResponse?.message}</p>
	{/if}
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title>Login to your account</Card.Title>
			<Card.Description>Enter your email below to login to your account</Card.Description>
			<Card.Action>
				{#if showSignUp}
					<Button variant="link" onclick={() => (showSignUp = false)}>Sign In</Button>
				{:else}
					<Button variant="link" onclick={() => (showSignUp = true)}>Register</Button>
				{/if}
			</Card.Action>
		</Card.Header>
		<Card.Content>
			<!-- OLD FORM HERE! -->
			<form class="!p-0" method="POST" use:enhance>
				<div class="flex w-full flex-col gap-6">
					{#if showSignUp}
						<div class="grid gap-2">
							<Label for="name">Name</Label>
							<Input name="name" id="name" type="text" placeholder="my name" required />
						</div>
					{/if}
					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input name="email" id="email" type="email" placeholder="m@example.com" required />
					</div>
					<div class="grid gap-2">
						<div class="flex items-center">
							<Label for="password">Password</Label>
							<a href="##" class="ml-auto inline-block text-sm underline-offset-4 hover:underline">
								Forgot your password?
							</a>
						</div>
						<Input name="password" id="password" type="password" required />
					</div>
				</div>
				{#if showSignUp}
					<Button type="submit" variant="bold" formaction="?/signUp" class="w-full">Register</Button
					>
				{:else}
					<Button type="submit" variant="bold" formaction="?/signIn" class="w-full">Login</Button>
					<Button variant="outline" class="w-full" type="submit" formaction="?/signInWithGoogle"
						><Icon icon="logos:github-icon" />Login with Github</Button
					>
					<Button variant="outline" class="w-full"
						><Icon icon="logos:discord-icon" />Login with Discord</Button
					>
				{/if}
			</form>
		</Card.Content>
	</Card.Root>
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
