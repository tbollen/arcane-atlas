// IMPORTS
import { type Prefixed_UUID, generatePrefixedUUID } from '$lib/utils/uuid';

// USER ROLE TYPE
export type UserRole = 'admin' | 'plus_user' | 'basic_user' | 'guest';

// USER CLASS
export class User {
	id: Prefixed_UUID<'user'> = generatePrefixedUUID('user');
	username: string = 'New User';
	character_ids: Prefixed_UUID<'character'>[] = [];
	role: UserRole = 'basic_user';

	constructor(username?: string) {
		if (username) {
			this.username = username;
		}
	}
}
