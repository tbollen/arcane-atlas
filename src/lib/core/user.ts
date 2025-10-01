// IMPORTS
import { type Prefixed_UUID, generatePrefixedUUID } from '$lib/utils/uuid';

// USER ROLE TYPE
export type UserRole = 'admin' | 'plus_user' | 'basic_user' | 'guest';

// Username validation and Type
export type Username = string & { __brand: 'username' };
export function isValidUsername(username: string): username is Username {
	const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
	return usernameRegex.test(username);
}

export function userNameExists(username: string, users_db: Users): boolean {
	const username_set = new Set(users_db.map((user) => user.username));
	return username_set.has(username as Username);
}

// USER CLASS
export class User {
	id: Prefixed_UUID<'user'> = generatePrefixedUUID('user');
	username: Username;
	nickname: string = 'New User';
	characterIds: Prefixed_UUID<'character'>[] = [];
	campaignIds: Prefixed_UUID<'campaign'>[] = [];
	role: UserRole = 'basic_user';

	constructor(username: Username, nickname?: string) {
		this.username = username;
		this.nickname = nickname ?? 'New User';
	}
}

export type Users = User[];
