<!-- About -->
<script lang="ts">
	import Header from '$lib/components/typography/header.svelte';
	// Test with modals

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
	<Header variant="h1" class="mb-8">About this app</Header>
	<!-- Dice info table -->
	<Header variant="h2" addition="divider">Dice shorthands for texts</Header>
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
