<script lang="ts">
	import { EditList } from '$lib/components/ui/edit-list/';

	let list = $state(['Item 1', 'Item 2', 'Item 3', 'Item 4']);

	let objectList = $state([
		{ name: 'Object 1', value: 10 },
		{ name: 'Object 2', value: 20 },
		{ name: 'Object 3', value: 30 }
	]);
</script>

<main class="content">
	<h1 class="mb-4 text-2xl font-bold">Edit List Demo</h1>

	<EditList
		bind:list={objectList}
		class="max-w-lg"
		onchange={(index) => {
			alert(`List changed at index: ${index}`);
		}}
	>
		{#snippet item(currentItem, index)}
			<button onclick={() => alert(index)} class="flex flex-col text-left">
				<p class="font-bold">{currentItem.name}</p>
				<p class="text-sm text-secondary-foreground">Value: {currentItem.value}</p>
			</button>
		{/snippet}
	</EditList>
</main>
