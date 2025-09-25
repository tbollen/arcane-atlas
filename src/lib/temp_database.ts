import { User } from './core/user';
import { Character } from './core/character';

const users: User[] = [];

export function getUsers(): User[] {
	return users;
}

export function addUser(user: User): void {
	users.push(user);
}
