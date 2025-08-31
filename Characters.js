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
    return selectedSkills.length > 0 ? selectedSkills : []; // No fallback, rely on active skills
}

function generateEnemy() {
    let styles = ["Fire", "Lightning", "Earth", "Water", "Wind", "Feral"]; // All non-quest styles
    let styleCount = { Genin: 2, Chunin: 4, Jounin: 6 }[game.player.Rank] || 2; // Default to Genin
    let rank = { Student: "D-Rank", Genin: "C-Rank", Chunin: "B-Rank", Jounin: "A-Rank" }[game.player.Rank] || "D-Rank";
    let hp = { Genin: 12, Chunin: 16, Jounin: 20 }[game.player.Rank] || 12;
    let randomStyles = {};
    for (let i = 0; i < styleCount; i++) {
        let style = styles.splice(Math.floor(Math.random() * styles.length), 1)[0];
        randomStyles[style] = rank;
    }
    let skills = generateEnemySkills(rank, randomStyles);
    let name = game.player.Rank === "Genin" ? "Genin Opponent" : game.player.Rank === "Chunin" ? "Chunin Opponent" : "Jounin Opponent";
    return new Mob(name, hp, hp, rank, randomStyles, skills, [], null); // Default sprite to null
}

function generateTrainingEnemy() {
    let enemies = [
        new Mob("Rabid Dog", 8, 8, "D-Rank", { Feral: "C-Rank" }, [new Skills().findSkill("Bite")], [], null),
        new Mob("Thief", 10, 10, "D-Rank", { Taijutsu: "D-Rank" }, [new Skills().findSkill("Barrage"), new Skills().findSkill("Substitution Jutsu")], [], null),
        new Mob("Training Dummy", 6, 6, "D-Rank", { Ninjutsu: "D-Rank" }, [new Skills().findSkill("Healing Stance")], [], null)
    ];
    return enemies[Math.floor(Math.random() * enemies.length)];
}

function generateTravelEnemy() {
    let enemies = [
        new Mob("Bandit", 30, 30, "C-Rank", { Taijutsu: "C-Rank" }, generateEnemySkills("C-Rank", { Taijutsu: "C-Rank" }), [], null),
        new Mob("Rabid Dog", 35, 35, "D-Rank", { Feral: "C-Rank" }, [new Skills().findSkill("Bite")], [], null)
    ];
    return enemies[Math.floor(Math.random() * enemies.length)];
}

const SparringDummy = {
    name: "SparringDummy",
    hp: 6,
    maxHp: 6,
    skills: [new Skills().findSkill("Healing Stance"), new Skills().findSkill("Bite")],
    skillInventory: [],
    statusEffects: [{ name: "Burn", duration: 2, effect: (target) => target.hp = Math.max(0, target.hp - 1) }],
    lastVillage: "Newb Village"
};
