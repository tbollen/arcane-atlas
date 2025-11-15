import type { CharacterID } from '$lib/domain';

class ActiveCharacter {
	id?: CharacterID = $state();

	set(id: CharacterID | undefined) {
		this.id = id;
	}
}

export const activeCharacter = new ActiveCharacter();
