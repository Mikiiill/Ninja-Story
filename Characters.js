class Mob {
    constructor(name, hp, maxHp, Rank, ninjaStyles, skills, statusEffects, sprite) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.Rank = Rank;
        this.ninjaStyles = ninjaStyles;
        this.skills = skills;
        this.statusEffects = statusEffects || [];
        this.sprite = sprite;
    }
}

function generateEnemySkills(rank, styles) {
    let skillSet = new Skills();
    let availableSkills = skillSet.skills.filter(skill => 
        Object.keys(skill.requirements).every(style => styles[style] && compareRanks(styles[style], skill.requirements[style]) >= 0) &&
        skill.rank === rank
    );
    let selectedSkills = [];
    for (let i = 0; i < 4 && availableSkills.length > 0; i++) {
        let index = Math.floor(Math.random() * availableSkills.length);
        selectedSkills.push(availableSkills.splice(index, 1)[0]);
    }
    return selectedSkills.length > 0 ? selectedSkills : [skillSet.findSkill("Healing Stance")];
}

function generateEnemy() {
    if (game.player.Rank === "Genin") {
        return new Mob("Genin Opponent", 12, 12, "C-Rank", { Ninjutsu: "C-Rank", Taijutsu: "C-Rank" }, generateEnemySkills("C-Rank", { Ninjutsu: "C-Rank", Taijutsu: "C-Rank" }));
    } else {
        return Math.random() < 0.5 ? new Mob("Wild Dog", 8, 8, "D-Rank", { Feral: "C-Rank" }, [new Skills().findSkill("Bite")]) : new Mob("Training Dummy", 6, 6, "D-Rank", { Neutral: "D-Rank" }, [new Skills().findSkill("Healing Stance")]);
    }
}
