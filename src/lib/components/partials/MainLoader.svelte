<script lang="ts">
</script>

<main>
	<div class="loaderContainer">
		<span>Loading...</span>
		<div class="loader"></div>
	</div>
</main>

<style>
	.loaderContainer {
		width: 80%;
		max-width: 540px;
		height: 100%;
		margin: auto auto;
		display: flex;
		flex-direction: column;
		gap: 1em;
		justify-content: center;
		align-items: center;
		/* Box Styling */
		padding: 1em;
		background-color: var(--color-blossom-4);
		border-radius: 1em;
	}

	.loader {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		position: relative;
		animation: rotate 1s linear infinite;
	}
	.loader::before,
	.loader::after {
		content: '';
		box-sizing: border-box;
		position: absolute;
		inset: 0px;
		border-radius: 50%;
		border: 5px solid var(--color-pearl-3);
		animation: prixClipFix 2s linear infinite;
	}
	.loader::after {
		border-color: var(--color-threat-2);
		animation:
			prixClipFix 2s linear infinite,
			rotate 0.5s linear infinite reverse;
		inset: 6px;
	}

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes prixClipFix {
		0% {
			clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0);
		}
		25% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0);
		}
		50% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%);
		}
		75% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%);
		}
		100% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0);
		}
	}
</style>
