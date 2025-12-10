<script lang="ts">
	// Types
	import type { Character as PrismaCharacter, User as PrismaUser } from '@prisma/client';
	// UI Components
	import * as Avatar from '$lib/components/ui/avatar';
	import Icon from '@iconify/svelte';
	import type {
		PrismaCharacterExtended,
		StoredCharacter
	} from '$lib/domain/characters/character.svelte';

	// user and character are passed from layout to this component THROUGH the Navbar component!
	let {
		character
	}: {
		character: PrismaCharacter | PrismaCharacterExtended;
	} = $props();
</script>

<div
	class="grid h-14 w-full cursor-pointer grid-cols-[max-content_1fr] items-center gap-2 overflow-hidden p-2 text-left"
>
	<Avatar.Root class="row-span-2 aspect-square! w-[unset]! rounded-full">
		<!-- If character is selected, show character image, else show user image -->
		<Avatar.Image src={character?.image} />
		<Avatar.Fallback>{character.name.charAt(0)}</Avatar.Fallback>
	</Avatar.Root>
	<div class="overflow-hidden leading-none font-medium text-ellipsis whitespace-nowrap">
		{character.name}
	</div>
	<div
		class="overflow-hidden text-xs leading-none font-normal text-ellipsis whitespace-nowrap text-muted-foreground"
	>
		{character.subtitle}
	</div>
</div>
