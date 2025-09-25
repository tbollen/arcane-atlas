<script lang="ts">
	import { onMount } from 'svelte';
	import { User } from '$lib/core/user';

	let username: string = 'New User';
	let users: User[] = [];

	async function fetchUsers(): Promise<User[]> {
		const res = await fetch('/api/users');
		users = await res.json();
		return users;
	}

	async function createUser(): Promise<void> {
		if (!username.trim()) throw new Error('Username cannot be empty');
		const res = await fetch('/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username })
		});
		const newUser: User = await res.json();
		users = [...users, newUser];
		username = 'New User'; // Reset input field
	}

	onMount(async () => {
		fetchUsers();
		console.log('Users from server:', users);
	});
</script>

<h1>Character</h1>
<ul>
	<li>ID</li>
	<li>Name</li>
	<li>Avatar</li>
	<li>Stats</li>
	<li>Story</li>
	<li>Cards</li>
</ul>

<h2>Users (TEST)</h2>
<input type="text" bind:value={username} placeholder="Enter username" />
<button on:click={createUser}>Create User</button>

<ul>
	{#each users as user}
		<li>{user.id}: {user.username} (Role: {user.role})</li>
	{/each}
</ul>
