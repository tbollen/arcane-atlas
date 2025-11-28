<script lang="ts">
	import { type WidgetComponentProps } from '../widget';

	// Import UI components
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Header } from '$lib/components/typography';
	import Icon from '@iconify/svelte';
	import * as Dialog from '$lib/components/ui/dialog';

	let { character = $bindable() }: WidgetComponentProps = $props();

	// Component sizing and styling
	let borderBoxSize: ResizeObserverSize[] = $state([]);

	let height: number = $derived(borderBoxSize?.[0]?.blockSize ?? 0);
	let width: number = $derived(borderBoxSize?.[0]?.inlineSize ?? 0);

	let largeHeight = $derived(height > 120);
	let largeWidth = $derived(width > 300);
	let aspectRatio = $derived(width / height);

	$effect(() => {
		console.log('PlayerBanner', { height, width, aspectRatio });
	});
</script>

<div
	id="playerBanner"
	class=" relative h-full w-full bg-obsidian-500/5 text-start"
	bind:borderBoxSize
>
	{#if aspectRatio > 1}
		<div id="banner" class="flex h-full w-full flex-row items-center gap-4 px-4 py-2">
			<div id="nameBlock" class="flex flex-grow flex-col">
				<p class="displayText {largeHeight && largeWidth ? 'text-4xl' : 'text-2xl'}">
					{character.name}
				</p>
				<p class="text-md text-muted-foreground">{character.subtitle}</p>
			</div>
			<img
				class="aspect-square h-full rounded-full object-cover"
				src={character.imageUrl}
				alt={character.name}
			/>
		</div>
	{:else}
		<div id="banner" class="flex h-full w-full flex-col items-center gap-4">
			<div
				class="absolute top-0 left-0 max-w-[80%] rounded-br-lg bg-obsidian-900 py-0.5 pr-6 pl-2 text-white"
			>
				<p
					class="displayText overflow-hidden text-2xl text-nowrap overflow-ellipsis whitespace-nowrap"
				>
					{character.name}
				</p>
			</div>
			{#if height > 240}
				<div
					class="absolute right-0 bottom-0 max-w-[80%] rounded-tl-lg bg-obsidian-900 px-2 py-0.5 text-white"
				>
					<p
						class="text-md overflow-hidden text-nowrap overflow-ellipsis whitespace-nowrap text-white/80"
					>
						{character.subtitle}
					</p>
				</div>
			{/if}
			<img class="h-full object-cover" src={character.imageUrl} alt={character.name} />
		</div>
	{/if}
</div>
