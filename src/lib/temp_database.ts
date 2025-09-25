import { User } from './core/user';
import { Character } from './core/character';

// User DB
const users: User[] = [];

export function getUsers(): User[] {
	return users;
}

export function addUser(user: User): void {
	users.push(user);
}

// Character DB
const characters: Character[] = [];

// get all characters (optionally filtered by userId or campaignId)
export function getCharacters(filter?: { userId?: string; campaignId?: string }): Character[] {
	if (!filter) return characters;
	return characters.filter((c) => {
		if (filter.userId && c.user_id !== filter.userId) return false;
		if (filter.campaignId && c.campaign_id !== filter.campaignId) return false;
		return true;
	});
}

export function addCharacter(character: Character): void {
	characters.push(character);
}
