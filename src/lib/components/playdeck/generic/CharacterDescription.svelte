<script lang="ts">
	import { type WidgetComponentProps } from '../widget';

	// Import partial wrapper
	import * as Block from '$lib/components/ui/block';

	let { character = $bindable() }: WidgetComponentProps = $props();
</script>

<!-- 
<div class="flex h-full w-full flex-col gap-1 overflow-auto bg-obsidian-500/5">
	<Header variant="h3">Description</Header>
	<p class="overflow-auto text-muted-foreground">{character.description}</p>
</div> -->

<Block.Root>
	<Block.Title title="Description" />
	<Block.Content>
		<p class="overflow-auto text-muted-foreground">{character.description}</p>
	</Block.Content>
	<Block.Footer />
</Block.Root>
