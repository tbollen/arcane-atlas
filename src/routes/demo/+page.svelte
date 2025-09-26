<script lang="ts">
	import { onMount } from 'svelte';

	let items: { id: string; name: string }[] = [];
	let input = '';

	async function loadItems() {
		const res = await fetch('/api/items'); // ✅ fetch server API
		items = await res.json();
	}

	async function addItem() {
		if (!input) return;
		await fetch('/api/items', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: input })
		});
		input = '';
		await loadItems();
	}

	onMount(loadItems);
</script>

<h1>Demo Items</h1>

<input bind:value={input} placeholder="New item..." />
<button on:click={addItem}>Add</button>

<ul>
	{#each items as item}
		<li>{item.name} ({item.id})</li>
	{/each}
</ul>
