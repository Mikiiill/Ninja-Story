class Character {
    constructor(name, hp, maxHP) {
        this.name = name;
        this.hp = hp;
        this.maxHP = maxHP;
        this.exp = 0;
        this.maxEXP = 10;
        this.rank = "Student";
        this.styles = {}; // Filled in createCharacter
        this.skills = [];
        this.inventory = [];
        this.jutsuList = [];
        this.rewardList = [];
        this.location = "Newb Village";
        this.statusEffects = [];
    }

    addStyle(style, rank) {
        this.styles[style] = rank;
    }

    addJutsu(jutsu) {
        this.inventory.push(jutsu);
    }

    equipJutsu(jutsuName) {
        const jutsu = this.inventory.find(j => j.name === jutsuName);
        if (jutsu && !this.jutsuList.some(j => j.name === jutsuName)) {
            this.jutsuList.push(jutsu);
            this.inventory = this.inventory.filter(j => j.name !== jutsuName);
        }
    }

    unequipJutsu(jutsuName) {
        const jutsu = this.jutsuList.find(j => j.name === jutsuName);
        if (jutsu) {
            this.jutsuList = this.jutsuList.filter(j => j.name !== jutsuName);
            this.inventory.push(jutsu);
        }
    }
}
