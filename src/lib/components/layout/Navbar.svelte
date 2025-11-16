<script lang="ts">
	// Types
	import type { Character as PrismaCharacter } from '@prisma/client';
	// Stores
	import { activeCharacter } from '$lib/stores/activeCharacter.svelte';
	import type { StoredCharacter } from '$lib/domain/characters/character.svelte';
	// UI Components
	import CharacterAvatar from '$lib/components/layout/CharacterAvatar.svelte';
	// Set Routes
	import { base } from '$app/paths';
	interface BaseRoute {
		path: string;
		name: string;
		icon: string;
		hidden?: boolean;
	}
	interface MasterRoute {
		name: string;
		icon: string;
		path: string;
		hidden?: boolean;
		dropdown: BaseRoute[]; // An array that can contain either a BaseRoute or a MasterRoute, these will display on hover
	}
	const routes: Array<BaseRoute | MasterRoute> = [
		{
			path: '/',
			name: 'Home',
			icon: 'mdi:home',
			hidden: true
		},
		{
			name: 'Campaign',
			icon: 'mdi:book',
			path: 'campaign'
		},
		{
			name: 'Character',
			icon: 'mdi:account',
			path: 'character',
			dropdown: [
				{
					path: 'character',
					name: 'Backstory',
					icon: 'mdi:sword'
				},
				{
					path: 'character_sheet',
					name: 'Character Sheet',
					icon: 'mdi:script'
				}
			]
		},

		{
			name: 'Cards',
			path: 'cards',
			icon: 'mdi:cards'
			// dropdown: [
			// 	{
			// 		path: 'collection',
			// 		name: 'Collection',
			// 		icon: 'mdi:view-grid'
			// 	},
			// 	{
			// 		path: 'edit',
			// 		name: 'Editor',
			// 		icon: 'mdi:pencil'
			// 	}
			// ]
		},

		{
			path: 'about',
			name: 'About',
			icon: 'mdi:information-outline'
		}
	];

	let currentRoute: string = $derived(page.url.pathname);

	// Imports
	import Icon from '@iconify/svelte';
	import { page } from '$app/state';

	// Accept and handle server data
	let { data } = $props();
	let dataCharacters = $derived(data.characters) as PrismaCharacter[];

	// Get active character from store and match from DB for Avatar
	let character: PrismaCharacter | undefined = $derived(
		data.user && $activeCharacter && $activeCharacter.ownerId == data.user.id
			? dataCharacters.find((c) => c.id.toString() == $activeCharacter.id.toString())
			: undefined
	);

	$effect(() => {
		console.log('Active Character:', character);
	});
</script>

<section id="navigation" class="navbar border-b-2 border-threat-500 bg-obsidian-50">
	<div class="z-2">
		<a href="{base}/" id="logo" class="displayText websiteLogo">Arcane Atlas</a>
	</div>
	<!-- Navigation -->
	<nav class="links">
		{#each routes as route}
			{#if route.hidden}
				<!-- Skip hidden routes -->
			{:else if typeof route === 'object' && 'dropdown' in route}
				<!-- Route is a MasterRoute, show dropdown on hover -->
				<div class="navItem navDropdown linkLine">
					<a href="{base}/{route.path}">
						{route.name}
					</a>
					<div class="navDropdownMenu">
						{#each route.dropdown as dropdownRoute}
							<a href="{base}/{dropdownRoute.path}" class="dropdownNavItem">
								<Icon icon={dropdownRoute.icon} />
								{dropdownRoute.name}
							</a>
						{/each}
					</div>
				</div>
			{:else}
				<!-- BaseRoute -->
				<div class="navItem linkLine" class:active={currentRoute === route.path}>
					<a href="{base}/{route.path}">
						<!-- <Icon icon={routes[routeName].icon} /> -->
						{route.name}
					</a>
				</div>
			{/if}
		{/each}
	</nav>
	<!-- Badges -->
	<div class="badges">
		<!-- <a class="badge" href="https://github.com/tbollen/Game_Card_Builder" target="_blank">
			<Icon icon="mdi:github" />
		</a> -->
		<CharacterAvatar user={data.user} {character} />
	</div>
</section>

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
