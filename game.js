// Utility Function for Delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Status Effect Class
class StatusEffect {
    constructor(name, duration, damage = 0, startOfTurn = false, active = false, triggered = false, 
                startOfTurnFunction = null, activeFunction = null, triggeredFunction = null) {
        this.name = name;
        this.duration = duration;
        this.damage = damage;
        this.new = true;
        this.startOfTurn = startOfTurn;
        this.active = active;
        this.triggered = triggered;
        this.startOfTurnFunction = startOfTurnFunction;
        this.activeFunction = activeFunction;
        this.triggeredFunction = triggeredFunction;
    }
}

// Emoji Map for Status Effects
const statusEmojis = {
    "Swap": "🪵",
    "ShadowCloneEffect": "👥",
    "Doom": "💀",
    "Regen": "🌿",
    "Dome": "🪨",
    "Burn": "🔥",
    "Numb": "⚡️",
    "READY": "💪",
    "Release": "🌀",
    "Bleed": "🩸"
};

// Battle Skill Class
class BattleSkill {
    constructor(name, attributes, requirements, skillFunction, style, support, rank) {
        this.name = name;
        this.attributes = attributes || [];
        this.requirements = requirements || {};
        this.skillFunction = skillFunction;
        this.style = style;
        this.support = support || false;
        this.rank = rank;
    }
}

// Mob Class
class Mob {
    constructor(name, hp, maxHp, rank, fightingStyles, activeJutsu, inventory, statusEffects, sprite) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.rank = rank;
        this.fightingStyles = fightingStyles;
        this.activeJutsu = activeJutsu || [];
        this.inventory = inventory || [];
        this.statusEffects = statusEffects || [];
        this.sprite = sprite || "https://raw.githubusercontent.com/Mikiiill/ShinobiWay/refs/heads/main/Assets/NINJA2.PNG";
        this.xp = 0;
        this.travelFightsCompleted = 0;
        this.lastVillage = "Newb Village";
    }
}

// Skills Class
class Skills {
    constructor() {
        this.skills = [];
        this.initializeSkills();
    }

    initializeSkills() {
        this.skills = [
            new BattleSkill("Barrage", ["Taijutsu"], {}, this.barrage.bind(this), "neutral", false, "D-Rank"),
            new BattleSkill("Substitution Jutsu", [], { Ninjutsu: "D-Rank", Taijutsu: "D-Rank" }, this.substitutionJutsu.bind(this), "neutral", true, "D-Rank"),
            new BattleSkill("Shadow Clone Jutsu", ["Ninjutsu"], { Ninjutsu: "C-Rank" }, this.shadowCloneJutsu.bind(this), "neutral", true, "C-Rank"),
            new BattleSkill("Demonic Vision", ["Genjutsu"], { Genjutsu: "C-Rank" }, this.demonicVision.bind(this), "genjutsu", false, "C-Rank"),
            new BattleSkill("Healing Stance", ["Ninjutsu"], {}, this.healingStance.bind(this), "neutral", true, "D-Rank"),
            new BattleSkill("Earth Dome Jutsu", ["Earth", "Ninjutsu"], { Earth: "C-Rank" }, this.earthDomeJutsu.bind(this), "earth", true, "C-Rank"),
            new BattleSkill("Flame Throw Jutsu", ["Fire", "Ninjutsu"], { Fire: "C-Rank", Ninjutsu: "C-Rank" }, this.flameThrowJutsu.bind(this), "fire", false, "B-Rank"),
            new BattleSkill("Static Field Jutsu", ["Lightning", "Ninjutsu"], { Lightning: "C-Rank" }, this.staticFieldJutsu.bind(this), "lightning", false, "C-Rank"),
            new BattleSkill("Fireball Jutsu", ["Fire", "Ninjutsu"], { Fire: "C-Rank" }, this.fireballJutsu.bind(this), "fire", false, "C-Rank"),
            new BattleSkill("Dynamic Entry", ["Taijutsu"], { Taijutsu: "C-Rank" }, this.dynamicEntry.bind(this), "neutral", false, "C-Rank"),
            new BattleSkill("Falcon Drop", ["Taijutsu"], { Taijutsu: "B-Rank" }, this.falconDrop.bind(this), "neutral", false, "B-Rank"),
            new BattleSkill("Rock Smash Jutsu", ["Earth", "Taijutsu"], { Earth: "B-Rank" }, this.rockSmashJutsu.bind(this), "earth", false, "B-Rank"),
            new BattleSkill("Genjutsu Release", ["Genjutsu"], { Genjutsu: "B-Rank" }, this.genjutsuRelease.bind(this), "genjutsu", true, "B-Rank"),
            new BattleSkill("Lightning Edge", ["Lightning", "Ninjutsu"], { Lightning: "C-Rank", Ninjutsu: "C-Rank" }, this.lightningEdge.bind(this), "lightning", false, "B-Rank"),
            new BattleSkill("Bite", ["Beast"], { Beast: "C-Rank" }, this.bite.bind(this), "beast", false, "C-Rank")
        ];
        if (this.skills.length === 0) {
            console.error("Skills initialization failed!");
            logBattle("Error: No skills initialized!");
        }
    }

