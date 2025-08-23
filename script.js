let game = {
    player: {
        name: "Shinobi",
        hp: 10,
        maxHp: 10,
        ninjaStyles: { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" },
        skills: [],
        statusEffects: [],
        shadowCloneMultiplier: 1
    },
    enemy: null,
    battleNum: 1,
    output: [],
    gameState: "start",
    battleScene: null
};

class StatusEffect {
    constructor(name, duration) {
        this.name = name;
        this.duration = duration;
    }
}

class BattleSkill {
    constructor(name, attributes, requirements, skillFunction, style) {
        this.name = name;
        this.attributes = attributes;
        this.requirements = requirements;
        this.skillFunction = skillFunction;
        this.style = style;
    }
}

class Mob {
    constructor(name, hp, maxHp, ninjaStyles, skills, statusEffects) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.ninjaStyles = ninjaStyles;
        this.skills = skills;
        this.statusEffects = statusEffects;
    }
}

class Skills {
    constructor() {
        this.skills = [];
        this.initializeSkills();
    }

    initializeSkills() {
        this.skills = [
            new BattleSkill("Barrage", [], {}, this.barrage.bind(this), "neutral"),
            new BattleSkill("Demon Mind Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.demonMindJutsu.bind(this), "illusion"),
            new BattleSkill("Fireball Jutsu", ["Fire"], { Fire: "C-Rank" }, this.fireballJutsu.bind(this), "fire"),
            new BattleSkill("Flame Throw Jutsu", ["Fire"], { Fire: "B-Rank" }, this.flameThrowJutsu.bind(this), "fire"),
            new BattleSkill("Healing Stance", [], {}, this.healingStance.bind(this), "neutral"),
            new BattleSkill("Raikiri", ["Lightning"], { Lightning: "C-Rank" }, this.raikiri.bind(this), "lightning"),
            new BattleSkill("Shadow Clone Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.shadowCloneJutsu.bind(this), "illusion"),
            new BattleSkill("Bite", ["Feral"], { Feral: "C-Rank" }, this.bite.bind(this), "feral"),
            new BattleSkill("Kawarami", [], {}, this.kawarami.bind(this), "neutral"),
            new BattleSkill("Rock Barrier Jutsu", ["Earth"], { Earth: "C-Rank" }, this.rockBarrierJutsu.bind(this), "earth"),
            new BattleSkill("Impending Doom", ["Illusion"], { Illusion: "B-Rank" }, this.impendingDoom.bind(this), "illusion"),
            new BattleSkill("Boulder Crush", ["Earth"], { Earth: "B-Rank" }, this.boulderCrush.bind(this), "earth")
        ];
    }

    canUseSkill(mob, skill) {
        return Object.keys(skill.requirements).every(key => mob.ninjaStyles[key] === skill.requirements[key]);
    }

    findSkill(name) {
        return this.skills.find(skill => skill.name === name);
    }

    barrage(user, target, scene) {
        let damage = Math.round(Math.random() * 3) + 2;
        damage *= user.shadowCloneMultiplier;
        target.hp = Math.max(0, Math.min(10, target.hp - damage));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> attacks <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> with <span class="output-text-neutral">Barrage</span> for ${damage} damage!`);
    }

    demonMindJutsu(user, target, scene) {
        target.statusEffects.push(new StatusEffect("Trauma", 2));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-illusion">Demon Mind Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>, inflicting <span class="status-trauma">Trauma 💀</span>!`);
    }

    fireballJutsu(user, target, scene) {
        let damage = Math.round(Math.random() * 4) + 3;
        damage *= user.shadowCloneMultiplier;
        target.hp = Math.max(0, Math.min(10, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burned", 3));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Fireball Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burned">Burned 🔥</span>!`);
    }

    flameThrowJutsu(user, target, scene) {
        let damage = Math.round(Math.random() * 5) + 5;
        damage *= user.shadowCloneMultiplier;
        target.hp = Math.max(0, Math.min(10, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burned", 3));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Flame Throw Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burned">Burned 🔥</span>!`);
    }

    healingStance(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Healing", 3));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> enters <span class="output-text-neutral">Healing Stance</span> <span class="status-healing">🌿</span>!`);
    }

    raikiri(user, target, scene) {
        let damage = Math.round(Math.random() * 4) + 4;
        damage *= user.shadowCloneMultiplier;
        target.hp = Math.max(0, Math.min(10, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Stunned",
