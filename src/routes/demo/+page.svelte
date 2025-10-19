<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	import { cardStore } from '$lib/stores/CardStore';
	let cardCount = $derived(cardStore.cards.length);
</script>

<Button href="/">Back</Button>
<Button
	variant="advanced"
	onclick={() => {
		console.log(cardStore.serialize());
	}}>Serialize {cardCount} cards</Button
>
<Button
	variant="advanced"
	onclick={() => {
		cardStore.addNew();
	}}>Add Card</Button
>
<Button
	variant="success"
	onclick={() => {
		cardStore.cache();
	}}>Save to Cache</Button
>
<hr class="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />

<h1>Button variants</h1>
<div class="flex gap-4">
	<Button>Default</Button>
	<Button variant="blossom">Blossom</Button>
	<Button variant="bold">Bold</Button>
	<Button variant="advanced">Advanced</Button>
	<Button variant="outline">Outline</Button>
	<Button variant="secondary">Secondary</Button>
	<Button variant="ghost">Ghost</Button>
	<Button variant="link">Link</Button>
</div>

<Label for="text">Text</Label>
<Input type="text" name="text" />
<p class="text-sm text-muted-foreground">Enter your email address.</p>
