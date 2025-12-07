<script lang="ts">
	// Svelte
	import { goto, invalidateAll } from '$app/navigation';
	// Types
	import type { Character as PrismaCharacter } from '@prisma/client';
	import type { WidthLayout } from '../../../routes/+layout.svelte';
	// Stores
	import { activeCharacter } from '$lib/stores/activeCharacter.svelte';
	import type { StoredCharacter } from '$lib/domain/characters/character.svelte';
	import { spinner } from '$lib/stores/loadingSpinner.svelte';
	// UI Components
	import CharacterAvatar from '$lib/components/layout/CharacterAvatar.svelte';
	// Toasts
	import { toast } from 'svelte-sonner';
	// Import Partials
	import KofiButton from '$lib/components/partials/branded/kofiButton.svelte';
	import GithubRepoButton from '$lib/components/partials/branded/GithubRepoButton.svelte';

	// AUTH
	import { authClient } from '$lib/utils/auth/auth-client';

	// Page and Data
	import { page } from '$app/state';
	import { type LayoutData } from '../../../routes/$types';

	// UI
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button/';
	import * as Drawer from '$lib/components/ui/drawer/';
	import * as Avatar from '$lib/components/ui/avatar/';
	import Link from '$lib/components/ui/link/link.svelte';
	import * as ButtonGroup from '$lib/components/ui/button-group/';
	import * as Select from '$lib/components/ui/select/';

	interface BaseRoute {
		path: string;
		name: string;
		icon: string;
		visibility?: boolean | 'drawerOnly';
		description: string;
		requiresLogin?: boolean;
		disabled?: boolean;
	}
	const routes: Array<BaseRoute> = [
		{
			path: '/',
			name: 'Home',
			icon: 'mdi:home',
			visibility: false,
			description: 'The homepage of Arcane Atlas'
		},
		{
			name: 'Campaign',
			icon: 'mdi:book',
			path: 'campaign',
			description: 'Campaign overview and management',
			requiresLogin: true
		},
		{
			name: 'Character',
			icon: 'mdi:account',
			path: 'character',
			description: 'Character management and details',
			requiresLogin: true
		},

		{
			name: 'Cards',
			path: 'cards',
			icon: 'mdi:cards',
			description: 'Card collection and editor'
		},

		{
			name: 'Playdeck',
			path: 'playdeck',
			icon: 'mdi:view-dashboard',
			description: 'Playdeck management and gameplay',
			requiresLogin: true
		},

		{
			path: 'about',
			name: 'About',
			icon: 'mdi:information-outline',
			description: 'How to use Arcane Atlas'
		}
	];

	// General routes accessible to all users
	const generalRoutes: Array<BaseRoute> = [
		{
			name: 'About',
			icon: 'mdi:information-outline',
			description: 'Learn more about Arcane Atlas',
			path: 'about'
		}
	];

	// Routes for managing things during downtime
	const backstageRoutes: Array<BaseRoute> = [
		{
			name: 'Campaigns',
			icon: 'mdi:book-open-variant',
			description: 'Manage my campaigns',
			requiresLogin: true,
			path: 'campaigns'
		}
	];

	// Routes for play (filtered)
	const playRoutes: Array<BaseRoute> = $derived([
		{
			name: 'Deck',
			path: 'playdeck',
			icon: 'mdi:view-dashboard',
			description: 'Manage and play with your deck',
			requiresLogin: true
		},
		{
			name: 'Campaign', //TODO: dynamic set name from campaign data
			path: 'campaign', //TODO change to play/campaign/[id] when implemented
			icon: 'mdi:book-open-variant',
			description: 'View campaign details',
			requiresLogin: true
		},
		{
			name: 'Cards',
			path: $activeCharacter ? `cards?character=${$activeCharacter.id}` : 'cards',
			icon: 'mdi:cards',
			description: 'Card collection and editor'
		}
	]);

	// CURRENT ROUTE / ACTIVE LINK HANDLING
	let currentRoute: string = $derived(page.route.id ?? '/');
	let currentMode: 'backstage' | 'play' = $derived(
		playRoutes.some((route) => route.path === currentRoute.slice(1)) ? 'play' : 'backstage'
	);

	// Accept and handle server data
	let {
		data,
		layout,
		borderBoxSize = $bindable([])
	}: { data: LayoutData; layout: WidthLayout; borderBoxSize: ResizeObserverSize[] } = $props();

	let dataCharacters = $derived(data.characters) as PrismaCharacter[];

	// Get active character from store and match from DB for Avatar
	let character: PrismaCharacter | undefined = $derived(
		data.user && $activeCharacter && $activeCharacter.ownerId == data.user.id
			? dataCharacters.find((c) => c.id.toString() == $activeCharacter.id.toString())
			: undefined
	);

	// LAYOUT AND RESPONSIVENESS HANDLING
	let narrowLayout: boolean = $derived(layout === 'narrow');
	let mobileLayout: boolean = $derived(layout === 'mobile');

	// Drawer state
	let drawerOpen: boolean = $state(false);

	function closeDrawer() {
		drawerOpen = false;
	}

	// LOGGING OUT FUNCTION
	async function logOut() {
		const confirmLogOut = confirm('Are you sure you want to log out?');
		if (!confirmLogOut) return;
		spinner.set('logOut', 'Logging out...');
		try {
			await authClient.signOut();
			toast.success('Successfully logged out.');
		} catch (e) {
			toast.error('Error logging out. Please try again.');
			console.error(e);
		}
		spinner.complete();
		invalidateAll(); //Trick to reload context and update Avatar and locals
		console.log('Signed out');
	}
