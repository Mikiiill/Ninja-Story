let game = {
    player: {
        name: "Shinobi",
        hp: 10,
        maxHp: 10,
        Rank: "Student",
        ninjaStyles: { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" },
        skills: [],
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
    constructor(name, duration) {
        this.name = name;
        this.duration = duration;
        this.new = true;
    }
}

class BattleSkill {
    constructor(name, attributes, requirements, skillFunction, style, support) {
        this.name = name;
        this.attributes = attributes || [];
        this.requirements = requirements;
        this.skillFunction = skillFunction;
        this.style = style;
        this.support = support || false;
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
            new BattleSkill("Barrage", [], {}, this.barrage.bind(this), "neutral", false),
            new BattleSkill("Demon Mind Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.demonMindJutsu.bind(this), "illusion", false),
            new BattleSkill("Fireball Jutsu", ["Fire"], { Fire: "C-Rank" }, this.fireballJutsu.bind(this), "fire", false),
            new BattleSkill("Flame Throw Jutsu", ["Fire"], { Fire: "B-Rank" }, this.flameThrowJutsu.bind(this), "fire", false),
            new BattleSkill("Healing Stance", [], {}, this.healingStance.bind(this), "neutral", true),
            new BattleSkill("Lightning Edge", ["Lightning"], { Lightning: "C-Rank" }, this.lightningEdge.bind(this), "lightning", false),
            new BattleSkill("Shadow Clone Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.shadowCloneJutsu.bind(this), "illusion", true),
            new BattleSkill("Bite", ["Feral"], { Feral: "C-Rank" }, this.bite.bind(this), "feral", false),
            new BattleSkill("Substitution", [], {}, this.substitution.bind(this), "neutral", true),
            new BattleSkill("Rock Barrier Jutsu", ["Earth"], { Earth: "C-Rank" }, this.rockBarrierJutsu.bind(this), "earth", true),
            new BattleSkill("Impending Doom", ["Illusion"], { Illusion: "B-Rank" }, this.impendingDoom.bind(this), "illusion", false),
            new BattleSkill("Boulder Crush", ["Earth"], { Earth: "B-Rank" }, this.boulderCrush.bind(this), "earth", false)
        ];
    }

    canUseSkill(mob, skill) {
        return Object.keys(skill.requirements).every(key => mob.ninjaStyles[key] === skill.requirements[key]);
    }

    findSkill(name) {
        return this.skills.find(skill => skill.name === name);
    }

    barrage(user, target, scene) {
        let baseDamage = 1;
        let comboDamage = Math.round(Math.random()) + 1; // 1 or 2
        target.hp = Math.max(0, Math.min(10, target.hp - baseDamage));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> attacks <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> with <span class="output-text-neutral">Barrage</span> and hits for ${baseDamage} damage!`);
        if (target.hp > 0) {
            target.hp = Math.max(0, Math.min(10, target.hp - comboDamage));
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> combos for ${comboDamage} damage!`);
        }
        if (target.hp <= 0) return true;
        return false;
    }

    demonMindJutsu(user, target, scene) {
        let damage = 1;
        target.hp = Math.max(0, Math.min(10, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Doom", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-illusion">Demon Mind Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-doom">Doom 💀</span>!`);
        if (target.hp <= 0) return true;
        return false;
    }

    fireballJutsu(user, target, scene) {
        let damage = Math.round(Math.random() * 4) + 3;
        target.hp = Math.max(0, Math.min(10, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burned", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Fireball Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burned">Burned 🔥</span>!`);
        if (target.hp <= 0) return true;
        return false;
    }

    flameThrowJutsu(user, target, scene) {
        let damage = Math.round(Math.random() * 5) + 5;
        target.hp = Math.max(0, Math.min(10, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burned", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Flame Throw Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burned">Burned 🔥</span>!`);
        if (target.hp <= 0) return true;
        return false;
    }

    healingStance(user, target, scene) {
        let heal = user.hp < user.maxHp ? 1 : 0; // Only heal upfront if not at max HP
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal));
        user.statusEffects.push(new StatusEffect("Healing", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> enters <span class="output-text-neutral">Healing Stance</span>${heal > 0 ? `, healing ${heal} HP` : ""} <span class="status-healing">🌿</span>!`);
        return true; // Always return true to indicate successful action
    }

    lightningEdge(user, target, scene) {
        let damage = Math.round(Math.random() * 4) + 4;
        target.hp = Math.max(0, Math.min(10, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Stunned", 1));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-lightning">Lightning Edge</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-stunned">Stunned ⚡️</span>!`);
        if (target.hp <= 0) return true;
        return false;
    }

    shadowCloneJutsu(user, target, scene) {
        if (user.hp < 3) {
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> does not have enough HP to cast <span class="output-text-illusion">Shadow Clone Jutsu</span>!`);
            return false;
        }
        let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
        if (cloneCount >= 3) {
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> already has the maximum of 3 shadow clones!`);
            return false;
        }
        user.hp = Math.max(0, Math.min(10, user.hp - 3));
        user.statusEffects.push(new StatusEffect("ShadowCloneEffect", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-illusion">Shadow Clone Jutsu</span>, adding a clone <span class="status-shadowcloneeffect">👥</span>!`);
        return true;
    }

    bite(user, target, scene) {
        let damage = 1;
        target.hp = Math.max(0, Math.min(10, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Bleed", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-feral">Bite</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-bleed">Bleed 🩸</span>!`);
        if (target.hp <= 0) return true;
        return false;
    }

    substitution(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Substitution", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> prepares <span class="output-text-neutral">Substitution</span> <span class="status-substitution">🪵</span>!`);
        return true;
    }

    rockBarrierJutsu(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Rock Barrier", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-earth">Rock Barrier Jutsu</span> <span class="status-rockbarrier">🪨</span>!`);
        return true;
    }

    impendingDoom(user, target, scene) {
        let damage = 3;
        target.hp = Math.max(0, Math.min(10, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Doom", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-illusion">Impending Doom</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-doom">Doom 💀</span>!`);
        if (target.hp <= 0) return true;
        return false;
    }

    boulderCrush(user, target, scene) {
        let damage = Math.round(Math.random() * 5) + 5;
        target.hp = Math.max(0, Math.min(10, target.hp - damage));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-earth">Boulder Crush</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage!`);
        if (target.hp <= 0) return true;
        return false;
    }
}

class BattleScene {
    constructor() {
        this.skills = new Skills();
        this.asciiMap = {
            Doom: "💀",
            Burned: "🔥",
            Bleed: "🩸",
            Healing: "🌿",
            Stunned: "⚡️",
            ShadowCloneEffect: "👥",
            Substitution: "🪵",
            "Rock Barrier": "🪨"
        };
        this.chosenStyles = [];
        this.chosenSkills = [];
    }

    queueOutput(text) {
        game.outputQueue.push(text);
        if (!game.isOutputting) {
            this.processOutputQueue();
        }
    }

    processOutputQueue() {
        if (game.outputQueue.length === 0) {
            game.isOutputting = false;
            return;
        }
        game.isOutputting = true;
        let text = game.outputQueue.shift();
        game.output.push(text);
        document.getElementById("output").innerHTML = game.output.join("<br>");
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
        setTimeout(() => this.processOutputQueue(), 1000);
    }

    updateOutput(text) {
        this.queueOutput(text);
    }

    updateStatus() {
        let playerEffects = [...new Set(game.player.statusEffects.map(e => e.name))].map(name => `<span class="status-${name.toLowerCase().replace(" ", "")}">${this.asciiMap[name] || ""}</span>`).join("");
        let enemyEffects = game.enemy ? [...new Set(game.enemy.statusEffects.map(e => e.name))].map(name => `<span class="status-${name.toLowerCase().replace(" ", "")}">${this.asciiMap[name] || ""}</span>`).join("") : "";
        let playerSprite = game.player.sprite ? `<img src="${game.player.sprite}" class="sprite" alt="Shinobi Sprite">` : "";
        let enemySprite = game
