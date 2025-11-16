<script lang="ts">
	// Types
	import type { Character as PrismaCharacter } from '@prisma/client';
	// UI Components
	import * as Avatar from '$lib/components/ui/avatar';
	import Icon from '@iconify/svelte';
	import { Button } from '$lib/components/ui/button';

	// user and character are passed from layout to this component THROUGH the Navbar component!
	let { user, character }: { user: any; character: PrismaCharacter | undefined } = $props();
</script>

{#if user}
	<!-- If user is logged in -->
	<Button variant="ghost" class="rounded-full pr-4 pl-1" size="default" href="/account">
		<Avatar.Root>
			<!-- If character is selected, show character image, else show user image -->
			<Avatar.Image src={character && character.image ? character.image : user.image} />
			<Avatar.Fallback>{user.name.charAt(0)}</Avatar.Fallback>
		</Avatar.Root>
		<div class="flex-col">
			{#if character}
				<div class="leading-none font-medium">{character.name}</div>
				<div class="text-xs leading-none font-normal text-muted-foreground">{user.name}</div>
			{:else}
				<div class="leading-none font-medium">{user.name}</div>
			{/if}
		</div>
	</Button>
{:else}
	<!-- If user is not logged in -->
	<Button variant="link" size="default" href="/login">
		<Icon icon="mdi:account" />
		<span class="font-normal">Login</span>
	</Button>
{/if}

<style>
</style>
