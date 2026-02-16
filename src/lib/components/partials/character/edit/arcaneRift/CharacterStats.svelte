<script lang="ts">
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';
	import { Header } from '$lib/components/typography';
	import Mastery from '$lib/components/partials/arcaneRift/Mastery.svelte';
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
	<!-- SUM INDICATOR -->
	<p class="mb-4 text-sm text-muted-foreground">
		Total sum: {Object.values(character.mechanics[AR_KEY].stats.characteristics)
			.map((c) => c.value)
			.reduce((sum, val) => sum + val, 0)} /
		{character.mechanics[AR_KEY].rules.characteristics.maxSum}
	</p>
	<!-- CHARACTERISTICS -->
	<div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-8">
		{#each Object.values(character.mechanics[AR_KEY].stats.characteristics) as char}
			{@const rules = character.mechanics[AR_KEY].rules.characteristics}
			{@const maxSumReached =
				Object.values(character.mechanics[AR_KEY].stats.characteristics)
					.map((c) => c.value)
					.reduce((sum, val) => sum + val, 0) >= rules.maxSum}
			<NumberBox
				variant="box"
				label={{ text: char.name, class: 'uppercase' }}
				value={char.value}
				min={rules.minValue}
				max={rules.maxValue}
				onIncrease={() =>
					verbose(() => character.fn[AR_KEY]!.updateCharacteristic(char.name, char.value + 1))}
				onDecrease={() =>
					verbose(() => character.fn[AR_KEY]!.updateCharacteristic(char.name, char.value - 1))}
				disabled={{
					increase: char.value >= rules.maxValue || maxSumReached
				}}
			>
				{#snippet customValue(val)}
					<div class="col-span-full rounded-lg bg-obsidian-200 py-3 text-center text-xl">
						{val}
					</div>
				{/snippet}
			</NumberBox>
		{/each}
	</div>
	<!-- SKILLS -->
	<div id="Skills" class="mt-8">
		<Header variant="h4">Skills</Header>
		<!-- SUM INDICATOR -->
		<p class="text-sm text-muted-foreground">
			Total sum: {Object.values(character.mechanics[AR_KEY].stats.skills)
				.map((c) => c.value)
				.reduce((sum, val) => sum + val, 0)} /
			{character.mechanics[AR_KEY].rules.skills.maxSum}
		</p>
		<section class="mb-4 grid grid-cols-[repeat(auto-fill,minmax(22rem,1fr))] gap-8">
			{#each Object.values(character.mechanics[AR_KEY].stats.characteristics) as char}
				{@const rules = character.mechanics[AR_KEY].rules.skills}
				{@const sum = Object.values(character.mechanics[AR_KEY].stats.skills)
					.map((s) => s.value)
					.reduce((sum, val) => sum + val, 0)}
				{@const maxSumReached = sum >= rules.maxSum}
				<!-- GO THROUGH SKILLS FOR EACH CHARACTERISTIC -->
				<div id="charskills-{char.name}" class="grid grid-cols-[1fr_2fr] gap-x-4 gap-y-1">
					<h5 class="col-span-2 bg-obsidian-800 pl-3 font-semibold text-white uppercase">
						{char.name}
					</h5>
					{#each Object.values(character.mechanics[AR_KEY].stats.skills) as skill}
						{#if skill.characteristic == char.name}
							<!-- Name -->
							<p class="font-semibold">{skill.name}</p>
							<!-- Value controls -->
							<NumberBox
								min={0}
								max={rules.maxMastery}
								disabled={{
									increase: skill.value >= rules.maxMastery || maxSumReached
								}}
								value={skill.value}
								onIncrease={() =>
									verbose(() => character.fn[AR_KEY]!.updateSkill(skill, skill.value + 1))}
								onDecrease={() =>
									verbose(() => character.fn[AR_KEY]!.updateSkill(skill, skill.value - 1))}
							>
								{#snippet customValue(val)}
									<Mastery
										value={val}
										max={rules.maxMastery}
										class="h-8 w-max border-t-2 border-b-2 border-obsidian-500/20 px-3 text-center"
									/>
								{/snippet}
							</NumberBox>
						{/if}
					{/each}
				</div>
			{/each}
		</section>
	</div>
{/if}
