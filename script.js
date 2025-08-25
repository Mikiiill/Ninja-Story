let game = {
    player: {
        name: "Shinobi",
        hp: 10,
        maxHp: 10,
        Rank: "Student",
        ninjaStyles: { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" },
        skills: [], // Active skills
        skillInventory: [], // All collected skills
        statusEffects: []
    },
    enemy: null,
    battleNum: 1,
    output: [],
    gameState: "start",
    battleScene: null,
    outputQueue: [],
    isOutputting: false
};

class StatusEffect {
    constructor(name, duration, damage = 0) {
        this.name = name;
        this.duration = duration;
        this.damage = damage;
        this.new = true;
    }
}

class BattleSkill {
    constructor(name, attributes, requirements, skillFunction, style, support, rank) {
        this.name = name;
        this.attributes = attributes || [];
        this.requirements = requirements;
        this.skillFunction = skillFunction;
        this.style = style;
        this.support = support || false;
        this.rank = rank;
    }
}

class Mob {
    constructor(name, hp, maxHp, Rank, ninjaStyles, skills, statusEffects, sprite) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.Rank = Rank;
        this.ninjaStyles = ninjaStyles;
        this.skills = skills;
        this.statusEffects = statusEffects;
        this.sprite = sprite;
    }
}

class Skills {
    constructor() {
        this.skills = [];
        this.initializeSkills();
    }

    initializeSkills() {
        this.skills = [
            new BattleSkill("Barrage", [], {}, this.barrage.bind(this), "neutral", false, "D-Rank"),
            new BattleSkill("Demon Mind Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.demonMindJutsu.bind(this), "illusion", false, "C-Rank"),
            new BattleSkill("Fireball Jutsu", ["Fire"], { Fire: "C-Rank" }, this.fireballJutsu.bind(this), "fire", false, "C-Rank"),
            new BattleSkill("Flame Throw Jutsu", ["Fire"], { Fire: "B-Rank" }, this.flameThrowJutsu.bind(this), "fire", false, "B-Rank"),
            new BattleSkill("Healing Stance", [], {}, this.healingStance.bind(this), "neutral", true, "D-Rank"),
            new BattleSkill("Shock Field Jutsu", ["Lightning"], { Lightning: "C-Rank" }, this.shockFieldJutsu.bind(this), "lightning", false, "C-Rank"),
            new BattleSkill("Shadow Clone Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.shadowCloneJutsu.bind(this), "illusion", true, "C-Rank"),
            new BattleSkill("Bite", ["Feral"], { Feral: "C-Rank" }, this.bite.bind(this), "feral", false, "C-Rank"),
            new BattleSkill("Substitution", [], {}, this.substitution.bind(this), "neutral", true, "D-Rank"),
            new BattleSkill("Rock Barrier Jutsu", ["Earth"], { Earth: "C-Rank" }, this.rockBarrierJutsu.bind(this), "earth", true, "C-Rank"),
            new BattleSkill("Impending Doom", ["Illusion"], { Illusion: "B-Rank" }, this.impendingDoom.bind(this), "illusion", false, "B-Rank"),
            new BattleSkill("Rock Smash Jutsu", ["Earth"], { Earth: "B-Rank" }, this.rockSmashJutsu.bind(this), "earth", false, "B-Rank"),
            new BattleSkill("Storm Release Jutsu", ["Lightning"], { Lightning: "A-Rank" }, this.stormReleaseJutsu.bind(this), "lightning", false, "A-Rank"),
            new BattleSkill("Ultimate Shadow Clone", ["Illusion"], { Illusion: "S-Rank" }, this.ultimateShadowClone.bind(this), "illusion", true, "S-Rank")
        ];
    }

    canUseSkill(mob, skill) {
        return Object.keys(skill.requirements).every(key => mob.ninjaStyles[key] === skill.requirements[key]);
    }

    findSkill(name) {
        return this.skills.find(skill => skill.name === name);
    }

    barrage(user, target, scene) {
        let baseDamage = Math.round(Math.random()) + 1;
        let comboDamage = Math.round(Math.random()) + 1;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - baseDamage));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> attacks <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> with <span class="output-text-neutral">Barrage</span> and hits for ${baseDamage} damage!`);
        if (target.hp > 0) {
            target.hp = Math.max(0, Math.min(target.maxHp, target.hp - comboDamage));
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> combos for ${comboDamage} damage!`);
        }
        if (target.hp <= 0) return true;
        return false;
    }

    demonMindJutsu(user, target, scene) {
        let damage = 2;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Doom", 3, 2));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-illusion">Demon Mind Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-doom">Doom 💀</span>!`);
        if (target.hp <= 0) return true;
        return false;
    }

    fireballJutsu(user, target, scene) {
        let damage = Math.round(Math.random()) + 3;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burn", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Fireball Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burn">Burn 🔥</span>!`);
        if (target.hp <= 0) return true;
        return false;
    }

    flameThrowJutsu(user, target, scene) {
        let damage = Math.round(Math.random()) + 5;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burn", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Flame Throw Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burn">Burn 🔥</span>!`);
        if (target.hp <= 0) return true;
        return false;
    }

    healingStance(user, target, scene) {
        let heal = user.hp < user.maxHp ? 1 : 0;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal));
        user.statusEffects.push(new StatusEffect("Healing", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> enters <span class="output-text-neutral">Healing Stance</span>${heal > 0 ? `, healing ${heal} HP` : ""} <span class="status-healing">🌿</span>!`);
        return true;
    }

    shockFieldJutsu(user, target, scene) {
        let damage = Math.round(Math.random() * 2) + 2;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        user.statusEffects.push(new StatusEffect("Numb", 1));
        target.statusEffects.push(new StatusEffect("Numb", 1));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-lightning">Shock Field Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-numb">Numb ⚡️</span> on both!`);
        if (target.hp <= 0) return true;
        return false;
    }

    shadowCloneJutsu(user, target, scene) {
        if (user.hp < 2) {
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> does not have enough HP to cast <span class="output-text-illusion">Shadow Clone Jutsu</span>!`);
            return false;
        }
        let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
        if (cloneCount >= 3) {
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> already has the maximum of 3 shadow clones!`);
            return false;
        }
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp - 2));
        user.statusEffects.push(new StatusEffect("ShadowCloneEffect", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-illusion">Shadow Clone Jutsu</span>, adding a clone <span class="status-shadowcloneeffect">👥</span>!`);
        return true;
    }

    bite(user, target, scene) {
        let damage = 1;
        let heal = user.hp < user.maxHp ? 1 : 0;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal));
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Bleed", 3, 2));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-feral">Bite</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage${heal > 0 ? `, healing ${heal} HP` : ""}, inflicting <span class="status-bleed">Bleed 🩸</span>!`);
        if (target.hp <= 0) return true;
        return false;
    }

    substitution(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Substitution", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> prepares <span class="output-text-neutral">Substitution</span> <span class="status-substitution">🪵</span>!`);
        return true;
    }

    rockBarrierJutsu(user, target,
