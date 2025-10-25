<script lang="ts">
	// UI Component
	import { Button } from '$lib/components/ui/button';
	import * as Alert from '$lib/components/ui/alert';
	import { Spinner } from '$lib/components/ui/spinner';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';

	// Spinner Store
	import { spinner } from '$lib/stores/loadingSpinner.svelte';

	// Partials
	import UnderConstruction from '$lib/components/partials/UnderConstruction.svelte';

	// Typography
	import { Header } from '$lib/components/typography';

	// Navigation
	import { goto, invalidateAll } from '$app/navigation';

	// Type Definitions
	import { type User as PrismaUser } from '@prisma/client';

	import { authClient } from '$lib/utils/auth/auth-client';
	import Icon from '@iconify/svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { onMount } from 'svelte';
	import CARD_API from '$lib/utils/api/cards_api.js';
	import type { CardID } from '$lib/domain/cards/cardStore.svelte';
	import type { UserID } from '$lib/domain/users/user';

	let { data } = $props();
	let user = $derived(data.user) as PrismaUser;

	async function logOut() {
		spinner.set('logOut', 'Logging out...');
		try {
			await authClient.signOut();
		} catch (e) {
			console.error(e);
		}
		spinner.complete();
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
		spinner.set('Sending...', 'emailVerification');
		setTimeout(() => spinner.complete(), 2000);
		try {
			await authClient.sendVerificationEmail({ email: user.email });
		} catch (e) {
			alert(e);
		}
	}
	// Helper for showing spinner when sending

	// DELETE ACCOUNT
	async function deleteAccount() {
		spinner.set('deleteAccount', 'Sending email...');
		if (confirm('Are you sure you want to delete your account?')) {
			try {
				await authClient.deleteUser({ callbackURL: '/login' });
			} catch (e) {
				console.error(e);
			}
		}
		spinner.complete();
	}

	// CARD ACCESS CONTROL
	async function allPublicToPrivate() {
		const confirm = window.confirm('Are you sure you want to make all your cards private?');
		if (!confirm) return;
		if (!data.cardsInfo.publicCards || data.cardsInfo.publicCards.length == 0) {
			alert('You have no public cards!');
			throw new Error('No public cards');
		}
		// Set spinner
		spinner.set('allPublicToPrivate', 'Processing...');
		// API Call
		const res = await CARD_API.setPermissions({
			cards: [],
			ids: data.cardsInfo.publicCards as CardID[],
			permissions: { public: false }
		});
		if (res.ok) {
			spinner.complete();
			invalidateAll();
		}
	}

	async function revokeEditors() {
		const confirm = window.confirm('Are you sure you want to revoke Editor access to all cards?');
		if (!confirm) return;
		if (!data.cardsInfo.cardsWithEditors || data.cardsInfo.cardsWithEditors.length == 0) {
			alert('You have no cards with editors!');
			throw new Error('No cards with editors');
		}
		// Set spinner
		spinner.set('revokeEditors', 'Processing...');
		// API Call
		const res = await CARD_API.setPermissions({
			cards: [],
			ids: data.cardsInfo.cardsWithEditors as CardID[],
			permissions: { editors: [data.user.id] as UserID[] }
		});
		if (res.ok) {
			spinner.complete();
			invalidateAll();
		}
	}

	async function revokeViewers() {
		const confirm = window.confirm('Are you sure you want to revoke Viewer access to all cards?');
		if (!confirm) return;
		if (!data.cardsInfo.cardsWithViewers || data.cardsInfo.cardsWithViewers.length == 0) {
			alert('You have no cards with viewers!');
			throw new Error('No cards with viewers');
		}
		// Set spinner
		spinner.set('revokeViewers', 'Processing...');
		// API Call
		const res = await CARD_API.setPermissions({
			cards: [],
			ids: data.cardsInfo.cardsWithViewers as CardID[],
			permissions: { viewers: [data.user.id] as UserID[] }
		});
		if (res.ok) {
			spinner.complete();
			invalidateAll();
		}
	}
</script>

