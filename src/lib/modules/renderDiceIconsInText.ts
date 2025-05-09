export default function renderMarkdown(text: string | undefined) {
	if (!text) return '...';
	return (
		text
			.replace(/^# (.+)$/gm, '<h1>$1</h1>') // Headings
			.replace(/\*\*([^*]+)\*\*/g, '<em>$1</em>') // Italics
			.replace(/\*(.+?)\*/g, '<strong>$1</strong>') // Bold
			.replace(
				/\[bo\]/g,
				'<span style="font-size: 1.2em; color: var(--blossom);" class="boost dice">&#x25A0</span>'
			)
			.replace(
				/\[sb\]/g,
				'<span style="font-size: 1.2em; color: var(--obsidian);" class="setback dice">&#x25A0</span>'
			)
			.replace(
				/\[ab\]/g,
				'<span style="font-size: 1.1em; color: green;" class="ability dice">&#x25C6</span>'
			)
			.replace(
				/\[di\]/g,
				'<span style="font-size: 1.1em; color: var(--weave);" class="difficulty dice">&#x25C6</span>'
			)
			.replace(
				/\[pr\]/g,
				'<span style="font-size: 1.1em; color: #ffbf00;" class="proficiency dice">&#11042</span>'
			)
			.replace(
				/\[ch\]/g,
				'<span style="font-size: 1.1em; color: var(--threat);" class="challenge dice">&#11042</span>'
			)
			// Failure and successes
			.replace(
				//failure
				/\[fa\]/g,
				'<span style="font-size: 1.2em; color: var(--color-obsidian-1);" class="failure dice">&#x1F5D9</span>'
			)
			.replace(
				//success
				/\[su\]/g,
				'<span style="font-size: 1.2em; color: var(--color-success-3);" class="success dice">&#10039</span>'
			)
			.replace(
				//triumph
				/\[tr\]/g,
				'<span style="font-size: 1.2em; color: #ffbf00;" class="success dice">❂</span>'
			)
			.replace(
				//despair
				/\[de\]/g,
				'<span style="font-size: 1.2em; color: var(--threat);" class="failure dice">☒</span>'
			)
			.replace(
				//advantage
				/\[ad\]/g,
				'<span style="font-size: 1.2em; color: var(--blossom);" class="success dice">▲</span>'
			)
			.replace(
				//disadvantage
				/\[da\]/g,
				'<span style="font-size: 1.2em; color: var(--weave);" class="failure dice">▼</span>'
			)
	);
}
