<script lang="ts">
	// UI Component
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { Spinner } from '$lib/components/ui/spinner';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';

	// Typography
	import { Header } from '$lib/components/typography';

	// Navigation
	import { goto, invalidateAll } from '$app/navigation';

	// Type Definitions
	import { type User as PrismaUser } from '@prisma/client';

	import { authClient } from '$lib/utils/auth/auth-client';
	import Icon from '@iconify/svelte';
	import { Root } from 'postcss';
	import Label from '$lib/components/ui/label/label.svelte';
	interface Props {
		data: any;
	}

	let { data }: Props = $props();
	let user = $derived(data.user) as PrismaUser;

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

<main class="mx-auto w-full max-w-3xl">
	{#await user}
		<p>Loading...</p>
	{:then user}
		<Card.Root class="mt-4">
			<Card.Header>
				<Card.Title>
					<div class="flex flex-row gap-2">
						<Avatar.Root class="size-24">
							<Avatar.Image src={user.image} />
							<Avatar.Fallback>{user.name.charAt(0)}</Avatar.Fallback>
						</Avatar.Root>
						<div>
							<Header variant="subtitle" class="mb-0 h-min">Hello,</Header>
							<Header variant="h1" addition="asFirst">{user.name}</Header>
						</div>
					</div>
				</Card.Title>
				<Card.Action>
					<Button variant="destructive" onclick={logOut}>Logout</Button>
				</Card.Action>
				<Card.Content class="col-span-2 px-0">
					<hr class="divider mb-2" />
					<!-- ACCOUNT STUFF HERE -->
					<Header variant="h2" addition="asFirst" class="mb-2">Account Info</Header>
					<div class="fieldGrid">
						<!-- Email -->
						<h3>Email</h3>
						{#if user.emailVerified}
							<span class="text-muted-foreground" title="Email verified!">
								{user.email}
								<Icon icon="material-symbols:verified" class="text-blossom-500" />
							</span>
						{:else}
							<span class="text-muted-foreground" title="Email not verified">
								{user.email}
								<Icon icon="mdi:warning" class="text-orange-700" />
							</span>
						{/if}
						<!-- Name (display name) -->
						<h3>Name</h3>
						<span class="text-muted-foreground">{user.name}</span>
						<!-- Image -->
						<h3>Image</h3>
						<span class="text-muted-foreground">
							{user.image}
							{#if user.image?.includes('robohash')}
								<span class=" ml-auto text-sm text-muted-foreground"
									>Courtesy of <a
										target="_blank"
										class="hover:underline"
										href="https://robohash.org">robohash.org</a
									></span
								>
							{/if}
						</span>
					</div>

					<!-- Warning banner if email not verified -->
					{#if !user.emailVerified}
						<Alert.Root variant="warn" class="mt-4">
							<Icon icon="mdi:alert" />
							<Alert.Title>Verify your email</Alert.Title>
							<Alert.Description>
								<p>
									Your email address has not been verified. Please check your inbox for a
									verification or click resend to send the verification email again.
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
				</Card.Content>
			</Card.Header>
		</Card.Root>

		<!-- https://github.com/tbollen/arcane-rift-companion/blob/main/static/legal/terms-and-conditions.md -->

		<p>Logged in as {user.name}</p>
		<p>Email: {user.email}</p>
		<img src={user.image} alt={user.name} />
		<br />
		<div class="flex flex-row gap-2">
			<Button variant="destructive" onclick={logOut}>Log Out</Button>
			<Button variant="destructive" onclick={deleteAccount}>Delete Account</Button>
		</div>
	{:catch error}
		<p>Error: {error.message}</p>
	{/await}
</main>

<style>
	.fieldGrid {
		display: grid;
		grid-template-columns: min-content 1fr;
		column-gap: 0;
		--rowgap: 0.5rem;
		row-gap: var(--rowgap);
		align-items: center;
	}

	.fieldGrid * {
		position: relative;
	}

	/* Horizontal line for every child except the last 2 */
	.fieldGrid *:not(.noLine):after {
		content: ' ';
		position: absolute;
		bottom: calc(var(--rowgap) / -2);
		background-color: currentColor;
		opacity: 0.1;
		z-index: 1;
		block-size: 0.5px;
		inset-inline-start: 0;
		inset-inline-end: 0;
	}

	.fieldGrid h3 {
		font-weight: 500;
		padding-right: 0.5rem;
	}

	.fieldGrid span {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}
</style>
