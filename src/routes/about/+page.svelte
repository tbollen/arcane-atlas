<!-- About -->
<script lang="ts">
	// Import UI components
	import Header from '$lib/components/typography/header.svelte';
	import { Button } from '$lib/components/ui/button';

	// Import Partials
	import UnderConstruction from '$lib/components/partials/UnderConstruction.svelte';
	import KofiButton from '$lib/components/partials/branded/kofiButton.svelte';
	import GithubRepoButton from '$lib/components/partials/branded/GithubRepoButton.svelte';

	import renderMarkdown from '$lib/utils/rendering/renderDiceIconsInText';
	const dice = [
		{
			name: 'Proficiency',
			shorthand: '[pr]'
		},
		{
			name: 'Ability',
			shorthand: '[ab]'
		},
		{
			name: 'Setback',
			shorthand: '[sb]'
		},
		{
			name: 'Boost',
			shorthand: '[bo]'
		},
		{
			name: 'Difficulty',
			shorthand: '[di]'
		},
		{
			name: 'Challenge',
			shorthand: '[ch]'
		},
		// Success/Failure
		{
			name: 'Success',
			shorthand: '[su]'
		},
		{
			name: 'Failure',
			shorthand: '[fa]'
		},
		{
			name: 'Despair',
			shorthand: '[de]'
		},
		{
			name: 'Triumph',
			shorthand: '[tr]'
		},
		{
			name: 'Advantage',
			shorthand: '[ad]'
		},
		{
			name: 'Disadvantage',
			shorthand: '[da]'
		}
	];
</script>

<main class="content">
	<Header variant="h1">Arcane Atlas</Header>
	<Header variant="subtitle" class="mb-4">An open-source companion app for TTRPGs</Header>
	<p>
		Arcane Atlas is an open-source companion app for TTRPGs by
		<em>Thomas Bollen</em>. It is designed to help players and game masters during play.
	</p>
	<br />
	<p class="mb-8">
		It began as an online tools for creating standardized spell, weapon and item cards, but is
		growing to be much more! The goal is to create a simple and easy-to-use app that can be used
		during game sessions to quickly access important information, or prepare for the next adventure.
	</p>
	<Header variant="h2" id="supportUs">Support this project</Header>
	<p class="mb-4">
		If you like this project, conside supporting it by donating or contributing on Github! Any
		ideas, suggestions or feedback is welcome!
	</p>
	<div class="mb-8 flex flex-row gap-4">
		<KofiButton />
		<GithubRepoButton />
	</div>
	<Header id="guide">How to use</Header>
	<UnderConstruction class="my-8">
		<p>
			Arcane Atlas is still in beta. A comprehensive guide for how to use the app and what functions
			as hidden in these dungeons is coming soon!
		</p>
	</UnderConstruction>
	<!-- Dice info table -->
	<Header variant="h2" id="diceShorthands">Dice shorthands for cards</Header>
	<p>
		Most text fields in cards support <em>dice shorthands</em>. By filling in the shorthand (for
		example <code>[pr]</code>), the app will replace it with the corresponding icon.
	</p>
	<hr class="divider my-2" />
	<table class="mt-2 w-full">
		<thead>
			<tr class="text-left">
				<th>Dice</th>
				<th>Icon</th>
				<th>Shorthand</th>
			</tr>
		</thead>
		<tbody>
			{#each dice as die}
				<tr>
					<td>{die.name}</td>
					<td>{@html renderMarkdown(die.shorthand)}</td>
					<td>{die.shorthand}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>
