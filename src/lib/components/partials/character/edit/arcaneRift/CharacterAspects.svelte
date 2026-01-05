<script lang="ts">
	// UI Components
	import Icon from '@iconify/svelte';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { EditList } from '$lib/components/ui/edit-list';
	import ListItem from '$lib/components/partials/ListItem.svelte';

	// Utils
	import { AR_KEY } from '$lib/gameSystems';
	import { verbose } from '$lib/utils/feedback/verbose';

	// Types
	import { type CharacterEditProps } from '../propsType';

	// Props
	let { character }: CharacterEditProps = $props();

	// Vars for adding
	let newAspectInput: { short: string; description: string } = $state({
		short: '',
		description: ''
	});
</script>

{#if character.mechanics[AR_KEY]?.aspects && character.mechanics[AR_KEY]?.aspects?.length > 0}
	<EditList
		list={character.mechanics[AR_KEY].aspects}
		increase={(index) => verbose(() => character.fn[AR_KEY]!.moveAspect(index, index + 1))}
		decrease={(index) => verbose(() => character.fn[AR_KEY]!.moveAspect(index, index - 1))}
		remove={(index) => verbose(() => character.fn[AR_KEY]!.removeAspect(index))}
	>
		{#snippet item(aspect)}
			<ListItem mainText={aspect.short} subText={aspect.description} />
		{/snippet}
	</EditList>
{/if}
<div id="addAspect" class="flex flex-col gap-2 p-2">
	<Input placeholder="Short name..." bind:value={newAspectInput.short} />
	<Textarea placeholder="Aspect Description..." bind:value={newAspectInput.description} />
	<Button
		onclick={() => {
			verbose(() => {
				character.fn[AR_KEY]!.addAspect(newAspectInput);
				newAspectInput = { short: '', description: '' };
			});
		}}><Icon icon="mdi:plus" /> Add</Button
	>
</div>