</script>

<header
	bind:borderBoxSize
	class="sticky top-0 z-1
	grid grid-cols-[1fr_max-content_1fr] items-center justify-center gap-3
	border-b-2 border-threat-500 bg-obsidian-50
px-4 py-2 print:hidden"
>
	<!-- LOGO -->
	<div class="z-2">
		<a href="/" id="logo" class="displayText websiteLogo relative">
			{#if mobileLayout}
				<span>A</span>
			{:else}
				<span>Arcane Atlas</span>
			{/if}
		</a>
	</div>
	<!-- Navigation -->
	{#if mobileLayout}
		<nav class="flex justify-center gap-4">
			{#each routes as route}
				<Button variant="link" class="text-lg" href={route.path}>
					<Icon icon={route.icon} mode="bg" />
				</Button>
			{/each}
		</nav>
	{:else}
		<nav class="flex flex-row justify-center gap-6">
			{#each routes as route}
				{#if route.visibility === false}
					<!-- Skip hidden routes -->
				{:else}
					<!-- BaseRoute -->
					<Link
						href="/{route.path}"
						active={currentRoute == `/${route.path}`}
						tooltip={route.description}
						variant="line"
						onclick={closeDrawer}
					>
						{route.name}
					</Link>
				{/if}
			{/each}
		</nav>
	{/if}

	<!-- Badges -->
	<div class="flex justify-end">
		<!-- <a class="badge" href="https://github.com/tbollen/Game_Card_Builder" target="_blank">
			<Icon icon="mdi:github" />
		</a> -->
		<!-- <CharacterAvatar user={data.user} {character} /> -->
		<Button variant="ghost" class="badge ml-2 text-xl" onclick={() => (drawerOpen = true)}>
			<Icon icon="mdi:menu" mode="bg" />
		</Button>
	</div>
	<Drawer.Root bind:open={drawerOpen} direction={mobileLayout ? 'bottom' : 'right'}>
		<Drawer.Content>
			<Drawer.Header>
				<Drawer.Title>
					<div class="flex flex-row justify-between">
						<a href="/" onclick={closeDrawer} class="displayText text-3xl">Arcane Atlas</a>
						<Drawer.Close>
							<Button variant="ghost" class="rounded-full text-xl opacity-70 hover:opacity-100">
								<Icon icon="mdi:menu-close" mode="bg" />
							</Button>
						</Drawer.Close>
					</div>
					<hr class="my-2 border-threat-500" />
				</Drawer.Title>
			</Drawer.Header>
			<div id="drawerBody" class="flex h-full flex-col overflow-y-auto px-4">
				<!-- USER INFO -->
				{#if data.user}
					<a
						href="/account"
						class="mb-4 flex flex-row items-center gap-4 rounded-full p-2 hover:bg-obsidian-500/10"
						onclick={closeDrawer}
					>
						<Avatar.Root class="size-12">
							<Avatar.Image
								src={data.user.image ?? undefined}
								alt={data.user.name ?? 'User Avatar'}
							/>
							<Avatar.Fallback>
								<Icon icon="mdi:account-circle" class="size-12 text-muted-foreground" />
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="flex flex-col">
							<span class="font-semibold">{data.user.name}</span>
							<span class="text-sm text-muted-foreground">{data.user.email}</span>
						</div>
						<Button
							onclick={logOut}
							spinner={{ id: 'logOut', keepMessage: true }}
							variant="ghost"
							class="ml-auto"
						>
							<Icon icon="mdi:logout" />
						</Button>
					</a>
				{:else}
					<div class="mb-4 flex flex-row items-center gap-4">
						<p class="text-muted-foreground">Log in to access all features.</p>
						<Button href="/login" onclick={closeDrawer} variant="bold" class="mr-2">Log in</Button>
					</div>
				{/if}

				<hr class="my-2 border-obsidian-500/25" />

				<nav class="flex flex-col gap-2 py-2">
					<!-- MODES -->
					<ButtonGroup.Root>
						<Button
							onclick={() => (currentMode = 'backstage')}
							variant={currentMode === 'backstage' ? 'bold' : 'default'}>Backstage</Button
						>
						<Button
							onclick={() => (currentMode = 'play')}
							variant={currentMode === 'play' ? 'bold' : 'default'}>Play</Button
						>
					</ButtonGroup.Root>
					<!-- LINKS -->
					{#if currentMode === 'backstage'}
						{#each backstageRoutes as route}
							{#if route.visibility === false}
								<!-- Skip hidden routes -->
							{:else if !route.requiresLogin || (route.requiresLogin && data.user)}
								<!-- BaseRoute -->
								<a
									href="/{route.path}"
									class="flex flex-col gap-1 rounded-full px-4 py-2 hover:bg-obsidian-500/10"
								>
									<Link
										href="/{route.path}"
										active={currentRoute == `/${route.path}`}
										variant="lineLeft"
										class="w-max justify-start"
										onclick={closeDrawer}
									>
										<div class="flex flex-row items-center gap-2">
											<Icon icon={route.icon} class="text-inherit" />
											<span>{route.name}</span>
										</div>
									</Link>
									{#if !mobileLayout}
										<p class="text-sm text-muted-foreground">{route.description}</p>
									{/if}
								</a>
							{/if}
						{/each}
					{:else if currentMode === 'play'}
						<!-- CHARACTER SELECTION -->
						<Select.Root type="single">
							<Select.Trigger class="w-full">Cheese</Select.Trigger>
							<Select.Content class="w-full">
								{#each data.characters as character}
									<Select.Item value={character.id}>
										{character.name}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						{#each playRoutes as route}
							{#if route.visibility === false}
								<!-- Skip hidden routes -->
							{:else if !route.requiresLogin || (route.requiresLogin && data.user)}
								<!-- BaseRoute -->
								<a
									href="/{route.path}"
									class="flex flex-col gap-1 rounded-full px-4 py-2 hover:bg-obsidian-500/10"
								>
									<Link
										href="/{route.path}"
										active={currentRoute == `/${route.path}`}
										variant="lineLeft"
										class="w-max justify-start"
										onclick={closeDrawer}
									>
										<div class="flex flex-row items-center gap-2">
											<Icon icon={route.icon} class="text-inherit" />
											<span>{route.name}</span>
										</div>
									</Link>
									{#if !mobileLayout}
										<p class="text-sm text-muted-foreground">{route.description}</p>
									{/if}
								</a>
							{/if}
						{/each}
					{/if}
				</nav>
				<Button
					variant="bold"
					class={mobileLayout ? 'mt-4' : 'mt-auto'}
					href="playdeck"
					onclick={closeDrawer}>Start playing!</Button
				>
			</div>
			<!-- CONTENT GOES HERE -->
			<Drawer.Footer>
				<hr class="my-2 border-threat-500" />
				<div class="flex w-full flex-row justify-center gap-4">
					<KofiButton variant="secondary" />
					<GithubRepoButton variant="secondary" />
				</div>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
</header>

<style>
	#navigation {
		display: grid;
		box-sizing: border-box;
		/* Keep it centered */
		grid-template-columns: max-content 1fr max-content;
		padding: 5px;
		align-items: center;
		/* Areas */
		grid-template-areas: 'logo links badges';
		padding-inline: min(1rem, 3vw);
		/* Make sticky */
	}

	@media screen and (max-width: 920px) {
		#navigation {
			grid-template-columns: 1fr;
			grid-template-areas: 'logo badges' 'links links';
			padding-inline: 2.5mm;
		}
	}

	.links {
		/* Placement */
		grid-area: links;
		/* Layout */
		display: flex;
		gap: 1.5rem;
		align-items: center;
		justify-content: center;
	}

	.navItem {
		/* Unset default link properties */
		color: unset;
		text-decoration: unset;
		/* Layout */
		display: flex;
		flex-direction: column;
		align-items: center;
		height: min-content;
		font-weight: normal;
		padding: 4px;
		/* For active state */
		position: relative;
		padding: 2px 4px;
		transition:
			color,
			font-weight 0.2s ease-in-out;
	}

	.navDropdown {
		position: relative;
	}

	.navDropdownMenu {
		/* Placement */
		position: absolute;
		top: 100%;
		left: 0;
		/* Layout */
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 0.2em;
		/* Sizing */
		height: 0px; /*Fallback for other browsers*/
		height: calc-size(0px, size); /*Works only in Chrome!*/
		overflow: hidden;
		width: min-content;
		min-width: max(100%, 8rem);
		/* Styling */
		background-color: var(--color-pearl-3);
		border-radius: 5px;
		/* Animate */
		transition: height 0.2s ease-in-out;
	}

	.dropdownNavItem {
		display: relative;
		font-weight: normal;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 8px;
	}

	.navItem:hover .navDropdownMenu {
		/* Transition to auto size, fallback added for non-chrome browsers */
		height: auto;
		height: calc-size(auto, size);
	}

	.navItem a,
	.navDropdownMenu a {
		color: unset;
		text-wrap: nowrap;
		text-decoration: unset;
	}

	.linkLine {
		position: relative;
	}

	.linkLine::after {
		content: ' ';
		/* Placement */
		position: absolute;
		z-index: 0;
		bottom: 0;
		/* effect */
		--width: 0;
		left: calc(50% - var(--width) / 2);
		width: var(--width);
		/* Styling */
		height: 2px;
		background-color: var(--color-threat-2);
		/* Transition */
		transition: all 0.2s ease-in-out;
	}

	.active {
		font-weight: bold;
	}

	.active::after {
		--width: 100%;
	}

	.dropdownNavItem:hover {
		background-color: var(--color-threat-4);
	}

	.linkLine:hover::after {
		--width: 50%;
		background-color: var(--color-threat-2);
	}

	.websiteLogo {
		/* Grid Placement */
		grid-area: logo;
		/* Reset href properties */
		color: unset;
		text-decoration: unset;
		/* Styling */
		position: relative;
		font-size: 2rem;
		/* Add bg clipping */
		background: black;
		background-clip: text;
		-webkit-text-fill-color: transparent;
		transition: all 0.2s ease-in-out;
	}

	.websiteLogo::after {
		content: '';
		position: absolute;
		inset: 0;
		height: 100%;
		width: 100%;
		z-index: -1;
		background: linear-gradient(90deg, var(--color-threat-2), var(--color-weave-2));
		background-clip: inherit;
	}

	.websiteLogo:hover {
		background: var(--color-weave-2);
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.badges {
		/* Placement */
		grid-area: badges;
		/* Layout */
		display: flex;
		justify-content: end;
		align-items: center;
	}

	.badge {
		font-size: 1.5em;
		transition: all 0.2s ease-in-out;
		color: var(--color-text-2);
	}

	.badge:hover {
		color: var(--color-threat-2);
	}
</style>
