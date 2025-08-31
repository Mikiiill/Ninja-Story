class Skills {
    constructor() {
        this.skills = {
            "Barrage": { name: "Barrage", style: "Taijutsu", damage: 1, hits: 2, support: false },
            "Healing Stance": { name: "Healing Stance", style: "Ninjutsu", damage: 0, hits: 1, support: true, effect: { name: "Regen", duration: 2, value: 1 } },
            "Bite": { name: "Bite", style: "Feral", damage: 2, hits: 1, support: false }
        };
    }

    findSkill(name) {
        return this.skills[name];
    }
}

const skills = new Skills();
