import {
	StoredCharacter,
	type PrismaCharacterExtended
} from '$lib/domain/characters/character.svelte';
import { type User as PrismaUser } from '@prisma/client';

class ActiveCharacter {
	activeCharacter: StoredCharacter | undefined = $state();
	private user: PrismaUser | undefined = $state();
	private dataCharacters: Array<PrismaCharacterExtended> = $state([]);

	setUser(user: PrismaUser) {
		this.user = user;
	}

	setDataCharacters(characters: Array<PrismaCharacterExtended>) {
		this.dataCharacters = characters;
	}

	fromKey(key: string) {
		const characterData = this.dataCharacters.find((char) => char.id === key);
		if (!characterData) {
			throw new Error(`Character with ID ${key} not found in data characters.`);
		}
		this.fromData(characterData);
	}

	fromData(prismaCharacter: PrismaCharacterExtended, userOverride?: PrismaUser) {
		const user = userOverride ?? this.user;
		if (!user) {
			throw new Error('User must be set before setting active character from data.');
		}
		this.activeCharacter = StoredCharacter.fromPrisma({ character: prismaCharacter, user: user });
	}

	set(character: StoredCharacter) {
		this.activeCharacter = character;
	}

	clear() {
		this.activeCharacter = undefined;
	}
}

export const activeCharacter = new ActiveCharacter();
