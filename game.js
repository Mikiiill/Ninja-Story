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
        this.sprite = sprite;
        this.xp = 0;
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
            new BattleSkill("Bite", ["Feral"], { Feral: "C-Rank" }, this.bite.bind(this), "feral", false, "C-Rank")
        ];
    }

    canUseSkill(mob, skill) {
        return Object.keys(skill.requirements).every(key => mob.fightingStyles[key] && compareRanks(mob.fightingStyles[key], skill.requirements[key]) >= 0);
    }

    findSkill(name) {
        return this.skills.find(skill => skill.name === name);
    }

    barrage(user, target) {
        let baseDamage = Math.floor(Math.random() * 2) + 1;
        let comboDamage = Math.floor(Math.random() * 2) + 1;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - baseDamage));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> attacks <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> with <span class="output-text-neutral">Barrage</span> for ${baseDamage} damage!`);
        if (target.hp > 0) {
            target.hp = Math.max(0, Math.min(target.maxHp, target.hp - comboDamage));
            logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> combos ${target.name} for ${comboDamage} damage!`);
        }
        return target.hp <= 0;
    }

    substitutionJutsu(user, target) {
        user.statusEffects.push(new StatusEffect("Swap", 1, 0, false, false, true, null, null, 
            (user, target, skillStyle) => {
                logBattle(`<span class='output-text-${user === player ? 'player' : 'enemy'}'>${user.name}</span> uses Substitution to dodge the attack with a log!`);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "Swap");
                return true;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> prepares <span class="output-text-neutral">Substitution Jutsu</span> <span class="status-substitution">🪵</span>!`);
        return true;
    }

    shadowCloneJutsu(user, target) {
        if (user.hp < 2) {
            logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> does not have enough HP to cast <span class="output-text-neutral">Shadow Clone Jutsu</span>!`);
            return false;
        }
        let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
        if (cloneCount >= 3) {
            logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> already has the maximum of 3 shadow clones!`);
            return false;
        }
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp - 2));
        user.statusEffects.push(new StatusEffect("ShadowCloneEffect", 3, 0, false, true, true, null, 
            (user, target) => {
                let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
                for (let i = 0; i < cloneCount; i++) {
                    logBattle(`<span class='output-text-${user === player ? 'player' : 'enemy'}'>Shadow Clone ${i + 1} uses Barrage on ${target.name}!</span>`);
                    this.barrage(user, target);
                }
                user.statusEffects = user.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                return false;
            }, 
            (user, target, skillStyle) => {
                let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
                if (cloneCount > 0) {
                    logBattle(`<span class='output-text-${target === player ? 'player' : 'enemy'}'>${target.name}</span>'s Shadow Clone absorbs the attack!`);
                    user.statusEffects.splice(user.statusEffects.findIndex(e => e.name === "ShadowCloneEffect"), 1);
                    return true;
                }
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-neutral">Shadow Clone Jutsu</span>, adding a clone <span class="status-shadowcloneeffect">👥</span>!`);
        return true;
    }

    demonicVision(user, target) {
        let damage = 1;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Doom", 5, 1, true, false, false, 
            (user, target) => {
                target.hp = Math.max(0, target.hp - target.statusEffects.find(e => e.name === "Doom").damage);
                logBattle(`<span class='output-text-${target === player ? 'player' : 'enemy'}'>${target.name}</span> takes ${target.statusEffects.find(e => e.name === "Doom").damage} damage from <span class='status-doom'>Doom 💀</span>!`);
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-genjutsu">Demonic Vision</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-doom">Doom 💀</span>!`);
        return target.hp <= 0;
    }

    healingStance(user, target) {
        let heal = user.hp < user.maxHp ? 1 : 0;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal));
        user.statusEffects.push(new StatusEffect("Regen", 3, 1, true, false, false, 
            (user, target) => {
                let heal = user.hp < user.maxHp ? user.statusEffects.find(e => e.name === "Regen").damage : 0;
                user.hp = Math.min(user.maxHp, user.hp + heal);
                if (heal > 0) logBattle(`<span class='output-text-${user === player ? 'player' : 'enemy'}'>${user.name}</span> heals ${heal} HP from <span class='status-regen'>Regen 🌿</span>!`);
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> enters <span class="output-text-neutral">Healing Stance</span>${heal > 0 ? `, healing ${heal} HP` : ""} <span class="status-regen">🌿</span>!`);
        return true;
    }

    earthDomeJutsu(user, target) {
        user.statusEffects.push(new StatusEffect("Dome", 2, 0, false, false, true, null, null, 
            (user, target, skillStyle) => {
                if (skillStyle !== "genjutsu") {
                    logBattle(`<span class='output-text-${user === player ? 'player' : 'enemy'}'>${user.name}</span> uses Earth Dome to mitigate the attack!`);
                    user.statusEffects = user.statusEffects.filter(e => e.name !== "Dome");
                    return true;
                }
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> raises <span class="output-text-earth">Earth Dome Jutsu</span> <span class="status-dome">🪨</span>!`);
        return true;
    }

    flameThrowJutsu(user, target) {
        let damage = Math.floor(Math.random() * 2) + 4;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burn", 1, 2, true, false, false, 
            (user, target) => {
                target.hp = Math.max(0, target.hp - target.statusEffects.find(e => e.name === "Burn").damage);
                logBattle(`<span class='output-text-${target === player ? 'player' : 'enemy'}'>${target.name}</span> takes ${target.statusEffects.find(e => e.name === "Burn").damage} damage from <span class='status-burn'>Burn 🔥</span>!`);
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Flame Throw Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burn">Burn 🔥</span>!`);
        return target.hp <= 0;
    }

    staticFieldJutsu(user, target) {
        let damage = Math.floor(Math.random() * 2) + 2;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        user.statusEffects.push(new StatusEffect("Numb", 1, 0, true, false, false, 
            (user, target) => {
                logBattle(`<span class='output-text-${user === player ? 'player' : 'enemy'}'>${user.name}</span> is stunned by Numb and skips their turn!`);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb");
                return true;
            }));
        target.statusEffects.push(new StatusEffect("Numb", 1, 0, true, false, false, 
            (user, target) => {
                logBattle(`<span class='output-text-${target === player ? 'player' : 'enemy'}'>${target.name}</span> is stunned by Numb and skips their turn!`);
                target.statusEffects = target.statusEffects.filter(e => e.name !== "Numb");
                return true;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-lightning">Static Field Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-numb">Numb ⚡️</span> on both!`);
        return target.hp <= 0;
    }

    fireballJutsu(user, target) {
        let damage = Math.floor(Math.random() * 2) + 3;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burn", 1, 1, true, false, false, 
            (user, target) => {
                target.hp = Math.max(0, target.hp - target.statusEffects.find(e => e.name === "Burn").damage);
                logBattle(`<span class='output-text-${target === player ? 'player' : 'enemy'}'>${target.name}</span> takes ${target.statusEffects.find(e => e.name === "Burn").damage} damage from <span class='status-burn'>Burn 🔥</span>!`);
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Fireball Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burn">Burn 🔥</span>!`);
        return target.hp <= 0;
    }

    dynamicEntry(user, target) {
        let damage = 1;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-neutral">Dynamic Entry</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage!`);
        if (!user.statusEffects.some(e => e.name === "DynamicEntryProc")) {
            user.statusEffects.push(new StatusEffect("DynamicEntryProc", 1, 0, false, false, false, null, null, null));
            let usableSkills = user.activeJutsu.filter(skill => !skill.support && skill.name !== "Dynamic Entry");
            let nextSkill = usableSkills.length > 0 ? usableSkills[Math.floor(Math.random() * usableSkills.length)] : null;
            if (nextSkill) {
                logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> chains with ${nextSkill.name}!`);
                nextSkill.skillFunction(user, target);
            }
            user.statusEffects = user.statusEffects.filter(e => e.name !== "DynamicEntryProc");
        }
        return target.hp <= 0;
    }

    falconDrop(user, target) {
        let damage = 2;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp - 2));
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Numb", 1, 0, true, false, false, 
            (user, target) => {
                logBattle(`<span class='output-text-${target === player ? 'player' : 'enemy'}'>${target.name}</span> is stunned by Numb and skips their turn!`);
                target.statusEffects = target.statusEffects.filter(e => e.name !== "Numb");
                return true;
            }));
        user.statusEffects.push(new StatusEffect("READY", 1, 0, false, true, false, null, 
            (user, target) => {
                let barrageSkill = this.findSkill("Barrage");
                if (barrageSkill) barrageSkill.skillFunction(user, target);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "READY");
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-neutral">Falcon Drop</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, stunning target and taking 2 damage!`);
        return target.hp <= 0;
    }

    rockSmashJutsu(user, target) {
        let damage = 6;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-earth">Rock Smash Jutsu</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage!`);
        return target.hp <= 0;
    }

    genjutsuRelease(user, target) {
        user.statusEffects = user.statusEffects.filter(e => e.name !== "Doom");
        user.statusEffects.push(new StatusEffect("Release", 1, 0, false, false, true, null, null, 
            (user, target, skillStyle) => {
                if (skillStyle === "genjutsu") {
                    logBattle(`<span class='output-text-${user === player ? 'player' : 'enemy'}'>${user.name}</span> uses Release to resist the Genjutsu attack!`);
                    user.statusEffects = user.statusEffects.filter(e => e.name === "Release");
                    return true;
                }
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-genjutsu">Genjutsu Release</span>, dispelling Doom and gaining <span class="status-substitution">Release 🌀</span>!`);
        return true;
    }

    lightningEdge(user, target) {
        let damage = Math.floor(Math.random() * 2) + 4;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects = target.statusEffects.filter(effect => !effect.triggered);
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> strikes with <span class="output-text-lightning">Lightning Edge</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, breaking all triggered status effects!`);
        return target.hp <= 0;
    }

    bite(user, target) {
        let damage = 1;
        let heal = user.hp < user.maxHp ? 1 : 0;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal));
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Bleed", 2, 1, true, false, false, 
            (user, target) => {
                target.hp = Math.max(0, target.hp - target.statusEffects.find(e => e.name === "Bleed").damage);
                logBattle(`<span class='output-text-${target === player ? 'player' : 'enemy'}'>${target.name}</span> takes ${target.statusEffects.find(e => e.name === "Bleed").damage} damage from <span class='status-bleed'>Bleed 🩸</span>!`);
                return false;
            }));
        logBattle(`<span class="output-text-${user === player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-feral">Bite</span> on <span class="output-text-${target === player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage${heal > 0 ? `, healing ${heal} HP` : ""}, inflicting <span class="status-bleed">Bleed 🩸</span>!`);
        return target.hp <= 0;
    }
}

function compareRanks(rank1, rank2) {
    const ranks = ["D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"];
    return ranks.indexOf(rank1) - ranks.indexOf(rank2);
}

// Utility Functions
function logBattle(message) {
    const log = document.getElementById("battle-log-content");
    if (log) {
        log.innerHTML += `<p>${message}</p>`;
        setTimeout(() => {
            log.scrollTop = log.scrollHeight; // Ensure auto-scroll on mobile
        }, 100);
    }
}

// Jutsu Menu Toggle
let inBattle = false;

function toggleJutsuMenu() {
    if (inBattle) {
        logBattle("Cannot toggle Jutsu menu during battle!");
        return;
    }
    const content = document.getElementById("jutsu-management-content");
    if (content) {
        content.classList.toggle("hidden");
    }
}

// Jutsu Selection
const skills = new Skills();

function openJutsuSelect() {
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
}

function closeJutsuSelect() {
    const jutsuSelect = document.querySelector(".jutsu-select");
    if (jutsuSelect) {
        jutsuSelect.classList.add("hidden");
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

        document.getElementById("select-jutsu-btn").disabled = inBattle;
        document.getElementById("start-battle-btn").disabled = inBattle;
        document.getElementById("toggle-jutsu-btn").disabled = inBattle;
    }
}

function moveJutsuToInventory(index) {
    if (inBattle) {
        logBattle("Cannot move Jutsu during battle!");
        return;
    }
    if (player.activeJutsu.length > 0 && index >= 0 && index < player.activeJutsu.length) {
        player.inventory.push(player.activeJutsu.splice(index, 1)[0]);
        updateJutsuDisplay();
    }
}

function moveJutsuToActive(index) {
    if (inBattle) {
        logBattle("Cannot move Jutsu during battle!");
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

// Battle System
let user, target;

function awardReward(winner, loser) {
    const eligibleJutsu = skills.skills.filter(jutsu => skills.canUseSkill(winner, jutsu));
    const rewardJutsu = eligibleJutsu[Math.floor(Math.random() * eligibleJutsu.length)];
    const totalCopies = winner.activeJutsu.concat(winner.inventory).filter(j => j.name === rewardJutsu.name).length;
    if (totalCopies < 4) {
        winner.inventory.push(rewardJutsu);
        logBattle(`${winner.name} defeated ${loser.name}! Received ${rewardJutsu.name} as reward!`);
    } else {
        logBattle(`${winner.name} defeated ${loser.name}! No Jutsu added (max copies reached).`);
    }
    winner.xp += 50;
    logBattle(`${winner.name} gained 50 XP!`);
    inBattle = false;
    updateJutsuDisplay();
}

function checkForDeath() {
    if (player.hp <= 0 || opponent.hp <= 0) {
        const winner = player.hp <= 0 ? opponent : player;
        const loser = player.hp <= 0 ? player : opponent;
        logBattle(`${loser.name} is defeated! ${winner.name} wins!`);
        awardReward(winner, loser);
        return true;
    }
    return false;
}

function startBattle() {
    if (inBattle) {
        logBattle("Battle already in progress!");
        return;
    }
    if (player.activeJutsu.length === 0) {
        logBattle("Cannot start battle: No active Jutsu equipped!");
        return;
    }
    inBattle = true;
    user = player;
    target = opponent;
    logBattle(`${user.name} vs ${target.name}!`);
    updateJutsuDisplay();
    setTurnOrder();
}

function setTurnOrder() {
    if (Math.random() < 0.5) {
        user = player;
        target = opponent;
        logBattle(`${player.name} goes first!`);
    } else {
        user = opponent;
        target = player;
        logBattle(`${opponent.name} goes first!`);
    }
    takeTurn();
}

function takeTurn() {
    if (!inBattle) return;
    updateBattleUI();

    let skipTurn = false;
    user.statusEffects.forEach(status => {
        if (status.startOfTurn && status.startOfTurnFunction) {
            if (status.startOfTurnFunction(user, target)) {
                skipTurn = true;
            }
        }
        status.duration--;
    });
    user.statusEffects = user.statusEffects.filter(status => status.duration > 0);

    if (skipTurn) {
        endTurn();
        return;
    }

    let attackBlocked = false;
    if (target.statusEffects.some(status => status.triggered && status.triggeredFunction)) {
        target.statusEffects.forEach(status => {
            if (status.triggered && status.triggeredFunction) {
                attackBlocked = status.triggeredFunction(user, target, user.activeJutsu.length > 0 ? user.activeJutsu[0].style : "neutral") || attackBlocked;
            }
        });
    }
    if (user.statusEffects.some(status => status.active && status.activeFunction)) {
        user.statusEffects.forEach(status => {
            if (status.active && status.activeFunction) {
                status.activeFunction(user, target);
            }
        });
    }

    if (!attackBlocked && user.activeJutsu.length > 0) {
        const jutsu = user.activeJutsu[Math.floor(Math.random() * user.activeJutsu.length)];
        if (jutsu.support) {
            jutsu.skillFunction(user, target);
        } else {
            jutsu.skillFunction(user, target);
        }
    } else if (!attackBlocked) {
        logBattle(`${user.name} has no Active Jutsu!`);
    }

    if (checkForDeath()) {
        return;
    }

    endTurn();
}

function endTurn() {
    if (!inBattle) return;
    [user, target] = [target, user];
    setTimeout(takeTurn, 1000);
}

function updateBattleUI() {
    const userName = document.getElementById("user-name");
    const userHp = document.getElementById("user-hp");
    const userStatus = document.getElementById("user-status");
    const opponentName = document.getElementById("opponent-name");
    const opponentHp = document.getElementById("opponent-hp");
    const opponentStatus = document.getElementById("opponent-status");

    if (userName && userHp && userStatus && opponentName && opponentHp && opponentStatus) {
        userName.textContent = player.name;
        userHp.textContent = `${player.hp}/${player.maxHp}`;
        userStatus.textContent = player.statusEffects.map(s => statusEmojis[s.name] || s.name).join(" ") || "None";
        opponentName.textContent = opponent.name;
        opponentHp.textContent = `${opponent.hp}/${opponent.maxHp}`;
        opponentStatus.textContent = opponent.statusEffects.map(s => statusEmojis[s.name] || s.name).join(" ") || "None";
    }
}

// Assign Random Jutsu
function assignRandomJutsu(mob, count) {
    const eligibleJutsu = skills.skills.filter(jutsu => skills.canUseSkill(mob, jutsu));
    const shuffled = eligibleJutsu.sort(() => 0.5 - Math.random()).slice(0, count);
    mob.activeJutsu = shuffled;
}

// Initialize Characters
const player = new Mob(
    "Naruto",
    100,
    100,
    "Student",
    { Ninjutsu: "D-Rank", Taijutsu: "D-Rank", Genjutsu: "D-Rank" },
    [],
    [],
    [],
    "https://via.placeholder.com/120x160"
);

const opponent = new Mob(
    "Sasuke",
    100,
    100,
    "Student",
    { Ninjutsu: "D-Rank", Taijutsu: "D-Rank", Genjutsu: "D-Rank" },
    [],
    [],
    [],
    "https://via.placeholder.com/120x160"
);

// Initialize Game
assignRandomJutsu(player, 4);
assignRandomJutsu(opponent, 4);
updateJutsuDisplay();
updateBattleUI();