<main class="mx-auto w-full max-w-3xl">
	{#await user}
		<p>Loading...</p>
	{:then user}
		<Card.Root class="mt-4">
			<Card.Header>
				<Card.Title>
					<div class="flex flex-row gap-2">
						<Avatar.Root class="size-24 ">
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
					<Button variant="blossom" disabled onclick={() => {}}>
						<Icon icon="mdi:pencil" />Edit Account
					</Button>
					<Button variant="destructive" disabled={spinner.id === 'logOut'} onclick={logOut}>
						{#if spinner.id === 'logOut'}
							Logging out...<Spinner />
						{:else}
							<Icon icon="mdi:logout" />Logout
						{/if}
					</Button>
				</Card.Action>
				<Card.Content class="col-span-2 px-0">
					<hr class="divider mb-2" />
					<!-- ACCOUNT INFO -->
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
								<a
									target="_blank"
									href="https://robohash.org"
									class="noLine mt-2 ml-auto text-xs text-muted-foreground hover:underline"
								>
									Courtesy of robohash.org
								</a>
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
								<Button
									variant="bold"
									disabled={spinner.id === 'emailVerification'}
									onclick={resendVerificationEmail}
								>
									{#if spinner.id === 'emailVerification'}
										Sending...<Spinner />
									{:else}
										Resend
									{/if}
								</Button>
							</Alert.Description>
						</Alert.Root>
					{/if}
					<!-- CARDS -->
					<Header variant="h2" class="mt-4 mb-2">Cards</Header>
					<p class="text-muted-foreground">Overview of your cards and cards shared with you</p>
					<!-- CARDS => user owned cards -->
					<div class="fieldGrid mt-2">
						<Header variant="h3" class="col-span-2 mb-2">Your cards</Header>
						<!-- Owned -->
						<h3>Owned</h3>
						<span class="text-muted-foreground">
							You own {data.cardsInfo.ownedCards.length ?? '0'} cards
							{#if data.cardsInfo.ownedCards.length > 0}
								<Button href="/cards?owned=true" variant="link" size="sm" class="ml-auto"
									>View</Button
								>
							{:else}
								<Button href="/cards/new" variant="secondary" size="sm" class="ml-auto">
									Create
								</Button>
							{/if}
						</span>
						<!-- Cards with Co-editors -->
						<h3>Co-editors</h3>
						<span class="text-muted-foreground">
							You have {data.cardsInfo.cardsWithEditors.length ?? '0'} cards with co-editors
							{#if data.cardsInfo.cardsWithEditors.length > 0}
								<Button href="/cards?public=true" variant="link" size="sm" class="ml-auto">
									View
								</Button>
								<Button
									onclick={revokeEditors}
									disabled={spinner.id === 'revokeEditors'}
									variant="destructive"
									size="sm"
								>
									{#if spinner.id === 'revokeEditors'}
										{spinner.message}<Spinner />
									{:else}
										Revoke Access
									{/if}
								</Button>
							{/if}
						</span>
						<!-- Cards with Viewers -->
						<h3>Viewers</h3>
						<span class="text-muted-foreground">
							You have {data.cardsInfo.cardsWithViewers.length ?? '0'} cards with viewers
							{#if data.cardsInfo.cardsWithViewers.length > 0}
								<Button href="/cards?public=true" variant="link" size="sm" class="ml-auto">
									View
								</Button>
								<Button
									onclick={revokeViewers}
									disabled={spinner.id === 'revokeViewers'}
									variant="destructive"
									size="sm"
								>
									{#if spinner.id === 'revokeViewers'}
										{spinner.message}<Spinner />
									{:else}
										Revoke Access
									{/if}
								</Button>
							{/if}
						</span>
						<!-- Public -->
						<h3>Public</h3>
						<span class="text-muted-foreground">
							You have {data.cardsInfo.publicCards.length ?? '0'} marked as "public"
							{#if data.cardsInfo.publicCards.length > 0}
								<Button href="/cards?public=true" variant="link" size="sm" class="ml-auto">
									View
								</Button>
								<Button
									onclick={allPublicToPrivate}
									disabled={spinner.id === 'allPublicToPrivate'}
									variant="destructive"
									size="sm"
								>
									{#if spinner.id === 'allPublicToPrivate'}
										{spinner.message}<Spinner />
									{:else}
										Make all private
									{/if}
								</Button>
							{/if}
						</span>
						<!-- CARDS => Shared with you -->
						<Header variant="h3" class="col-span-2 mt-4 mb-2">Shared with you</Header>
						<!-- Cards you may edit -->
						<h3>Editor</h3>
						<span class="text-muted-foreground">
							You are co-editor of {data.cardsInfo.editorCards.length ?? '0'} cards
							{#if data.cardsInfo.editorCards.length > 0}
								<Button
									href="/cards?canEdit=true&owned=false"
									variant="link"
									size="sm"
									class="ml-auto"
								>
									View
								</Button>
							{/if}
						</span>
						<!-- Cards you may view -->
						<h3>Viewer</h3>
						<span class="text-muted-foreground">
							You are viewer of {data.cardsInfo.viewerCards.length ?? '0'} cards
							{#if data.cardsInfo.viewerCards.length > 0}
								<Button
									href="/cards?canView=true&owned=false"
									variant="link"
									size="sm"
									class="ml-auto"
								>
									View
								</Button>
							{/if}
						</span>
					</div>
					<!-- CAMPAIGNS -->
					<Header variant="h2" class="mt-4 mb-2">Campaigns</Header>
					<!-- TODO -->
					<UnderConstruction />
					<!-- CHARACTERS -->
					<Header variant="h2" class="mt-4 mb-2">Characters</Header>
					<!-- TODO -->
					<UnderConstruction />

					<!-- Account Control -->
					<Header variant="h2" class="mt-4 mb-2">Account Control</Header>
					<div class="flex flex-row items-center gap-2">
						<Button
							variant="destructive"
							disabled={!data.user.emailVerified || spinner.id === 'deleteAccount'}
							onclick={deleteAccount}
						>
							{#if spinner.id === 'deleteAccount'}
								{spinner.message}<Spinner />
							{:else}
								Delete Account
							{/if}
						</Button>
						<p class="text-sm text-muted-foreground">
							{#if data.user.emailVerified}
								*This will delete your account and all of your data.
							{:else}
								*For safety reasons, you must verify your email before you can delete your account.
							{/if}
						</p>
					</div>
				</Card.Content>
			</Card.Header>
		</Card.Root>

		<!-- https://github.com/tbollen/arcane-rift-companion/blob/main/static/legal/terms-and-conditions.md -->
	{:catch error}
		<p>Error: {error.message}</p>
	{/await}
</main>

<style>
	.fieldGrid {
		display: grid;
		grid-template-columns: auto 1fr;
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
		height: 100%;
		min-height: 1.6rem;
		display: inline-flex;
		align-items: center;
	}

	.fieldGrid span {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		height: 100%;
		min-height: 1.6rem;
	}
</style>
