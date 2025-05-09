type CharacterRequired {
    name: {
        full: string;
    }
    description: string;
    aspects: string[];
}

type CharacterOptional {
    name: {
        first?: string;
        middle?: string;
        last?: string;
    };
    thumbnail: string;
}

export class Character implements CharacterRequired, CharacterOptional {
    name: {
        full: string;
        first?: string;
        middle?: string;
        last?: string;
    };
    description: string;
    thumbnail: string;
    aspects: string[];
    owner: string;

    

    constructor(data: CharacterRequired & Partial<CharacterOptional>) {
        this.owner = 'user';
        this.name = {
            full: data.name.full,
            first: data.name.first || '',
            middle: data.name.middle || '',
            last: data.name.last || ''
        };
        this.description = data.description;
        this.aspects = data.aspects;
        this.thumbnail = data.thumbnail || `https://robohash.org/${this.name.full}.png`;
    }
}
