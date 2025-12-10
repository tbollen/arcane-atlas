<script lang="ts">
	import DiceIcon from './DiceIcon.svelte';
	import Icon from '@iconify/svelte';
	import type { StoredCharacter } from '$lib/domain/characters/character.svelte';

	import type { HTMLAttributes } from 'svelte/elements';
	let {
		value,
		max,
		class: className
	}: {
		value: number;
		max: number;
		class?: HTMLAttributes<HTMLDivElement>['class'];
	} = $props();

	let borderBoxSize: ResizeObserverSize[] = $state([]);
	let height: number = $derived(borderBoxSize?.[0]?.blockSize ?? 16);
</script>

{#snippet Mastery(index: number, value: number)}
	<div
		class="relative flex aspect-square h-[80%]
		       items-center justify-center overflow-visible"
		style="width: {height * 0.8}px;"
	>
		{#if value >= index}
			<div class="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
				<DiceIcon symbol="triumph" class="text-threat-500" tooltip={false} />
			</div>
		{/if}

		<!-- The visible circle: smaller than the button so the SVG can overlap -->
		<div
			class="relative z-10 flex h-[72%] w-[72%]
			       items-center justify-center rounded-full border-2 border-obsidian-500
			       bg-white/0"
		></div>
	</div>
{/snippet}

<div class="flex w-fit flex-row items-center gap-1 {className}" bind:borderBoxSize>
	{#each { length: max } as x, i}
		{@render Mastery(i + 1, value)}
	{/each}
</div>
