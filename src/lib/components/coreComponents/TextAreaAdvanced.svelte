<script lang="ts">
	interface Props {
		text?: string;
		placeholder?: string;
		rows: any;
		name: any;
		id: any;
		disableShortcuts?: boolean;
	}

	let {
		text = $bindable(''),
		placeholder = 'Input text here...',
		rows,
		name,
		id,
		disableShortcuts = false
	}: Props = $props();

	document.addEventListener('keydown', (event) => {
		if (!disableShortcuts) {
			// ctrl + b for bold
			if (event.ctrlKey && event.key.toLowerCase() === 'b') {
				const selection = window.getSelection();
				if (typeof selection !== 'string') return;
				const selectedText: string = selection as string;
				const boldText: string = `**${selectedText}**`;
				const startIndex = text.indexOf(selectedText);
				const endIndex = startIndex + selectedText.length;
				text = text.slice(0, startIndex) + boldText + text.slice(endIndex);
			}
		}
	});
</script>

<textarea {id} {name} {rows} bind:value={text} {placeholder}></textarea>
