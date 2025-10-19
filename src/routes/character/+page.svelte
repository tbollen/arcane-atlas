<!-- @migration-task Error while migrating Svelte code: Cannot bind to derived state -->
<script lang="ts">
	import { onMount } from 'svelte';

	let { data } = $props();

	onMount(async () => {
		// DO LATER
	});
</script>

<main>
	<h1 class="text-3xl font-bold underline">Character Page</h1>
	<sub>UNDER CONSTRUCTION</sub>
	<hr class="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />
	{#if data.user?.name}
		<p>You are currently logged in as <b>{data.user?.name}</b></p>
	{:else}
		<p>You are not logged in</p>
	{/if}
</main>
