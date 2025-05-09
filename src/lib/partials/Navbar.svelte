<script lang="ts">
	import CharacterAvatar from './CharacterAvatar.svelte';
	// Set Routes
	import { base } from '$app/paths';
	interface BaseRoute {
		path?: string;
		name: string;
		icon: string;
		hidden?: boolean;
	}
	interface MasterRoute {
		name: string;
		icon: string;
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
			hidden: true,
			dropdown: [
				{
					path: 'overview',
					name: 'Overview',
					icon: 'mdi:view-grid'
				}
			]
		},
		{
			name: 'Character',
			icon: 'mdi:account',
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
			icon: 'mdi:cards',
			dropdown: [
				{
					path: 'collection',
					name: 'Overview',
					icon: 'mdi:view-grid'
				},
				{
					path: 'edit',
					name: 'Editor',
					icon: 'mdi:pencil'
				}
			]
		},

		{
			path: 'about',
			name: 'About',
			icon: 'mdi:information-outline'
		}
	];

	const character = {
		name: 'Neovald',
		id: 'neovald',
		image: 'https://robohash.org/Neovald'
	};
	let currentRoute: string;
	$: currentRoute = $page.url.pathname;

	// Imports
	import Icon from '@iconify/svelte';
	import { page } from '$app/stores';
</script>

<section id="navigation" class="navbar">
	<a href="{base}/" id="logo" class="displayText websiteLogo">Card Builder</a>
	<!-- Navigation -->
	<nav class="links">
		{#each routes as route}
			{#if route.hidden}
				<!-- Skip hidden routes -->
			{:else if typeof route === 'object' && 'dropdown' in route}
				<!-- Route is a MasterRoute, show dropdown on hover -->
				<div class="navItem navDropdown navUnderline">
					{route.name}
					<div class="navDropdownMenu">
						{#each route.dropdown as dropdownRoute}
							<div class="dropdownNavItem">
								<Icon icon={dropdownRoute.icon} />
								<a href="{base}/{dropdownRoute.path}"> {dropdownRoute.name}</a>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<!-- BaseRoute -->
				<div class="navItem navUnderline" class:active={currentRoute === route.path}>
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
		<CharacterAvatar {character} />
	</div>
</section>

<style>
	#navigation {
		display: grid;
		height: var(--navbar-height, 3rem);
		box-sizing: border-box;
		/* Keep it centered */
		grid-template-columns: 1fr min-content 1fr;
		padding: 5px;
		align-items: center;
		/* Areas */
		grid-template-areas: 'logo links badges';
	}

	@media screen and (max-width: 750px) {
		#navigation {
			grid-template-columns: 1fr;
			grid-template-areas: 'logo badges' 'links links';
		}
	}

	.links {
		/* Placement */
		grid-area: links;
		/* Layout */
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}

	.navItem {
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
		height: calc-size(0px, size);
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
		height: calc-size(auto, size);
	}

	.navItem a,
	.navDropdownMenu a {
		color: unset;
		text-wrap: nowrap;
		text-decoration: unset;
	}

	.navUnderline::after {
		content: ' ';
		/* Placement */
		position: absolute;
		z-index: -1;
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

	.navItem:hover {
		font-weight: bold;
	}

	.dropdownNavItem:hover {
		background-color: var(--color-threat-4);
	}

	.navUnderline:hover::after {
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

	.websiteLogo::before {
		content: 'Card Builder';
		position: absolute;
		z-index: -1;
		inset: 0;
		background: linear-gradient(90deg, var(--color-threat-2), var(--color-weave-2));
		background-clip: inherit;
	}

	.websiteLogo:hover {
		background: transparent;
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
