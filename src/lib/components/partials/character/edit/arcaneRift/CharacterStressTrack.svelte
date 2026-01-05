<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Header } from '$lib/components/typography';
	import { NumberBox } from '$lib/components/ui/number-box';

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
				<NumberBox
					value={stressTrack.max}
					min={1}
					max={rules.maxAllowed}
					onIncrease={() =>
						verbose(() =>
							character.fn[AR_KEY]!.setStressTrackMax(stressTrack.variant, stressTrack.max + 1)
						)}
					onDecrease={() =>
						verbose(() =>
							character.fn[AR_KEY]!.setStressTrackMax(stressTrack.variant, stressTrack.max - 1)
						)}
				/>
			</div>
		{/each}
	</div>
{/if}
