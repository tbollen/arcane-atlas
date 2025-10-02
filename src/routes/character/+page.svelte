<script lang="ts">
	import { onMount } from 'svelte';
	import { User, userNameExists } from '$lib/core/user';

	let username: string;
	let nickname: string;
	let users: User[] = [];

	async function fetchUsers(): Promise<User[]> {
		const res = await fetch('/api/users');
		users = await res.json();
		return users;
	}

	$: check_userNameExists = userNameExists(username, users);

	async function createUser(): Promise<void> {
		if (!username) throw new Error('Username cannot be empty');
		if (!nickname) throw new Error('Nickname cannot be empty');
		if (userNameExists(username, users)) {
			throw new Error('Username already exists');
		}
		const res = await fetch('/api/users', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username })
		});
		const newUser: User = await res.json();
		users = [...users, newUser];
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
<input type="text" bind:value={nickname} placeholder="Enter nickname" />
{#if check_userNameExists}
	<p style="color: red;">Username already exists!</p>
{/if}
<button on:click={createUser}>Create User</button>

<table>
	<thead>
		<tr>
			<th>Username</th>
			<th>Nickname</th>
			<th>Role</th>
		</tr>
	</thead>
	<tbody>
		{#each users as user}
			<tr>
				<td>{user.username}</td>
				<td>{user.nickname}</td>
				<td>{user.role}</td>
			</tr>
		{/each}
	</tbody>
</table>
