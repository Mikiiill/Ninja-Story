// game.js
const logOutput = document.getElementById("log-output");
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
let inBattle = false;
let currentTurn = 0;
let turnOrder = [];
const game = {
    player: null,
    enemy: null,
    user: null,
    target: null,
    battleType: null,
    targetDestination: null,
    jutsuList: []
};
let player = new Character("Shinobi", 20, 20, [], [], "https://via.placeholder.com/120x160");
const skills = {
    skills: [],
    canUseSkill: (player, jutsu) => {
        return Object.keys(jutsu.requirements).every(req => {
            return player.styleRanks[req] && player.styleRanks[req] >= jutsu.requirements[req];
        });
    }
};

class StatusEffect {
    constructor(name, duration, power, isPermanent, active, triggered, onTurn, activeFunction, triggeredFunction) {
        this.name = name;
        this.duration = duration;
        this.power = power;
        this.damage = power;
        this.isPermanent = isPermanent;
        this.active = active;
        this.triggered = triggered;
        this.onTurn = onTurn;
        this.activeFunction = activeFunction;
        this.triggeredFunction = triggeredFunction;
    }
}

class Character {
    constructor(name, hp, maxHp, statusEffects, jutsuList, sprite, rank = "Genin", xp = 0) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.statusEffects = statusEffects;
        this.jutsuList = jutsuList;
        this.activeJutsu = [];
        this.sprite = sprite;
        this.rank = rank;
        this.xp = xp;
        this.styleRanks = {
            Taijutsu: "B-Rank",
            Ninjutsu: "C-Rank",
            Genjutsu: "B-Rank",
            Earth: "B-Rank",
            Fire: "C-Rank",
            Lightning Brown: "C-Rank",
            Lightning: "C-Rank",
            Beast: "C-Rank"
        };
    }

    findSkill(name) {
        return this.activeJutsu.find(skill => skill.name === name);
    }
}

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