    canUseSkill(mob, skill) {
        const result = Object.keys(skill.requirements).every(key => mob.fightingStyles[key] && compareRanks(mob.fightingStyles[key], skill.requirements[key]) >= 0);
        if (!result) {
            console.log(`Cannot use ${skill.name}: Requirements not met`, skill.requirements, mob.fightingStyles);
        }
        return result;
    }

    findSkill(name) {
        return this.skills.find(skill => skill.name === name);
    }

    async barrage(user, target) {
        let baseDamage = Math.floor(Math.random() * 2) + 1;
        let comboDamage = Math.floor(Math.random() * 2) + 1;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - baseDamage));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> attacks <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> with <span class="output-text-neutral">Barrage</span> for ${baseDamage} damage!`);
        await sleep(3000);
        if (target.hp > 0) {
            target.hp = Math.max(0, Math.min(target.maxHp, target.hp - comboDamage));
            logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> combos ${target.name} for ${comboDamage} damage!`);
            await sleep(3000);
        }
        return target.hp <= 0;
    }

    async substitutionJutsu(user, target) {
        user.statusEffects.push(new StatusEffect("Swap", 1, 0, false, false, true, null, null, 
            async (target, user, skillStyle) => {
                logBattle(`<span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> uses Substitution to dodge the attack with a log!`);
                await sleep(3000);
                target.statusEffects = target.statusEffects.filter(e => e.name !== "Swap");
                return true;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> prepares <span class="output-text-neutral">Substitution Jutsu</span> <span class="status-substitution">🪵</span>!`);
        await sleep(3000);
        return true;
    }

    async shadowCloneJutsu(user, target) {
        if (user.hp < 2) {
            logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> does not have enough HP to cast <span class="output-text-neutral">Shadow Clone Jutsu</span>!`);
            await sleep(3000);
            return false;
        }
        let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
        if (cloneCount >= 3) {
            logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> already has the maximum of 3 shadow clones!`);
            await sleep(3000);
            return false;
        }
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp - 2));
        user.statusEffects.push(new StatusEffect("ShadowCloneEffect", 3, 0, false, true, true, null, 
            async (user, target) => {
                let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
                for (let i = 0; i < cloneCount; i++) {
                    logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">Shadow Clone ${i + 1} uses Barrage on ${target.name}!</span>`);
                    await sleep(3000);
                    await this.barrage(user, target);
                }
                user.statusEffects = user.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                return false;
            }, 
            async (target, user, skillStyle) => {
                let cloneCount = target.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
                if (cloneCount > 0) {
                    logBattle(`<span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span>'s Shadow Clone absorbs the attack!`);
                    await sleep(3000);
                    target.statusEffects.splice(target.statusEffects.findIndex(e => e.name === "ShadowCloneEffect"), 1);
                    return true;
                }
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-neutral">Shadow Clone Jutsu</span>, adding a clone <span class="status-shadowcloneeffect">👥</span>!`);
        await sleep(3000);
        return true;
    }

    async demonicVision(user, target) {
        let damage = 1;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Doom", 5, 1, true, false, false, 
            async (user, target) => {
                user.hp = Math.max(0, user.hp - user.statusEffects.find(e => e.name === "Doom").damage);
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> takes ${user.statusEffects.find(e => e.name === "Doom").damage} damage from <span class="status-doom">Doom 💀</span>!`);
                await sleep(3000);
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-genjutsu">Demonic Vision</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-doom">Doom 💀</span>!`);
        await sleep(3000);
        return target.hp <= 0;
    }

    async healingStance(user, target) {
        let heal = user.hp < user.maxHp ? 1 : 0;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal));
        user.statusEffects.push(new StatusEffect("Regen", 3, 1, true, false, false, 
            async (user, target) => {
                let heal = user.hp < user.maxHp ? user.statusEffects.find(e => e.name === "Regen").damage : 0;
                user.hp = Math.min(user.maxHp, user.hp + heal);
                if (heal > 0) {
                    logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> heals ${heal} HP from <span class="status-regen">Regen 🌿</span>!`);
                    await sleep(3000);
                }
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> enters <span class="output-text-neutral">Healing Stance</span>${heal > 0 ? `, healing ${heal} HP` : ""} <span class="status-regen">🌿</span>!`);
        await sleep(3000);
        return true;
    }

    async earthDomeJutsu(user, target) {
        user.statusEffects.push(new StatusEffect("Dome", 2, 0, false, false, true, null, null, 
            async (target, user, skillStyle) => {
                if (skillStyle !== "genjutsu") {
                    logBattle(`<span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> uses Earth Dome to mitigate the attack!`);
                    await sleep(3000);
                    target.statusEffects = target.statusEffects.filter(e => e.name !== "Dome");
                    return true;
                }
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> raises <span class="output-text-earth">Earth Dome Jutsu</span> <span class="status-dome">🪨</span>!`);
        await sleep(3000);
        return true;
    }

    async flameThrowJutsu(user, target) {
        let damage = Math.floor(Math.random() * 2) + 4;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burn", 1, 2, true, false, false, 
            async (user, target) => {
                user.hp = Math.max(0, user.hp - user.statusEffects.find(e => e.name === "Burn").damage);
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> takes ${user.statusEffects.find(e => e.name === "Burn").damage} damage from <span class="status-burn">Burn 🔥</span>!`);
                await sleep(3000);
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Flame Throw Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burn">Burn 🔥</span>!`);
        await sleep(3000);
        return target.hp <= 0;
    }

    async staticFieldJutsu(user, target) {
        let damage = Math.floor(Math.random() * 2) + 2;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        user.statusEffects.push(new StatusEffect("Numb", 1, 0, true, false, false, 
            async (user, target) => {
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> is stunned by Numb and skips their turn!`);
                await sleep(3000);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb");
                return true;
            }));
        target.statusEffects.push(new StatusEffect("Numb", 1, 0, true, false, false, 
            async (user, target) => {
                logBattle(`<span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> is stunned by Numb and skips their turn!`);
                await sleep(3000);
                target.statusEffects = target.statusEffects.filter(e => e.name !== "Numb");
                return true;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-lightning">Static Field Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-numb">Numb ⚡️</span> on both!`);
        await sleep(3000);
        return target.hp <= 0;
    }

    async fireballJutsu(user, target) {
        let damage = Math.floor(Math.random() * 2) + 3;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burn", 1, 1, true, false, false, 
            async (user, target) => {
                user.hp = Math.max(0, user.hp - user.statusEffects.find(e => e.name === "Burn").damage);
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> takes ${user.statusEffects.find(e => e.name === "Burn").damage} damage from <span class="status-burn">Burn 🔥</span>!`);
                await sleep(3000);
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Fireball Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burn">Burn 🔥</span>!`);
        await sleep(3000);
        return target.hp <= 0;
    }

    async dynamicEntry(user, target) {
        let damage = 1;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-neutral">Dynamic Entry</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage!`);
        await sleep(3000);
        if (!user.statusEffects.some(e => e.name === "DynamicEntryProc")) {
            user.statusEffects.push(new StatusEffect("DynamicEntryProc", 1, 0, false, false, false, null, null, null));
            let usableSkills = user.activeJutsu.filter(skill => !skill.support && skill.name !== "Dynamic Entry");
            let nextSkill = usableSkills.length > 0 ? usableSkills[Math.floor(Math.random() * usableSkills.length)] : null;
            if (nextSkill) {
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> chains with ${nextSkill.name}!`);
                await sleep(3000);
                await nextSkill.skillFunction(user, target);
            }
            user.statusEffects = user.statusEffects.filter(e => e.name !== "DynamicEntryProc");
        }
        return target.hp <= 0;
    }

    async falconDrop(user, target) {
        let damage = 2;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp - 2));
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Numb", 1, 0, true, false, false, 
            async (user, target) => {
                logBattle(`<span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> is stunned by Numb and skips their turn!`);
                await sleep(3000);
                target.statusEffects = target.statusEffects.filter(e => e.name !== "Numb");
                return true;
            }));
        user.statusEffects.push(new StatusEffect("READY", 1, 0, false, true, false, null, 
            async (user, target) => {
                let barrageSkill = this.findSkill("Barrage");
                if (barrageSkill) await barrageSkill.skillFunction(user, target);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "READY");
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-neutral">Falcon Drop</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, stunning target and taking 2 damage!`);
        await sleep(3000);
        return target.hp <= 0;
    }

    async rockSmashJutsu(user, target) {
        let damage = 6;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-earth">Rock Smash Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage!`);
        await sleep(3000);
        return target.hp <= 0;
    }

    async genjutsuRelease(user, target) {
        user.statusEffects = user.statusEffects.filter(e => e.name !== "Doom");
        user.statusEffects.push(new StatusEffect("Release", 1, 0, false, false, true, null, null, 
            async (target, user, skillStyle) => {
                if (skillStyle === "genjutsu") {
                    logBattle(`<span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> uses Release to resist the Genjutsu attack!`);
                    await sleep(3000);
                    target.statusEffects = target.statusEffects.filter(e => e.name !== "Release");
                    return true;
                }
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-genjutsu">Genjutsu Release</span>, dispelling Doom and gaining <span class="status-release">Release 🌀</span>!`);
        await sleep(3000);
        return true;
    }

    async lightningEdge(user, target) {
        let damage = Math.floor(Math.random() * 2) + 4;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects = target.statusEffects.filter(effect => !effect.triggered);
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> strikes with <span class="output-text-lightning">Lightning Edge</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, breaking all triggered status effects!`);
        await sleep(3000);
        return target.hp <= 0;
    }

    async bite(user, target) {
        let damage = 1;
        let heal = user.hp < user.maxHp ? 1 : 0;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal));
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Bleed", 2, 1, true, false, false, 
            async (user, target) => {
                user.hp = Math.max(0, user.hp - user.statusEffects.find(e => e.name === "Bleed").damage);
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> takes ${user.statusEffects.find(e => e.name === "Bleed").damage} damage from <span class="status-bleed">Bleed 🩸</span>!`);
                await sleep(3000);
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-beast">Bite</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage${heal > 0 ? `, healing ${heal} HP` : ""}, inflicting <span class="status-bleed">Bleed 🩸</span>!`);
        await sleep(3000);
        return target.hp <= 0;
    }
}

function compareRanks(rank1, rank2) {
    const ranks = ["D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"];
    return ranks.indexOf(rank1) - ranks.indexOf(rank2);
}

// Map Data
const MapData = {
    "Newb Village": {
        areas: ["Academy"],
        isVillage: true
    },
    "Abandoned Village": {
        areas: ["Burnt Tower"],
        isVillage: true
    },
    "Academy": {
        areas: ["Newb Village"],
        isVillage: false
    },
    "Burnt Tower": {
        areas: ["Abandoned Village"],
        isVillage: false
    }
};

// Enemy Generation
function generateEnemySkills(rank, styles) {
    let skillSet = new Skills();
    let availableSkills = skillSet.skills.filter(skill => 
        Object.keys(skill.requirements).every(style => styles[style] && compareRanks(styles[style], skill.requirements[style]) >= 0)
    );
    let selectedSkills = [];
    for (let i = 0; i < 6 && availableSkills.length > 0; i++) {
        let index = Math.floor(Math.random() * availableSkills.length);
        selectedSkills.push(availableSkills.splice(index, 1)[0]);
    }
    return selectedSkills.length > 0 ? selectedSkills : [skillSet.findSkill("Barrage")];
}

function generateEnemy() {
    let styles = ["Fire", "Lightning", "Earth", "Water", "Wind", "Beast", "Ninjutsu", "Taijutsu", "Genjutsu"];
    let styleCount = { Genin: 2, Chunin: 4, Jounin: 6 }[player.rank] || 2;
    let rank = { Student: "C-Rank", Genin: "C-Rank", Chunin: "B-Rank", Jounin: "A-Rank" }[player.rank] || "C-Rank";
    let hp = { Genin: 12, Chunin: 16, Jounin: 20 }[player.rank] || 12;
    let randomStyles = {};
    for (let i = 0; i < styleCount; i++) {
        let style = styles.splice(Math.floor(Math.random() * styles.length), 1)[0];
        randomStyles[style] = rank;
    }
    let skills = generateEnemySkills(rank, randomStyles);
    let name = player.rank === "Genin" ? "Genin Opponent" : player.rank === "Chunin" ? "Chunin Opponent" : "Jounin Opponent";
    return new Mob(name, hp, hp, rank, randomStyles, skills, []);
}

function generateTrainingEnemy() {
    let enemies = [
        new Mob("Rabid Dog", 8, 8, "D-Rank", { Beast: "C-Rank" }, [new Skills().findSkill("Bite")], []),
        new Mob("Thief", 10, 10, "D-Rank", { Taijutsu: "D-Rank" }, [
            new Skills().findSkill("Barrage"),
            new Skills().findSkill("Barrage"),
            new Skills().findSkill("Substitution Jutsu")
        ], []),
        new Mob("Training Dummy", 6, 6, "D-Rank", { Ninjutsu: "D-Rank" }, [new Skills().findSkill("Healing Stance")], [])
    ];
    return enemies[Math.floor(Math.random() * enemies.length)];
}

// Utility Functions
function logBattle(message) {
    const log = document.getElementById("battle-log-content");
    if (log) {
        const newMessage = document.createElement("p");
        newMessage.innerHTML = message;
        log.appendChild(newMessage);
        log.scrollTop = log.scrollHeight;
        newMessage.scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
        console.error("battle-log-content not found");
    }
}

function queueOutput(message) {
    logBattle(message);
}

// Jutsu Menu Toggle
let inBattle = false;
let player = new Mob(
    "Shinobi",
    10,
    10,
    "Student",
    { Ninjutsu: "D-Rank", Taijutsu: "D-Rank", Genjutsu: "D-Rank" },
    [],
    [],
    [],
    "https://raw.githubusercontent.com/Mikiiill/ShinobiWay/refs/heads/main/Assets/NINJA1.PNG"
);

function toggleJutsuMenu() {
    logBattle("toggleJutsuMenu clicked!");
    if (inBattle) {
        logBattle(`Cannot toggle Jutsu menu during battle! inBattle: ${inBattle}`);
        return;
    }
    const content = document.getElementById("jutsu-management-content");
    if (content) {
        content.classList.toggle("hidden");
    } else {
        logBattle("Error: jutsu-management-content not found");
    }
}

// Jutsu Selection
const skills = new Skills();

function openJutsuSelect() {
    logBattle("openJutsuSelect clicked!");
    if (inBattle) {
        logBattle(`Cannot select Jutsu during battle! inBattle: ${inBattle}`);
        return;
    }
    const optionsDiv = document.getElementById("jutsu-options");
    if (optionsDiv) {
        optionsDiv.innerHTML = "";
        const eligibleJutsu = skills.skills.filter(jutsu => skills.canUseSkill(player, jutsu));
        const shuffled = eligibleJutsu.sort(() => 0.5 - Math.random()).slice(0, 3);
        shuffled.forEach(jutsu => {
            const card = document.createElement("div");
            card.className = "jutsu-card";
            card.innerHTML = `
                <h4>${jutsu.name}</h4>
                <p>Style: ${jutsu.style}</p>
                <p>Rank: ${jutsu.rank}</p>
            `;
            card.onclick = () => addJutsuToInventory(jutsu);
            optionsDiv.appendChild(card);
        });
        const jutsuSelect = document.querySelector(".jutsu-select");
        if (jutsuSelect) {
            jutsuSelect.classList.remove("hidden");
        } else {
            logBattle("Error: jutsu-select not found");
        }
    } else {
        logBattle("Error: jutsu-options not found");
    }
}

function closeJutsuSelect() {
    const jutsuSelect = document.querySelector(".jutsu-select");
    if (jutsuSelect) {
        jutsuSelect.classList.add("hidden");
    } else {
        logBattle("Error: jutsu-select not found");
    }
}

function addJutsuToInventory(jutsu) {
    const totalCopies = player.activeJutsu.concat(player.inventory).filter(j => j.name === jutsu.name).length;
    if (totalCopies >= 4) {
        logBattle(`Cannot add ${jutsu.name}: Max 4 copies allowed!`);
        return;
    }
    player.inventory.push(jutsu);
    updateJutsuDisplay();
    closeJutsuSelect();
}

// Jutsu Management
function updateJutsuDisplay() {
    const activeDiv = document.getElementById("active-jutsu");
    const inventoryDiv = document.getElementById("inventory-jutsu");
    if (activeDiv && inventoryDiv) {
        activeDiv.innerHTML = "";
        inventoryDiv.innerHTML = "";

        player.activeJutsu.forEach((jutsu, index) => {
            const card = document.createElement("div");
            card.className = "jutsu-card";
            card.innerHTML = `
                <h4>${jutsu.name}</h4>
                <p>Style: ${jutsu.style}</p>
                <p>Rank: ${jutsu.rank}</p>
                <button onclick="moveJutsuToInventory(${index})" ${inBattle ? "disabled" : ""}>To Inventory</button>
            `;
            activeDiv.appendChild(card);
        });

        player.inventory.forEach((jutsu, index) => {
            const card = document.createElement("div");
            card.className = "jutsu-card";
            card.innerHTML = `
                <h4>${jutsu.name}</h4>
                <p>Style: ${jutsu.style}</p>
                <p>Rank: ${jutsu.rank}</p>
                <button onclick="moveJutsuToActive(${index})" ${inBattle ? "disabled" : ""}>To Active</button>
            `;
            inventoryDiv.appendChild(card);
        });

        const selectJutsuBtn = document.getElementById("select-jutsu-btn");
        const toggleJutsuBtn = document.getElementById("toggle-jutsu-btn");
        if (selectJutsuBtn) selectJutsuBtn.disabled = inBattle;
        if (toggleJutsuBtn) toggleJutsuBtn.disabled = inBattle;
    } else {
        logBattle("Error: active-jutsu or inventory-jutsu not found");
    }
}

function moveJutsuToInventory(index) {
    logBattle("moveJutsuToInventory clicked!");
    if (inBattle) {
        logBattle(`Cannot move Jutsu during battle! inBattle: ${inBattle}`);
        return;
    }
    if (player.activeJutsu.length > 0 && index >= 0 && index < player.activeJutsu.length) {
        player.inventory.push(player.activeJutsu.splice(index, 1)[0]);
        updateJutsuDisplay();
    }
}

function moveJutsuToActive(index) {
    logBattle("moveJutsuToActive clicked!");
    if (inBattle) {
        logBattle(`Cannot move Jutsu during battle! inBattle: ${inBattle}`);
        return;
    }
    if (player.activeJutsu.length < 10 && index >= 0 && index < player.inventory.length) {
        const jutsu = player.inventory[index];
        const totalCopies = player.activeJutsu.concat(player.inventory).filter(j => j.name === jutsu.name).length;
        if (totalCopies <= 4) {
            player.activeJutsu.push(player.inventory.splice(index, 1)[0]);
            updateJutsuDisplay();
        } else {
            logBattle(`Cannot equip ${jutsu.name}: Max 4 copies allowed!`);
        }
    }
}

// Travel and Village
function openTravelSelect() {
    logBattle("openTravelSelect clicked!");
    if (inBattle) {
        logBattle(`Cannot travel during battle! inBattle: ${inBattle}`);
        return;
    }
    const optionsDiv = document.getElementById("jutsu-options");
    if (optionsDiv) {
        optionsDiv.innerHTML = "";
        const destinations = Object.keys(MapData).filter(loc => loc !== player.lastVillage);
        destinations.forEach(dest => {
            const card = document.createElement("div");
            card.className = "jutsu-card";
            card.innerHTML = `<h4>${dest}</h4>`;
            card.onclick = () => startTravelFight(dest);
            optionsDiv.appendChild(card);
        });
        const jutsuSelect = document.querySelector(".jutsu-select");
        if (jutsuSelect) {
            jutsuSelect.classList.remove("hidden");
        } else {
            logBattle("Error: jutsu-select not found");
        }
    } else {
        logBattle("Error: jutsu-options not found");
    }
}

function ArriveVillage(village) {
    logBattle(`ArriveVillage called for ${village}`);
    player.hp = player.maxHp;
    player.statusEffects = [];
    player.lastVillage = village;
    inBattle = false;
    const battleScreen = document.getElementById("battle-screen");
    const fightControls = document.getElementById("fight-controls");
    const travelControls = document.getElementById("travel-controls");
    if (battleScreen && fightControls && travelControls) {
        battleScreen.classList.add("hidden");
        fightControls.classList.remove("hidden");
        travelControls.classList.add("hidden");
    } else {
        logBattle("Error: battle-screen, fight-controls, or travel-controls not found");
    }
    updateJutsuDisplay();
    updateBattleUI();
    logBattle(`<span class="output-text-neutral">Arrived at ${village}! inBattle: ${inBattle}</span>`);
    const villageName = document.getElementById("village-name");
    if (villageName) {
        villageName.textContent = village;
    } else {
        logBattle("Error: village-name not found");
    }
}

// Battle System
const game = {
    battleType: null,
    player: null,
    enemy: null,
    user: null,
    target: null,
    targetDestination: null
};

async function awardReward(winner, enemy) {
    if (game.battleType === "training") {
        player.xp += 1;
        logBattle(`<span class="output-text-player">${player.name}</span> gained 1 EXP!`);
        await sleep(3000);
        const playerXp = document.getElementById("player-xp");
        if (playerXp) {
            playerXp.textContent = player.xp;
        } else {
            logBattle("Error: player-xp not found");
        }
        if (player.xp >= 10) {
            player.xp = 0;
            logBattle(`<span class="output-text-neutral">${player.name} has enough EXP to learn a new Jutsu!</span>`);
            await sleep(3000);
            openJutsuSelect();
        }
    }
    updateJutsuDisplay();
}

function checkForDeath() {
    if (player.hp <= 0 || (game.target && game.target.hp <= 0)) {
        const winner = player.hp <= 0 ? game.target : player;
        const loser = player.hp <= 0 ? player : game.target;
        logBattle(`<span class="output-text-${loser === player ? 'player' : 'enemy'}">${loser.name}</span> is defeated! <span class="output-text-${winner === player ? 'player' : 'enemy'}">${winner.name}</span> wins!`);
        awardReward(winner, loser);
        endBattle();
        return true;
    }
    return false;
}

async function startBattle(player, enemy) {
    logBattle(`startBattle called! inBattle: ${inBattle}, activeJutsu: ${user.activeJutsu.length}`);
    if (inBattle) {
        logBattle("Battle already in progress!");
        await sleep(3000);
        return;
    }
    if (user.activeJutsu.length === 0) {
        logBattle("Cannot start battle: No active Jutsu equipped!");
        await sleep(3000);
        return;
    }
    inBattle = true;
    game.player = player;
    game.enemy = enemy;
    const battleScreen = document.getElementById("battle-screen");
    const fightControls = document.getElementById("fight-controls");
    const travelControls = document.getElementById("travel-controls");
    if (battleScreen && fightControls && travelControls) {
        battleScreen.classList.remove("hidden");
        fightControls.classList.add("hidden");
        travelControls.classList.add("hidden");
    } else {
        logBattle("Error: battle-screen, fight-controls, or travel-controls not found");
        inBattle = false;
        return;
    }
    updateJutsuDisplay();
    updateBattleUI();
    logBattle(`<span class="output-text-player">${user.name}</span> vs <span class="output-text-enemy">${target.name}</span>!`);
    await sleep(3000);
    await setTurnOrder();
}

async function startTrainingFight() {
    logBattle("startTrainingFight clicked!");
    if (inBattle) {
        logBattle(`Cannot start Training fights during battle! inBattle: ${inBattle}`);
        return;
    }
    game.battleType = "training";
    const enemy = generateTrainingEnemy();
    logBattle(`Generated enemy: ${enemy.name}, Jutsu: ${enemy.activeJutsu.map(j => j.name).join(", ")}`);
    await startBattle(player, enemy);
}

async function startTravelFight(destination) {
    logBattle("startTravelFight clicked!");
    if (inBattle) {
        logBattle(`Cannot start Travel fights during battle! inBattle: ${inBattle}`);
        return;
    }
    game.battleType = "travel";
    player.travelFightsCompleted = player.travelFightsCompleted || 0;
    game.targetDestination = destination;
    closeJutsuSelect();
    const enemy = generateEnemy();
    logBattle(`Generated enemy: ${enemy.name}, Jutsu: ${enemy.activeJutsu.map(j => j.name).join(", ")}`);
    await startBattle(player, enemy);
}

async function startEventFight() {
    logBattle("startEventFight clicked!");
    if (inBattle) {
        logBattle(`Cannot start Event fights during battle! inBattle: ${inBattle}`);
        return;
    }
    game.battleType = "event";
    queueOutput("<span class='output-text-neutral'>Event fight started!</span>");
    const enemy = generateEnemy();
    logBattle(`Generated enemy: ${enemy.name}, Jutsu: ${enemy.activeJutsu.map(j => j.name).join(", ")}`);
    await startBattle(player, enemy);
}

async function startArenaFight() {
    logBattle("startArenaFight clicked!");
    if (inBattle) {
        logBattle(`Cannot start Arena fights during battle! inBattle: ${inBattle}`);
        return;
    }
    game.battleType = "arena";
    queueOutput("<span class='output-text-neutral'>Arena fight started!</span>");
    const enemy = generateEnemy();
    logBattle(`Generated enemy: ${enemy.name}, Jutsu: ${enemy.activeJutsu.map(j => j.name).join(", ")}`);
    await startBattle(player, enemy);
}

async function talkToNPC() {
    logBattle("talkToNPC clicked!");
    if (inBattle) {
        logBattle(`Cannot talk to NPCs during battle! inBattle: ${inBattle}`);
        return;
    }
    queueOutput("<span class='output-text-neutral'>Talking to NPC! (Placeholder)</span>");
}

async function returnToVillage() {
    logBattle("returnToVillage clicked!");
    if (inBattle) {
        logBattle(`Cannot return to village during battle! inBattle: ${inBattle}`);
        return;
    }
    ArriveVillage(player.lastVillage);
}

async function endBattle() {
    logBattle("endBattle called!");
    inBattle = false;
    game.player = player;
    const battleScreen = document.getElementById("battle-screen");
    const fightControls = document.getElementById("fight-controls");
    const travelControls = document.getElementById("travel-controls");
    if (battleScreen && fightControls && travelControls) {
        battleScreen.classList.add("hidden");
        if (game.battleType === "travel" && game.enemy && game.enemy.hp <= 0) {
            player.travelFightsCompleted = (player.travelFightsCompleted || 0) + 1;
            queueOutput(`<span class='output-text-neutral'>Travel fight completed! ${player.travelFightsCompleted}/4 fights done.</span>`);
            await sleep(3000);
            if (player.travelFightsCompleted < 4) {
                await startTravelFight(game.targetDestination);
            } else {
                player.travelFightsCompleted = 0;
                const targetIsVillage = MapData[game.targetDestination]?.isVillage;
                if (targetIsVillage) {
                    ArriveVillage(game.targetDestination);
                } else {
                    queueOutput(`<span class='output-text-neutral'>Arrived at ${game.targetDestination}!</span>`);
                    travelControls.classList.remove("hidden");
                    travelControls.innerHTML = `
                        <button onclick="startEventFight()">Start Event Fight</button>
                        <button onclick="talkToNPC()">Talk to NPC</button>
                        <button onclick="returnToVillage()">Return to ${player.lastVillage}</button>
                    `;
                    fightControls.classList.add("hidden");
                    const villageName = document.getElementById("village-name");
                    if (villageName) {
                        villageName.textContent = game.targetDestination;
                    } else {
                        logBattle("Error: village-name not found");
                    }
                }
            }
        } else {
            if (player.hp <= 0) {
                ArriveVillage(player.lastVillage);
            } else {
                fightControls.classList.remove("hidden");
                travelControls.classList.add("hidden");
            }
        }
    } else {
        logBattle("Error: battle-screen, fight-controls, or travel-controls not found");
    }
    queueOutput("<span class='battle-ready'>Battle ended!</span>");
    game.enemy = null;
    updateJutsuDisplay();
    updateBattleUI();
    logBattle(`endBattle finished! inBattle: ${inBattle}`);
}

async function setTurnOrder() {
    logBattle(`setTurnOrder called!`);
    if (Math.random() < 0.5) {
        game.user = game.enemy;
        game.target = game.player;
        logBattle(`<span class="output-text-player">${player.name}</span> goes first!`);
        await sleep(3000);
    } else {
        game.target = game.enemy;
        game.user = game.player;
        logBattle(`<span class="output-text-enemy">${game.target.name}</span> goes first!`);
        await sleep(3000);
    }
    await takeTurn();
}

async function takeTurn() {
    if (!inBattle) {
        logBattle("Battle stopped unexpectedly!");
        await sleep(3000);
        return;
    }
    try {
        updateBattleUI();
        logBattle("");
        logBattle(`✧✧ <strong><span class="output-text-${game.user === player ? 'player' : 'enemy'}">${game.user.name}'s Turn</span></strong> ✧✧`);
        await sleep(3000);
        logBattle("");

        let skipTurn = false;
        for (let status of game.user.statusEffects) {
            if (status.startOfTurn && status.startOfTurnFunction) {
                if (await status.startOfTurnFunction(game.user, game.target)) {
                    skipTurn = true;
                }
            }
            status.duration--;
        }
        game.user.statusEffects = game.user.statusEffects.filter(status => status.duration > 0);

        if (skipTurn) {
            logBattle(`${game.user.name}'s turn skipped due to status effect!`);
            await sleep(3000);
            await endTurn();
            return;
        }

        await skillAction();
    } catch (e) {
        logBattle(`Error in takeTurn: ${e.message}`);
        await sleep(3000);
        inBattle = false;
    }
}

async function skillAction() {
    try {
        if (!game.user.activeJutsu.length) {
            logBattle(`${game.user.name} has no Active Jutsu!`);
            await sleep(3000);
            await endTurn();
            return;
        }

        const jutsu = game.user.activeJutsu[Math.floor(Math.random() * game.user.activeJutsu.length)];
        logBattle(`<span class="output-text-${game.user === player ? 'player' : 'enemy'}">${game.user.name}</span> uses ${jutsu.name}!`);
        await sleep(3000);

        if (jutsu.support) {
            await jutsu.skillFunction(game.user, game.target);
            if (checkForDeath()) return;
            await endTurn();
            return;
        }

        for (let status of game.user.statusEffects) {
            if (status.active && status.activeFunction) {
                await status.activeFunction(game.user, game.target);
            }
        }

        let endTurnFlag = false;
        for (let status of game.target.statusEffects) {
            if (status.triggered && status.triggeredFunction) {
                if (await status.triggeredFunction(game.target, game.user, jutsu.style)) {
                    endTurnFlag = true;
                }
            }
        }

        if (endTurnFlag) {
            if (checkForDeath()) return;
            await endTurn();
            return;
        }

        await jutsu.skillFunction(game.user, game.target);
        if (checkForDeath()) return;
        await endTurn();
    } catch (e) {
        logBattle(`Error in skillAction: ${e.message}`);
        await sleep(3000);
        inBattle = false;
    }
}

async function endTurn() {
    try {
        if (!inBattle) {
            logBattle("Cannot end turn: Battle is not active!");
            await sleep(3000);
            return;
        }
        [game.user, game.target] = [game.target, game.user];
        updateBattleUI();
        setTimeout(takeTurn, 1000);
    } catch (e) {
        logBattle(`Error in endTurn: ${e.message}`);
        await sleep(3000);
        inBattle = false;
    }
}

function updateBattleUI() {
    try {
        const userName = document.getElementById("user-name");
        const userHp = document.getElementById("user-hp");
        const userStatus = document.getElementById("user-status");
        const userSprite = document.getElementById("user-sprite");
        const opponentName = document.getElementById("opponent-name");
        const opponentHp = document.getElementById("opponent-hp");
        const opponentStatus = document.getElementById("opponent-status");
        const opponentSprite = document.getElementById("opponent-sprite");
        const playerRank = document.getElementById("player-rank");
        const playerXp = document.getElementById("player-xp");

        if (!userName || !userHp || !userStatus || !userSprite || !opponentName || !opponentHp || !opponentStatus || !opponentSprite || !playerRank || !playerXp) {
            logBattle("Error: One or more UI elements missing in updateBattleUI!");
            inBattle = false;
            return;
        }

        userName.textContent = player.name;
        userHp.textContent = `${player.hp}/${player.maxHp}`;
        userStatus.textContent = player.statusEffects.map(s => statusEmojis[s.name] || s.name).join(" ") || "None";
        userSprite.src = player.sprite;
        opponentName.textContent = game.enemy ? game.enemy.name : "None";
        opponentHp.textContent = game.enemy ? `${game.enemy.hp}/${game.enemy.maxHp}` : "0/0";
        opponentStatus.textContent = game.target ? game.enemy.statusEffects.map(s => statusEmojis[s.name] || s.name).join(" ") || "None" : "None";
        opponentSprite.src = game.enemy ? game.enemy.sprite : "https://via.placeholder.com/120x160";
        playerRank.textContent = player.rank;
        playerXp.textContent = player.xp;
    } catch (e) {
        logBattle(`Error in updateBattleUI: ${e.message}`);
        inBattle = false;
    }
}

// Initialize Game
function initializeGame() {
    player = new Mob(
        "Shinobi",
        10,
        10,
        "Student",
        { Ninjutsu: "D-Rank", Taijutsu: "D-Rank", Genjutsu: "D-Rank" },
        [],
        [],
        [],
        "https://raw.githubusercontent.com/Mikiiill/ShinobiWay/refs/heads/main/Assets/NINJA1.PNG"
    );
    game.player = player;
    inBattle = false;
    assignRandomJutsu(player, 3); // Changed to 3 to match previous behavior
    updateJutsuDisplay();
    updateBattleUI();
    ArriveVillage("Newb Village");
    logBattle("Game initialized!");
    logBattle(`Initial activeJutsu: ${player.activeJutsu.map(j => j.name).join(", ") || "None"}`);
}

function assignRandomJutsu(mob, count) {
    const eligibleJutsu = skills.skills.filter(jutsu => skills.canUseSkill(mob, jutsu));
    if (eligibleJutsu.length === 0) {
        logBattle("Error: No eligible Jutsu found! Assigning Barrage as fallback.");
        console.error("No eligible Jutsu", mob.fightingStyles, skills.skills.map(s => ({ name: s.name, requirements: s.requirements })));
        mob.activeJutsu = [skills.findSkill("Barrage")];
        return;
    }
    const shuffled = eligibleJutsu.sort(() => 0.5 - Math.random()).slice(0, count);
    mob.activeJutsu = shuffled;
    logBattle(`Assigned ${count} Jutsu to ${mob.name}: ${shuffled.map(j => j.name).join(", ") || "None"}`);
}

// Run initialization
initializeGame();
