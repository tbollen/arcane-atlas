<script lang="ts">
	import Icon from '@iconify/svelte';
</script>

<div class="w-full">
	<div
		class="relative overflow-hidden rounded-xl p-2 text-foreground"
		aria-hidden="false"
		role="status"
		title="Under construction"
		style="background: repeating-linear-gradient(135deg, #fbbf2455 0 18px, transparent 18px 36px);"
	>
		<div class="flex flex-row items-center justify-center gap-4 text-4xl">
			<Icon icon="roentgen:crane-portal" />
			<h1 class="text-xl">Under Construction</h1>
			<Icon icon="mdi:wrench" />
		</div>
	</div>
</div>
