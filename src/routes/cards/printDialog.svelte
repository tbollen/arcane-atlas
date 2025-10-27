<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Icon from '@iconify/svelte';
</script>

<Dialog.Root>
	<Dialog.Trigger class={buttonVariants({ variant: 'default' })}
		><Icon icon="mdi:printer" />Print</Dialog.Trigger
	>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Print Cards</Dialog.Title>
			<Dialog.Description>Which format do you want to print?</Dialog.Description>
		</Dialog.Header>
		<ul class="list-outside list-disc pl-4 text-sm">
			<li>A4 will print 4 cards per page (4 front and 4 back sides)</li>
			<li>Single with print all front and backsides as individual pages</li>
		</ul>
		<Dialog.Footer>
			<Button href="/cards/print?printMode=A4"><Icon icon="mdi:cards" />A4</Button>
			<Button href="/cards/print?printMode=single"><Icon icon="mdi:view-grid" />Single</Button>
			<Dialog.Close class={buttonVariants({ variant: 'destructive' })}
				><Icon icon="mdi:close" />Cancel</Dialog.Close
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
