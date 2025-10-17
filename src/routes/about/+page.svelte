<!-- About -->
<script lang="ts">
	// Test with modals
	import Dialog from '$lib/components/dialog/Dialog.Core.svelte';
	import Button from '$lib/components/coreComponents/Button.svelte';

	import dialog from '$lib/components/dialog/dialogs';

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

	// Version info
	const lastUpdated = import.meta.env.VITE_LAST_UPDATED;
	console.log(import.meta.env);
</script>

<section id="content">
	<h1 class="text-3xl font-bold underline">About this app</h1>
	<!-- Dice info table -->
	<hr />
	<h3>Dice shorthands for texts</h3>
	<table class="w-full">
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
</section>

<style>
	section {
		padding: var(--padding);
	}
</style>
