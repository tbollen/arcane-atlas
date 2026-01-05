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
</script>

<!-- Safeguard -->
{#if character.mechanics[AR_KEY]}
	<!-- TODO -->
	<p class="text-muted-foreground">Manage the consequences your Arcane Rift character can face.</p>
{/if}
