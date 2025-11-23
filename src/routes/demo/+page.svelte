<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	class NestedClass {
		text: string = 'this is a nested string';

		setString(str: string) {
			this.text = str;
		}
	}

	class Test {
		name: string = $state('test');
		nest = $state(new NestedClass());
		test: string = $state('');
		serialized: string = $state('');
		updatedTimestamp: Date = new Date();

		serialize() {
			const _serialized = {
				...this
			};
			this.serialized = JSON.stringify(_serialized);
			return _serialized;
		}

		setTest(str: string) {
			this.test = str;
		}

		update() {
			this.updatedTimestamp = new Date();
			this.serialize();
		}

		constructor() {
			this.serialize();
		}
	}

	let test = new Test();

	let serialized: string = $state('');

	let derivedClassInstance = $derived(test);
	let derivedString = $derived(derivedClassInstance.nest.text);
</script>

<h1 class="text-3xl">This is my TEST</h1>
<p>Test name: {test.name}</p>
<hr class="my-4" />
<p>Nested string: {test.nest.text}</p>
<Button
	onclick={() => {
		test.nest.setString(Math.random().toString());
	}}>Set Nested String (random number)</Button
>
<Button
	onclick={() => {
		test.nest.text = 'Override';
	}}>Override Nested String</Button
>
<hr class="my-4" />
{#if false}
	<p>Top-level string: {test.test}</p>
{/if}
<Button
	onclick={() => {
		test.setTest(Math.random().toString());
	}}>Set Top-level String (random number)</Button
>
<hr class="my-4" />
<Button variant="advanced" onclick={() => test.update()}>Update</Button>
<hr class="my-4" />
<Button
	onclick={() => {
		console.log(test.serialize());
	}}>Serialize</Button
>
<p>Serialized: {test.updatedTimestamp}</p>
