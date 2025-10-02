<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<Button href="/">Back</Button>
Demo page
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
