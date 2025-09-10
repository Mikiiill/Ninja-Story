// game.js
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
            new BattleSkill("Bite", ["Beast"], { Beast: "C-Rank" }, this.bite.bind(this), "beast", false, "C-Rank"),
            new BattleSkill("Night Terror Jutsu", ["Genjutsu"], { Genjutsu: "B-Rank" }, this.nightTerrorJutsu.bind(this), "genjutsu", false, "B-Rank")
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
        await sleep(2000);
        updateBattleUI();
        if (checkForDeath()) return true;
        if (target.hp > 0) {
            target.hp = Math.max(0, Math.min(target.maxHp, target.hp - comboDamage));
            logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> combos ${target.name} for ${comboDamage} damage!`);
            await sleep(2000);
            updateBattleUI();
            if (checkForDeath()) return true;
        }
        return false;
    }

    async substitutionJutsu(user, target) {
        user.statusEffects.push(new StatusEffect("Swap", 1, 0, false, false, true, null, null, 
            async (target, user, skillStyle) => {
                logBattle(`<span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> uses Substitution to dodge the attack with a log!`);
                await sleep(2000);
                target.statusEffects = target.statusEffects.filter(e => e.name !== "Swap");
                updateBattleUI();
                return true;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> prepares <span class="output-text-neutral">Substitution Jutsu</span> <span class="status-substitution">🪵</span>!`);
        await sleep(2000);
        updateBattleUI();
        return true;
    }

    async shadowCloneJutsu(user, target) {
        if (user.hp < 2) {
            logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> does not have enough HP to cast <span class="output-text-neutral">Shadow Clone Jutsu</span>!`);
            await sleep(2000);
            return false;
        }
        let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
        if (cloneCount >= 3) {
            logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> already has the maximum of 3 shadow clones!`);
            await sleep(2000);
            return false;
        }
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp - 2));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-neutral">Shadow Clone Jutsu</span>, adding a clone <span class="status-shadowcloneeffect">👥</span>!`);
        await sleep(2000);
        updateBattleUI();
        if (checkForDeath()) return true;
        user.statusEffects.push(new StatusEffect("ShadowCloneEffect", 3, 0, false, true, true, null, 
            async (user, target) => {
                let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
                for (let i = 0; i < cloneCount; i++) {
                    logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">Shadow Clone ${i + 1} uses Barrage on ${target.name}!</span>`);
                    await sleep(2000);
                    await this.barrage(user, target);
                    if (checkForDeath()) return true;
                }
                user.statusEffects = user.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                return false;
            }, 
            async (target, user, skillStyle) => {
                let cloneCount = target.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
                if (cloneCount > 0) {
                    logBattle(`<span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span>'s Shadow Clone absorbs the attack!`);
                    await sleep(2000);
                    target.statusEffects.splice(target.statusEffects.findIndex(e => e.name === "ShadowCloneEffect"), 1);
                    updateBattleUI();
                    return true;
                }
                return false;
            }));
        updateBattleUI();
        return false;
    }

    async demonicVision(user, target) {
        let damage = 1;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Doom", 5, 1, true, false, false, 
            async (user, target, status) => {
                user.hp = Math.max(0, user.hp - status.damage);
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> takes ${status.damage} from <span class="status-doom">Doom 💀</span>!`);
                await sleep(2000);
                updateBattleUI();
                if (checkForDeath()) return true;
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-genjutsu">Demonic Vision</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-doom">Doom 💀</span>!`);
        await sleep(2000);
        updateBattleUI();
        if (checkForDeath()) return true;
        return false;
    }

    async healingStance(user, target) {
        let heal = user.hp < user.maxHp ? 1 : 0;
        user.hp = Math.min(user.maxHp, user.hp + heal);
        user.statusEffects.push(new StatusEffect("Regen", 3, 1, true, false, false, 
            async (user, target, status) => {
                let heal = user.hp < user.maxHp ? status.damage : 0;
                user.hp = Math.min(user.maxHp, user.hp + heal);
                if (heal > 0) {
                    logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> heals ${heal} HP from <span class="status-regen">Regen 🌿</span>!`);
                    await sleep(2000);
                    updateBattleUI();
                    if (checkForDeath()) return true;
                }
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> enters <span class="output-text-neutral">Healing Stance</span>${heal > 0 ? `, healing ${heal} HP` : ""} <span class="status-regen">🌿</span>!`);
        await sleep(2000);
        updateBattleUI();
        if (checkForDeath()) return true;
        return true;
    }

    async earthDomeJutsu(user, target) {
        user.statusEffects.push(new StatusEffect("Dome", 2, 0, false, false, true, null, null, 
            async (target, user, skillStyle) => {
                if (skillStyle !== "genjutsu") {
                    logBattle(`<span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> uses Earth Dome to mitigate the attack!`);
                    await sleep(2000);
                    target.statusEffects = target.statusEffects.filter(e => e.name !== "Dome");
                    updateBattleUI();
                    return true;
                }
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> raises <span class="output-text-earth">Earth Dome Jutsu</span> <span class="status-dome">🪨</span>!`);
        await sleep(2000);
        updateBattleUI();
        return true;
    }

    async flameThrowJutsu(user, target) {
        let damage = Math.floor(Math.random() * 2) + 4;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burn", 1, 2, true, false, false, 
            async (user, target, status) => {
                user.hp = Math.max(0, user.hp - status.damage);
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> takes ${status.damage} from <span class="status-burn">Burn 🔥</span>!`);
                await sleep(2000);
                updateBattleUI();
                if (checkForDeath()) return true;
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Flame Throw Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burn">Burn 🔥</span>!`);
        await sleep(2000);
        updateBattleUI();
        if (checkForDeath()) return true;
        return false;
    }

    async staticFieldJutsu(user, target) {
        let damage = Math.floor(Math.random() * 2) + 2;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        user.statusEffects.push(new StatusEffect("Numb", 1, 0, true, false, false, 
            async (user, target) => {
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> is stunned by <span class="status-numb">Numb ⚡️</span> and skips their turn!`);
                await sleep(2000);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb");
                updateBattleUI();
                return true;
            }));
        target.statusEffects.push(new StatusEffect("Numb", 1, 0, true, false, false, 
            async (user, target) => {
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> is stunned by <span class="status-numb">Numb ⚡️</span> and skips their turn!`);
                await sleep(2000);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb");
                updateBattleUI();
                return true;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-lightning">Static Field Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-numb">Numb ⚡️</span> on both!`);
        await sleep(2000);
        updateBattleUI();
        if (checkForDeath()) return true;
        return false;
    }

    async fireballJutsu(user, target) {
        let damage = Math.floor(Math.random() * 2) + 3;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burn", 1, 1, true, false, false, 
            async (user, target, status) => {
                user.hp = Math.max(0, user.hp - status.damage);
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> takes ${status.damage} from <span class="status-burn">Burn 🔥</span>!`);
                await sleep(2000);
                updateBattleUI();
                if (checkForDeath()) return true;
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Fireball Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burn">Burn 🔥</span>!`);
        await sleep(2000);
        updateBattleUI();
        if (checkForDeath()) return true;
        return false;
    }

    async dynamicEntry(user, target) {
        let damage = 1;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-neutral">Dynamic Entry</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage!`);
        await sleep(2000);
        updateBattleUI();
        if (checkForDeath()) return true;
        if (!user.statusEffects.some(e => e.name === "DynamicEntryProc")) {
            user.statusEffects.push(new StatusEffect("DynamicEntryProc", 1, 0, false, false, false, null, null, null));
            let usableSkills = user.activeJutsu.filter(skill => !skill.support && skill.name !== "Dynamic Entry");
            let nextSkill = usableSkills.length > 0 ? usableSkills[Math.floor(Math.random() * usableSkills.length)] : null;
            if (nextSkill) {
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> chains with ${nextSkill.name}!`);
                await sleep(2000);
                await nextSkill.skillFunction(user, target);
                if (checkForDeath()) return true;
            }
            user.statusEffects = user.statusEffects.filter(e => e.name !== "DynamicEntryProc");
        }
        return false;
    }

    async falconDrop(user, target) {
        let damage = 2;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp - 2));
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Numb", 1, 0, true, false, false, 
            async (user, target) => {
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> is stunned by <span class="status-numb">Numb ⚡️</span> and skips their turn!`);
                await sleep(2000);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb");
                updateBattleUI();
                return true;
            }));
        if (!user.statusEffects.some(e => e.name === "READY")) {
            user.statusEffects.push(new StatusEffect("READY", 2, 0, false, true, false, null, 
                async (user, target) => {
                    if (target.hp > 0) {
                        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> unleashes a Barrage due to <span class="status-ready">READY 💪</span>!`);
                        await sleep(2000);
                        await this.barrage(user, target);
                        if (checkForDeath()) return true;
                    }
                    user.statusEffects = user.statusEffects.filter(e => e.name === "READY");
                    return false;
                }));
        }
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-neutral">Falcon Drop</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, stunning target and taking 2 damage! <span class="status-ready">READY 💪</span> applied!`);
        await sleep(2000);
        updateBattleUI();
        if (checkForDeath()) return true;
        return false;
    }

    async rockSmashJutsu(user, target) {
        let damage = 6;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-earth">Rock Smash Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage!`);
        await sleep(2000);
        updateBattleUI();
        if (checkForDeath()) return true;
        return false;
    }

    async genjutsuRelease(user, target) {
        user.statusEffects = user.statusEffects.filter(e => e.name !== "Doom");
        user.statusEffects.push(new StatusEffect("Release", 1, 0, false, false, true, null, null, 
            async (target, user, skillStyle) => {
                if (skillStyle === "genjutsu") {
                    logBattle(`<span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> uses Release to resist the Genjutsu attack!`);
                    await sleep(2000);
                    target.statusEffects = target.statusEffects.filter(e => e.name !== "Release");
                    updateBattleUI();
                    return true;
                }
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-genjutsu">Genjutsu Release</span>, dispelling Doom and gaining <span class="status-release">Release 🌀</span>!`);
        await sleep(2000);
        updateBattleUI();
        return true;
    }

    async lightningEdge(user, target) {
        let damage = Math.floor(Math.random() * 2) + 4;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects = target.statusEffects.filter(effect => !effect.triggered);
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> strikes with <span class="output-text-lightning">Lightning Edge</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, breaking all triggered status effects!`);
        await sleep(2000);
        updateBattleUI();
        if (checkForDeath()) return true;
        return false;
    }

    async bite(user, target) {
        let damage = 1;
        let heal = user.hp < user.maxHp ? 1 : 0;
        user.hp = Math.min(user.maxHp, user.hp + heal);
        if (heal > 0) {
            logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> heals ${heal} HP from <span class="output-text-beast">Bite</span>!`);
            await sleep(2000);
            updateBattleUI();
            if (checkForDeath()) return true;
        }
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Bleed", 2, 1, true, false, false, 
            async (user, target, status) => {
                user.hp = Math.max(0, user.hp - status.damage);
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> takes ${status.damage} from <span class="status-bleed">Bleed 🩸</span>!`);
                await sleep(2000);
                updateBattleUI();
                if (checkForDeath()) return true;
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-beast">Bite</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-bleed">Bleed 🩸</span>!`);
        await sleep(2000);
        updateBattleUI();
        if (checkForDeath()) return true;
        return false;
    }

    async nightTerrorJutsu(user, target) {
        target.statusEffects.push(new StatusEffect("Numb", 1, 0, true, false, false, 
            async (user, target) => {
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> is stunned by <span class="status-numb">Numb ⚡️</span> and skips their turn!`);
                await sleep(2000);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb");
                updateBattleUI();
                return true;
            }));
        target.statusEffects.push(new StatusEffect("Doom", 5, 1, true, false, false, 
            async (user, target, status) => {
                user.hp = Math.max(0, user.hp - status.damage);
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> takes ${status.damage} from <span class="status-doom">Doom 💀</span>!`);
                await sleep(2000);
                updateBattleUI();
                if (checkForDeath()) return true;
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-genjutsu">Night Terror Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span>, inflicting <span class="status-numb">Numb ⚡️</span> and <span class="status-doom">Doom 💀</span>!`);
        await sleep(2000);
        updateBattleUI();
        return false;
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
function logBattle(message, isTutorial = false) {
    const log = document.getElementById("battle-log-content");
    if (log) {
        const newMessage = document.createElement("p");
        newMessage.innerHTML = isTutorial ? `<strong class="tutorial-message">${message}</strong>` : message;
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

// Close All Menus
function closeAllMenus() {
    const jutsuManagement = document.getElementById("jutsu-management-content");
    const jutsuSelect = document.querySelector(".jutsu-select");
    const travelControls = document.getElementById("travel-controls");
    if (jutsuManagement) jutsuManagement.classList.add("hidden");
    if (jutsuSelect) jutsuSelect.classList.add("hidden");
    if (travelControls) travelControls.classList.add("hidden");
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
    if (inBattle) {
        logBattle(`Cannot toggle Jutsu menu during battle! inBattle: ${inBattle}`);
        return;
    }
    const content = document.getElementById("jutsu-management-content");
    const fightControls = document.getElementById("fight-controls");
    if (content && fightControls) {
        closeAllMenus();
        content.classList.toggle("hidden");
        if (!content.classList.contains("hidden")) {
            fightControls.classList.add("hidden");
        } else {
            fightControls.classList.remove("hidden");
        }
    } else {
        logBattle("Error: jutsu-management-content or fight-controls not found");
    }
}

function closeJutsuMenu() {
    if (inBattle) {
        logBattle(`Cannot close Jutsu menu during battle! inBattle: ${inBattle}`);
        return;
    }
    const content = document.getElementById("jutsu-management-content");
    const fightControls = document.getElementById("fight-controls");
    if (content && fightControls) {
        content.classList.add("hidden");
        fightControls.classList.remove("hidden");
    } else {
        logBattle("Error: jutsu-management-content or fight-controls not found");
    }
}

// Jutsu Selection
const skills = new Skills();

function openJutsuSelect() {
    if (inBattle) {
        logBattle(`Cannot select Jutsu during battle! inBattle: ${inBattle}`);
        return;
    }
    const optionsDiv = document.getElementById("jutsu-options");
    const fightControls = document.getElementById("fight-controls");
    if (optionsDiv && fightControls) {
        closeAllMenus();
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
            fightControls.classList.add("hidden");
            optionsDiv.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            logBattle("Error: jutsu-select not found");
        }
    } else {
        logBattle("Error: jutsu-options or fight-controls not found");
    }
}

function closeJutsuSelect() {
    const jutsuSelect = document.querySelector(".jutsu-select");
    const fightControls = document.getElementById("fight-controls");
    if (jutsuSelect && fightControls) {
        closeAllMenus();
        fightControls.classList.remove("hidden");
    } else {
        logBattle("Error: jutsu-select or fight-controls not found");
    }
}

function addJutsuToInventory(jutsu) {
    const totalCopies = player.activeJutsu.concat(player.inventory).filter(j => j.name === jutsu.name).length;
    if (totalCopies >= 4) {
        logBattle(`Cannot add ${jutsu.name}: Max 4 copies allowed!`);
        return;
    }
    player.inventory.push(jutsu);
    player.activeJutsu.push(player.inventory.pop());
    updateJutsuDisplay();
    closeJutsuSelect();
    if (game.tutorialState && game.tutorialState.jutsuSelectionsRemaining > 0) {
        game.tutorialState.jutsuSelectionsRemaining -= 1;
        logBattle(`<strong class="tutorial-message">Jutsu selected! ${game.tutorialState.jutsuSelectionsRemaining} more to select.</strong>`, true);
        if (game.tutorialState.jutsuSelectionsRemaining > 0) {
            setTimeout(openJutsuSelect, 1000);
        } else {
            const specificJutsus = [
                skills.findSkill("Substitution Jutsu"),
                skills.findSkill("Barrage"),
                skills.findSkill("Barrage"),
                skills.findSkill("Healing Stance")
            ];
            specificJutsus.forEach(jutsu => {
                if (jutsu && player.activeJutsu.concat(player.inventory).filter(j => j.name === jutsu.name).length < 4) {
                    player.inventory.push(jutsu);
                    player.activeJutsu.push(player.inventory.pop());
                }
            });
            logBattle(`<strong class="tutorial-message">Equipped 6 Jutsus: ${player.activeJutsu.map(j => j.name).join(", ")}</strong>`, true);
            game.tutorialState = null;
            logBattle(`<strong class="tutorial-message">Tutorial completed! Welcome to Newb Village!</strong>`, true);
            logBattle(`<strong class="tutorial-message">Train 10 times to obtain a new Jutsu. Jutsu appear based on your Fighting Style Ranks.</strong>`, true);
            logBattle(`<strong class="tutorial-message">Reach 10 jutsu to become a Genin.</strong>`, true);
            ArriveVillage("Newb Village");
        }
    }
}

// Rank Up Selection
function openRankUpSelect() {
    if (inBattle) {
        logBattle(`Cannot rank up during battle! inBattle: ${inBattle}`);
        return;
    }
    const optionsDiv = document.getElementById("jutsu-options");
    const fightControls = document.getElementById("fight-controls");
    if (optionsDiv && fightControls) {
        closeAllMenus();
        optionsDiv.innerHTML = "";
        const availableStyles = ["Ninjutsu", "Genjutsu", "Taijutsu", "Fire", "Lightning", "Earth"];
        availableStyles.forEach(style => {
            const currentRank = player.fightingStyles[style] || "None";
            const card = document.createElement("div");
            card.className = "jutsu-card";
            card.innerHTML = `
                <h4>${style}</h4>
                <p>Current Rank: ${currentRank}</p>
            `;
            card.onclick = () => upgradeFightingStyle(style);
            optionsDiv.appendChild(card);
        });
        const jutsuSelect = document.querySelector(".jutsu-select");
        if (jutsuSelect) {
            jutsuSelect.classList.remove("hidden");
            fightControls.classList.add("hidden");
            optionsDiv.scrollIntoView({ behavior: "smooth", block: "start" });
            if (!game.tutorialState) {
                game.rankUpPoints = 2;
            }
        } else {
            logBattle("Error: jutsu-select not found");
        }
    } else {
        logBattle("Error: jutsu-options or fight-controls not found");
    }
}

function upgradeFightingStyle(style) {
    if (inBattle) {
        logBattle(`Cannot upgrade fighting style during battle! inBattle: ${inBattle}`);
        return;
    }
    if (!game.rankUpPoints || game.rankUpPoints <= 0) {
        logBattle("No RANKUP points remaining!");
        closeJutsuSelect();
        return;
    }
    const ranks = ["D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"];
    const currentRank = player.fightingStyles[style] || "None";
    let newRank;
    if (currentRank === "None") {
        newRank = "C-Rank";
    } else if (currentRank === "S-Rank") {
        logBattle(`${style} is already at maximum rank (S-Rank)!`);
        return;
    } else {
        const currentIndex = ranks.indexOf(currentRank);
        newRank = ranks[currentIndex + 1];
    }
    player.fightingStyles[style] = newRank;
    game.rankUpPoints -= 1;
    logBattle(`<strong class="tutorial-message">Upgraded ${style} to ${newRank}! ${game.rankUpPoints} RANKUP point(s) remaining.</strong>`, game.tutorialState !== null);
    if (game.rankUpPoints === 0) {
        closeJutsuSelect();
        if (game.tutorialState && game.tutorialState.phase === "rankUp") {
            game.tutorialState.phase = "jutsuSelection";
            game.tutorialState.jutsuSelectionsRemaining = 2;
            logBattle(`<strong class="tutorial-message">Rank Up complete! Now select two starting Jutsu.</strong>`, true);
            setTimeout(openJutsuSelect, 1000);
        }
    } else {
        openRankUpSelect();
    }
    updateJutsuDisplay();
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
        const toggleJutsuBtn = document.getElementById("toggle-jutsu-btn");
        if (toggleJutsuBtn) toggleJutsuBtn.disabled = inBattle;
    } else {
        logBattle("Error: active-jutsu or inventory-jutsu not found");
    }
}

function moveJutsuToInventory(index) {
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
    if (inBattle) {
        logBattle(`Cannot travel during battle! inBattle: ${inBattle}`);
        return;
    }
    const optionsDiv = document.getElementById("jutsu-options");
    const fightControls = document.getElementById("fight-controls");
    if (optionsDiv && fightControls) {
        closeAllMenus();
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
            fightControls.classList.add("hidden");
            optionsDiv.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            logBattle("Error: jutsu-select not found");
        }
    } else {
        logBattle("Error: jutsu-options or fight-controls not found");
    }
}

function ArriveVillage(village) {
    player.hp = player.maxHp;
    player.statusEffects = [];
    player.lastVillage = village;
    inBattle = false;
    const battleScreen = document.getElementById("battle-screen");
    const fightControls = document.getElementById("fight-controls");
    const travelControls = document.getElementById("travel-controls");
    if (battleScreen && fightControls && travelControls) {
        closeAllMenus();
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
    opponent: null,
    user: null,
    target: null,
    targetDestination: null,
    rankUpPoints: 0,
    tutorialState: null,
    battleEnded: false
};

async function awardReward(winner, loser) {
    if (game.battleType === "training" && (winner === player || (winner === "both" && loser === "both"))) {
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
    if (!game.player || !game.target) return false;
    
    let winner = null;
    let loser = null;

    if (game.player.hp <= 0 && game.target.hp <= 0) {
        winner = "both";
        loser = "both";
        logBattle(`<span class="output-text-player">${game.player.name}</span> and <span class="output-text-enemy">${game.target.name}</span> are both defeated! Both win!`);
    } else if (game.player.hp <= 0) {
        winner = game.target;
        loser = game.player;
        logBattle(`<span class="output-text-player">${game.player.name}</span> is defeated! <span class="output-text-enemy">${game.target.name}</span> wins!`);
    } else if (game.target.hp <= 0) {
        winner = game.player;
        loser = game.target;
        logBattle(`<span class="output-text-enemy">${game.target.name}</span> is defeated! <span class="output-text-player">${game.player.name}</span> wins!`);
    }

    if (winner) {
        endBattle(winner, loser);
        return true;
    }
    return false;
}

async function startBattle(player, opponent) {
    if (inBattle) {
        logBattle("Battle already in progress!");
        await sleep(3000);
        return;
    }
    if (player.activeJutsu.length === 0) {
        logBattle("Cannot start battle: No active Jutsu equipped!");
        await sleep(3000);
        return;
    }
    inBattle = true;
    game.battleEnded = false;
    game.player = player;
    game.opponent = opponent;
    game.user = null;
    game.target = null;
    const battleScreen = document.getElementById("battle-screen");
    const fightControls = document.getElementById("fight-controls");
    const travelControls = document.getElementById("travel-controls");
    if (battleScreen && fightControls && travelControls) {
        closeAllMenus();
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
    logBattle(`<span class="output-text-player">${game.player.name}</span> vs <span class="output-text-enemy">${game.opponent.name}</span>!`);
    await sleep(1000);
    await setTurnOrder();
}

async function startTrainingFight() {
    if (inBattle) {
        logBattle(`Cannot start Training fights during battle! inBattle: ${inBattle}`);
        return;
    }
    game.battleType = "training";
    const opponent = generateTrainingEnemy();
    logBattle(`Generated enemy: ${opponent.name}, Jutsu: ${opponent.activeJutsu.map(j => j.name).join(", ")}`);
    await startBattle(player, opponent);
}

async function startTravelFight(destination) {
    if (inBattle) {
        logBattle(`Cannot start Travel fights during battle! inBattle: ${inBattle}`);
        return;
    }
    game.battleType = "travel";
    player.travelFightsCompleted = player.travelFightsCompleted || 0;
    game.targetDestination = destination;
    closeJutsuSelect();
    const opponent = generateEnemy();
    logBattle(`Generated enemy: ${opponent.name}, Jutsu: ${opponent.activeJutsu.map(j => j.name).join(", ")}`);
    await startBattle(player, opponent);
}

async function startEventFight() {
    if (inBattle) {
        logBattle(`Cannot start Event fights during battle! inBattle: ${inBattle}`);
        return;
    }
    game.battleType = "event";
    queueOutput("<span class='output-text-neutral'>Event fight started!/</span>");
    const opponent = generateEnemy();
    logBattle(`Generated enemy: ${opponent.name}, Jutsu: ${opponent.activeJutsu.map(j => j.name).join(", ")}`);
    await startBattle(player, opponent);
}

async function startArenaFight() {
    if (inBattle) {
        logBattle(`Cannot start Arena fights during battle! inBattle: ${inBattle}`);
        return;
    }
    game.battleType = "arena";
    queueOutput("<span class='output-text-neutral'>Arena fight started!</span>");
    const opponent = generateEnemy();
    logBattle(`Generated enemy: ${opponent.name}, Jutsu: ${opponent.activeJutsu.map(j => j.name).join(", ")}`);
    await startBattle(player, opponent);
}

async function endBattle(winner, loser) {
    if (game.battleEnded) return;
    game.battleEnded = true;
    inBattle = false;
    game.user = null;
    game.target = null;
    await sleep(3000);
    await awardReward(winner, loser);
    game.player = player;
    game.opponent = null;
    const battleScreen = document.getElementById("battle-screen");
    const fightControls = document.getElementById("fight-controls");
    const travelControls = document.getElementById("travel-controls");
    if (battleScreen && fightControls && travelControls) {
        closeAllMenus();
        battleScreen.classList.add("hidden");
        if (game.battleType === "travel" && player.travelFightsCompleted < 4) {
            player.travelFightsCompleted = (player.travelFightsCompleted || 0) + 1;
            queueOutput(`<span class='output-text-neutral'>Travel fight completed! ${player.travelFightsCompleted}/4 fights done.</span>`);
            await sleep(3000);
            if (player.travelFightsCompleted < 4) {
                await startTravelFight(game.targetDestination);
            } else {
                player.travelFightsCompleted = 0;
                ArriveVillage(game.targetDestination);
            }
        } else {
            ArriveVillage(player.lastVillage);
        }
    } else {
        logBattle("Error: battle-screen, fight-controls, or travel-controls not found");
    }
    queueOutput("<span class='battle-ready'>Battle ended!</span>");
    updateJutsuDisplay();
    updateBattleUI();
}

async function setTurnOrder() {
    if (Math.random() < 0.5) {
        game.user = game.player;
        game.target = game.opponent;
        logBattle(`<span class="output-text-player">${game.player.name}</span> goes first!`);
    } else {
        game.user = game.opponent;
        game.target = game.player;
        logBattle(`<span class="output-text-enemy">${game.opponent.name}</span> goes first!`);
    }
    await sleep(1000);
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
        await sleep(1000);
        let skipTurn = false;
        let battleEnded = false; // New flag to break loop
        for (let status of game.user.statusEffects) {
            if (status.startOfTurn && status.startOfTurnFunction) {
                if (await status.startOfTurnFunction(game.user, game.target, status)) {
                    skipTurn = true;
                }
                if (checkForDeath()) {
                    battleEnded = true;
                    break;
                }
                if (!inBattle) {
                    battleEnded = true;
                    break;
                }
            }
            if (battleEnded) break;
            status.duration--;
            if (!inBattle) {
                battleEnded = true;
                break;
            }
        }
        if (battleEnded) return;
        game.user.statusEffects = game.user.statusEffects.filter(status => status.duration > 0);
        updateBattleUI();
        if (checkForDeath()) return;
        if (skipTurn) {
            logBattle(`${game.user.name}'s turn skipped due to status effect!`);
            await sleep(2000);
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
            await sleep(2000);
            await endTurn();
            return;
        }
        const jutsu = game.user.activeJutsu[Math.floor(Math.random() * game.user.activeJutsu.length)];
        logBattle(`<span class="output-text-${game.user === player ? 'player' : 'enemy'}">${game.user.name}</span> uses ${jutsu.name}!`);
        await sleep(2000);
        for (let status of game.user.statusEffects) {
            if (status.active && status.activeFunction) {
                await status.activeFunction(game.user, game.target);
                if (checkForDeath()) return;
            }
            status.new = false;
        }
        if (jutsu.support) {
            await jutsu.skillFunction(game.user, game.target);
            if (checkForDeath()) return;
            await endTurn();
            return;
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
        const villageInfo = document.getElementById("village-info");
        if (!userName || !userHp || !userStatus || !userSprite || !opponentName || !opponentHp || !opponentStatus || !opponentSprite || !playerRank || !playerXp || !villageInfo) {
            logBattle("Error: One or more UI elements missing in updateBattleUI!");
            inBattle = false;
            return;
        }
        userName.textContent = game.player ? game.player.name : "None";
        userHp.textContent = game.player ? `${game.player.hp}/${game.player.maxHp}` : "0/0";
        userStatus.textContent = game.player ? game.player.statusEffects.map(s => statusEmojis[s.name] || s.name).join(" ") || "None" : "None";
        userSprite.src = game.player ? game.player.sprite : "https://raw.githubusercontent.com/Mikiiill/ShinobiWay/refs/heads/main/Assets/NINJA1.PNG";
        opponentName.textContent = game.opponent ? game.opponent.name : "None";
        opponentHp.textContent = game.opponent ? `${game.opponent.hp}/${game.opponent.maxHp}` : "0/0";
        opponentStatus.textContent = game.opponent ? game.opponent.statusEffects.map(s => statusEmojis[s.name] || s.name).join(" ") || "None" : "None";
        opponentSprite.src = game.opponent ? game.opponent.sprite : "https://raw.githubusercontent.com/Mikiiill/ShinobiWay/refs/heads/main/Assets/NINJA2.PNG";
        playerRank.textContent = game.player ? game.player.rank : "None";
        playerXp.textContent = game.player ? game.player.xp : 0;
        villageInfo.classList.toggle("battle-mode", inBattle);
    } catch (e) {
        logBattle(`Error in updateBattleUI: ${e.message}`);
        inBattle = false;
    }
}

// Tutorial Function
async function startTutorial() {
    logBattle("Welcome to Ninja Story! Let's begin your training.", true);
    await sleep(3000);
    logBattle("First, select two fighting styles to rank up!", true);
    await sleep(3000);
    game.tutorialState = {
        phase: "rankUp",
        jutsuSelectionsRemaining: 0
    };
    game.rankUpPoints = 2;
    openRankUpSelect();
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
    updateJutsuDisplay();
    updateBattleUI();
    startTutorial();
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