// Jutsu Functions (as provided)
async function barrage(user, target) {
    try {
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
    } catch (e) {
        logBattle(`Error in barrage: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function substitutionJutsu(user, target) {
    try {
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
    } catch (e) {
        logBattle(`Error in substitutionJutsu: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function shadowCloneJutsu(user, target) {
    try {
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
                    await barrage(user, target);
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
    } catch (e) {
        logBattle(`Error in shadowCloneJutsu: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function demonicVision(user, target) {
    try {
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
    } catch (e) {
        logBattle(`Error in demonicVision: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function healingStance(user, target) {
    try {
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
    } catch (e) {
        logBattle(`Error in healingStance: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function earthDomeJutsu(user, target) {
    try {
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
    } catch (e) {
        logBattle(`Error in earthDomeJutsu: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function flameThrowJutsu(user, target) {
    try {
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
    } catch (e) {
        logBattle(`Error in flameThrowJutsu: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function staticFieldJutsu(user, target) {
    try {
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
    } catch (e) {
        logBattle(`Error in staticFieldJutsu: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function fireballJutsu(user, target) {
    try {
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
    } catch (e) {
        logBattle(`Error in fireballJutsu: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function dynamicEntry(user, target) {
    try {
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
    } catch (e) {
        logBattle(`Error in dynamicEntry: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function falconDrop(user, target) {
    try {
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
                let barrageSkill = user.findSkill("Barrage");
                if (barrageSkill) await barrageSkill.skillFunction(user, target);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "READY");
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-neutral">Falcon Drop</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, stunning target and taking 2 damage!`);
        await sleep(3000);
        return target.hp <= 0;
    } catch (e) {
        logBattle(`Error in falconDrop: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function rockSmashJutsu(user, target) {
    try {
        let damage = 6;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-earth">Rock Smash Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage!`);
        await sleep(3000);
        return target.hp <= 0;
    } catch (e) {
        logBattle(`Error in rockSmashJutsu: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function genjutsuRelease(user, target) {
    try {
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
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-genjutsu">Genjutsu Release</span>, dispelling Doom and gaining <span class="status-substitution">Release 🌀</span>!`);
        await sleep(3000);
        return true;
    } catch (e) {
        logBattle(`Error in genjutsuRelease: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function lightningEdge(user, target) {
    try {
        let damage = Math.floor(Math.random() * 2) + 4;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects = target.statusEffects.filter(effect => !effect.triggered);
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> strikes with <span class="output-text-lightning">Lightning Edge</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, breaking all triggered status effects!`);
        await sleep(3000);
        return target.hp <= 0;
    } catch (e) {
        logBattle(`Error in lightningEdge: ${e.message}`);
        inBattle = false;
        return false;
    }
}

async function bite(user, target) {
    try {
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
    } catch (e) {
        logBattle(`Error in bite: ${e.message}`);
        inBattle = false;
        return false;
    }
}

// Define Jutsu
const barrageSkill = new BattleSkill("Barrage", ["Taijutsu"], {}, barrage, "neutral", false, "D-Rank");
const substitutionJutsuSkill = new BattleSkill("Substitution Jutsu", [], { Ninjutsu: "D-Rank", Taijutsu: "D-Rank" }, substitutionJutsu, "neutral", true, "D-Rank");
const shadowCloneJutsuSkill = new BattleSkill("Shadow Clone Jutsu", ["Ninjutsu"], { Ninjutsu: "C-Rank" }, shadowCloneJutsu, "neutral", true, "C-Rank");
const demonicVisionSkill = new BattleSkill("Demonic Vision", ["Genjutsu"], { Genjutsu: "C-Rank" }, demonicVision, "genjutsu", false, "C-Rank");
const healingStanceSkill = new BattleSkill("Healing Stance", ["Ninjutsu"], {}, healingStance, "neutral", true, "D-Rank");
const earthDomeJutsuSkill = new BattleSkill("Earth Dome Jutsu", ["Earth", "Ninjutsu"], { Earth: "C-Rank" }, earthDomeJutsu, "earth", true, "C-Rank");
const flameThrowJutsuSkill = new BattleSkill("Flame Throw Jutsu", ["Fire", "Ninjutsu"], { Fire: "C-Rank", Ninjutsu: "C-Rank" }, flameThrowJutsu, "fire", false, "B-Rank");
const staticFieldJutsuSkill = new BattleSkill("Static Field Jutsu", ["Lightning", "Ninjutsu"], { Lightning: "C-Rank" }, staticFieldJutsu, "lightning", false, "C-Rank");
const fireballJutsuSkill = new BattleSkill("Fireball Jutsu", ["Fire", "Ninjutsu"], { Fire: "C-Rank" }, fireballJutsu, "fire", false, "C-Rank");
const dynamicEntrySkill = new BattleSkill("Dynamic Entry", ["Taijutsu"], { Taijutsu: "C-Rank" }, dynamicEntry, "neutral", false, "C-Rank");
const falconDropSkill = new BattleSkill("Falcon Drop", ["Taijutsu"], { Taijutsu: "B-Rank" }, falconDrop, "neutral", false, "B-Rank");
const rockSmashJutsuSkill = new BattleSkill("Rock Smash Jutsu", ["Earth", "Taijutsu"], { Earth: "B-Rank" }, rockSmashJutsu, "earth", false, "B-Rank");
const genjutsuReleaseSkill = new BattleSkill("Genjutsu Release", ["Genjutsu"], { Genjutsu: "B-Rank" }, genjutsuRelease, "genjutsu", true, "B-Rank");
const lightningEdgeSkill = new BattleSkill("Lightning Edge", ["Lightning", "Ninjutsu"], { Lightning: "C-Rank", Ninjutsu: "C-Rank" }, lightningEdge, "lightning", false, "B-Rank");
const biteSkill = new BattleSkill("Bite", ["Beast"], { Beast: "C-Rank" }, bite, "beast", false, "C-Rank");

// Deckbuilding: All jutsu available for selection
game.jutsuList = [
    barrageSkill,
    substitutionJutsuSkill,
    shadowCloneJutsuSkill,
    demonicVisionSkill,
    healingStanceSkill,
    earthDomeJutsuSkill,
    flameThrowJutsuSkill,
    staticFieldJutsuSkill,
    fireballJutsuSkill,
    dynamicEntrySkill,
    falconDropSkill,
    rockSmashJutsuSkill,
    genjutsuReleaseSkill,
    lightningEdgeSkill,
    biteSkill
];
skills.skills = game.jutsuList;

player.activeJutsu = [barrageSkill, substitutionJutsuSkill, healingStanceSkill];

function addJutsuToInventory(jutsu) {
    try {
        if (!player.activeJutsu.includes(jutsu)) {
            player.activeJutsu.push(jutsu);
            logBattle(`<span class="output-text-player">${player.name}</span> learned <span class="output-text-${jutsu.style}">${jutsu.name}</span>!`);
            updateJutsuUI();
            document.querySelector(".jutsu-select").classList.add("hidden");
        } else {
            logBattle(`<span class="output-text-player">${player.name}</span> already knows <span class="output-text-${jutsu.style}">${jutsu.name}</span>!`);
        }
    } catch (e) {
        logBattle(`Error in addJutsuToInventory: ${e.message}`);
    }
}

function openJutsuSelect() {
    try {
        if (inBattle) {
            logBattle("Cannot select Jutsu during battle!");
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
            document.querySelector(".jutsu-select").classList.remove("hidden");
        }
    } catch (e) {
        logBattle(`Error in openJutsuSelect: ${e.message}`);
    }
}

function closeJutsuSelect() {
    try {
        const jutsuSelect = document.querySelector(".jutsu-select");
        if (jutsuSelect) {
            jutsuSelect.classList.add("hidden");
        }
    } catch (e) {
        logBattle(`Error in closeJutsuSelect: ${e.message}`);
    }
}

function generateTrainingEnemy() {
    const enemy = new Character("Thief", 20, 20, [], [barrageSkill], "https://via.placeholder.com/120x160");
    enemy.activeJutsu = [barrageSkill];
    return enemy;
}

function generateEnemy() {
    const enemy = new Character("Thief", 20, 20, [], [barrageSkill], "https://via.placeholder.com/120x160");
    enemy.activeJutsu = [barrageSkill];
    return enemy;
}

function logBattle(message) {
    if (logOutput) {
        logOutput.innerHTML += message + "<br>";
        logOutput.scrollTop = logOutput.scrollHeight;
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function checkForDeath() {
    if (game.player.hp <= 0) {
        logBattle(`<span class="output-text-player">${game.player.name}</span> has been defeated!`);
        inBattle = false;
        return true;
    }
    if (game.enemy && game.enemy.hp <= 0) {
        logBattle(`<span class="output-text-enemy">${game.enemy.name}</span> has been defeated!`);
        inBattle = false;
        return true;
    }
    return false;
}

function updateJutsuUI() {
    try {
        const jutsuList = document.getElementById("jutsu-list");
        if (!jutsuList) {
            logBattle("Error: jutsu-list element not found!");
            return;
        }
        jutsuList.innerHTML = "";
        for (let jutsu of player.activeJutsu) {
            const li = document.createElement("li");
            li.textContent = jutsu.name;
            li.classList.add("jutsu-item");
            jutsuList.appendChild(li);
        }
    } catch (e) {
        logBattle(`Error in updateJutsuUI: ${e.message}`);
    }
}

async function processStatusEffects(user, target) {
    try {
        for (let i = user.statusEffects.length - 1; i >= 0; i--) {
            let effect = user.statusEffects[i];
            if (effect.onTurn) {
                if (await effect.onTurn(user, target)) {
                    continue;
                }
            }
            effect.duration--;
            if (effect.duration <= 0 && !effect.isPermanent) {
                user.statusEffects.splice(i, 1);
            }
        }
    } catch (e) {
        logBattle(`Error in processStatusEffects: ${e.message}`);
        inBattle = false;
    }
}

async function endBattle() {
    try {
        inBattle = false;
        logBattle("Battle has ended!");
        await sleep(3000);
        openJutsuSelect();
    } catch (e) {
        logBattle(`Error in endBattle: ${e.message}`);
    }
}

async function startTrainingFight() {
    try {
        logBattle("startTrainingFight clicked!");
        if (inBattle) {
            logBattle(`Cannot start Training fights during battle! inBattle: ${inBattle}`);
            return;
        }
        game.battleType = "training";
        const enemy = generateTrainingEnemy();
        logBattle(`Generated enemy: ${enemy.name}, Jutsu: ${enemy.activeJutsu.map(j => j.name).join(", ")}`);
        await startBattle(player, enemy);
    } catch (e) {
        logBattle(`Error in startTrainingFight: ${e.message}`);
    }
}

async function startTravelFight(destination) {
    try {
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
    } catch (e) {
        logBattle(`Error in startTravelFight: ${e.message}`);
    }
}

async function startBattle(player, enemy) {
    try {
        logBattle(`startBattle called! inBattle: ${inBattle}, activeJutsu: ${player.activeJutsu.length}`);
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
        game.player = player; // Shinobi
        game.enemy = enemy; // Thief
        turnOrder = [player, enemy];
        logBattle(`<span class="output-text-player">${player.name}</span> vs <span class="output-text-enemy">${enemy.name}</span>!`);
        await updateBattleUI();
        await setTurnOrder();
    } catch (e) {
        logBattle(`Error in startBattle: ${e.message}`);
        inBattle = false;
    }
}

async function setTurnOrder() {
    try {
        logBattle(`setTurnOrder called!`);
        if (Math.random() < 0.5) {
            game.user = game.player;
            game.target = game.enemy;
            logBattle(`<span class="output-text-player">${game.player.name}</span> goes first!`);
            await sleep(3000);
        } else {
            game.user = game.enemy;
            game.target = game.player;
            logBattle(`<span class="output-text-enemy">${game.enemy.name}</span> goes first!`);
            await sleep(3000);
        }
        await takeTurn();
    } catch (e) {
        logBattle(`Error in setTurnOrder: ${e.message}`);
        inBattle = false;
    }
}

async function takeTurn() {
    try {
        if (!inBattle) {
            logBattle("Battle ended or not in progress!");
            return;
        }
        let currentCharacter = game.user;
        let target = game.target;
        logBattle(`<br><span class="turn-text">✧✧ ${currentCharacter.name}'s Turn ✧✧</span>`);
        await sleep(1000);
        await processStatusEffects(currentCharacter, target);
        if (checkForDeath()) return;
        await skillAction();
    } catch (e) {
        logBattle(`Error in takeTurn: ${e.message}`);
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
        await updateBattleUI();
        setTimeout(takeTurn, 1000);
    } catch (e) {
        logBattle(`Error in endTurn: ${e.message}`);
        inBattle = false;
    }
}

async function skillAction() {
    try {
        if (!game.user || !game.target) {
            logBattle("Error: game.user or game.target is undefined!");
            inBattle = false;
            return;
        }
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
                if (await status.activeFunction(game.user, game.target)) {
                    if (checkForDeath()) return;
                    await endTurn();
                    return;
                }
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
        inBattle = false;
    }
}

async function updateBattleUI() {
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

        userName.textContent = game.player.name;
        userHp.textContent = `${game.player.hp}/${game.player.maxHp}`;
        userStatus.textContent = game.player.statusEffects.map(s => statusEmojis[s.name] || s.name).join(" ") || "None";
        userSprite.src = game.player.sprite;
        opponentName.textContent = game.enemy ? game.enemy.name : "None";
        opponentHp.textContent = game.enemy ? `${game.enemy.hp}/${game.enemy.maxHp}` : "0/0";
        opponentStatus.textContent = game.enemy ? game.enemy.statusEffects.map(s => statusEmojis[s.name] || s.name).join(" ") || "None" : "None";
        opponentSprite.src = game.enemy ? game.enemy.sprite : "https://via.placeholder.com/120x160";
        playerRank.textContent = game.player.rank;
        playerXp.textContent = game.player.xp;
    } catch (e) {
        logBattle(`Error in updateBattleUI: ${e.message}`);
        inBattle = false;
    }
                                       }
