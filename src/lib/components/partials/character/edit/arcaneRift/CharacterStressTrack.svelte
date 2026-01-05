<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Header } from '$lib/components/typography';

	// Utils
	import { AR_KEY } from '$lib/gameSystems';
	import { verbose } from '$lib/utils/feedback/verbose';

	// Types
	import { type CharacterEditProps } from '../propsType';

	// Props
	let { character }: CharacterEditProps = $props();
</script>

{#if character.mechanics[AR_KEY]}
	<p class="mb-4 text-sm text-muted-foreground">
		Adjust the maximum values for each stress track below
	</p>
	<div class="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-x-8 gap-y-4">
		{#each character.mechanics[AR_KEY].stressTracks as stressTrack}
			{@const rules = character.mechanics[AR_KEY].rules.stressTracks}
			<div class="flex flex-row items-center gap-4">
				<!-- TRACK INFO -->
				<div class="min-w-0 flex-1">
					<Header variant="h4">{stressTrack.variant} Stress</Header>
					<p
						class="text-sm text-muted-foreground {stressTrack.max >= rules.maxAllowed
							? 'text-amber-600'
							: ''}"
					>
						Max value: {stressTrack.max} / {rules.maxAllowed}
					</p>
				</div>
				<!-- Value controls -->
				<div
					id="char-{stressTrack.variant}-valuecontrol"
					class="flex w-max flex-shrink-0 items-center gap-2"
				>
					<Button
						variant="bold"
						disabled={stressTrack.max <= 1}
						onclick={() =>
							verbose(() =>
								character.fn[AR_KEY]!.setStressTrackMax(stressTrack.variant, stressTrack.max - 1)
							)}><Icon icon="mdi:minus" /></Button
					>
					<div
						class="flex h-8 w-14 items-center justify-center border-t-2 border-b-2 border-obsidian-500/20 px-3"
					>
						{stressTrack.max}
					</div>
					<Button
						variant="bold"
						disabled={stressTrack.max >= rules.maxAllowed}
						onclick={() =>
							verbose(() =>
								character.fn[AR_KEY]!.setStressTrackMax(stressTrack.variant, stressTrack.max + 1)
							)}><Icon icon="mdi:plus" /></Button
					>
				</div>
			</div>
		{/each}
	</div>
{/if}
