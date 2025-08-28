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
            new BattleSkill("Demonic Vision", ["Genjutsu"], { Genjutsu: "C-Rank" }, this.demonicVision.bind(this), "illusion", false, "C-Rank"),
            new BattleSkill("Healing Stance", ["Ninjutsu"], {}, this.healingStance.bind(this), "neutral", true, "D-Rank"),
            new BattleSkill("Earth Dome Jutsu", ["Earth", "Ninjutsu"], { Earth: "C-Rank" }, this.earthDomeJutsu.bind(this), "earth", true, "C-Rank"),
            new BattleSkill("Flame Throw Jutsu", ["Fire", "Ninjutsu"], { Fire: "C-Rank", Ninjutsu: "C-Rank" }, this.flameThrowJutsu.bind(this), "fire", false, "B-Rank"),
            new BattleSkill("Static Field Jutsu", ["Lightning", "Ninjutsu"], { Lightning: "C-Rank" }, this.staticFieldJutsu.bind(this), "lightning", false, "C-Rank"),
            new BattleSkill("Fireball Jutsu", ["Fire", "Ninjutsu"], { Fire: "C-Rank" }, this.fireballJutsu.bind(this), "fire", false, "C-Rank"),
            new BattleSkill("Dynamic Entry", ["Taijutsu"], { Taijutsu: "C-Rank" }, this.dynamicEntry.bind(this), "neutral", false, "C-Rank"),
            new BattleSkill("Falcon Drop", ["Taijutsu"], { Taijutsu: "B-Rank" }, this.falconDrop.bind(this), "neutral", false, "B-Rank"),
            new BattleSkill("Rock Smash Jutsu", ["Earth", "Taijutsu"], { Earth: "B-Rank" }, this.rockSmashJutsu.bind(this), "earth", false, "B-Rank"),
            new BattleSkill("Genjutsu Release", ["Genjutsu"], { Genjutsu: "B-Rank" }, this.genjutsuRelease.bind(this), "illusion", true, "B-Rank"),
            new BattleSkill("Lightning Edge", ["Lightning", "Ninjutsu"], { Lightning: "C-Rank", Ninjutsu: "C-Rank" }, this.lightningEdge.bind(this), "lightning", false, "B-Rank"),
            new BattleSkill("Bite", ["Feral"], { Feral: "C-Rank" }, this.bite.bind(this), "feral", false, "C-Rank")
        ];
    }

    canUseSkill(mob, skill) {
        return Object.keys(skill.requirements).every(key => mob.ninjaStyles[key] && compareRanks(mob.ninjaStyles[key], skill.requirements[key]) >= 0);
    }

    findSkill(name) {
        return this.skills.find(skill => skill.name === name);
    }

    barrage(user, target, scene) {
        let baseDamage = Math.floor(Math.random() * 2) + 1;
        let comboDamage = Math.floor(Math.random() * 2) + 1;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - baseDamage));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> attacks <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> with <span class="output-text-neutral">Barrage</span> for ${baseDamage} damage!`);
        if (target.hp > 0) {
            target.hp = Math.max(0, Math.min(target.maxHp, target.hp - comboDamage));
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> combos ${target.name} for ${comboDamage} damage!`);
        }
        return target.hp <= 0;
    }

    substitutionJutsu(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Swap", 1, 0, false, false, true, null, null, 
            (user, target, scene, skillStyle) => {
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses Substitution to dodge the attack with a log!`);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "Swap");
                return true; // End skill early
            }));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> prepares <span class="output-text-neutral">Substitution Jutsu</span> <span class="status-substitution">🪵</span>!`);
        return true;
    }

    shadowCloneJutsu(user, target, scene) {
        if (user.hp < 2) {
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> does not have enough HP to cast <span class="output-text-neutral">Shadow Clone Jutsu</span>!`);
            return false;
        }
        let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
        if (cloneCount >= 3) {
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> already has the maximum of 3 shadow clones!`);
            return false;
        }
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp - 2));
        user.statusEffects.push(new StatusEffect("ShadowCloneEffect", 3, 0, false, true, true, null, 
            (user, target, scene) => { // Active: clones attack
                let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
                for (let i = 0; i < cloneCount; i++) {
                    scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>Shadow Clone ${i + 1} uses Barrage on ${target.name}!</span>`);
                    let barrageSkill = this.findSkill("Barrage");
                    if (barrageSkill) barrageSkill.skillFunction(user, target, scene);
                }
                user.statusEffects = user.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                deathCheck();
                return false; // Continue turn
            }, 
            (user, target, scene, skillStyle) => { // Triggered: absorb damage
                let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
                if (cloneCount > 0) {
                    scene.queueOutput(`<span class='output-text-${target === game.player ? 'player' : 'enemy'}'>${target.name}</span>'s Shadow Clone absorbs the attack!`);
                    user.statusEffects.splice(user.statusEffects.findIndex(e => e.name === "ShadowCloneEffect"), 1); // Remove one clone
                    return true; // End skill early
                }
                return false;
            }));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-neutral">Shadow Clone Jutsu</span>, adding a clone <span class="status-shadowcloneeffect">👥</span>!`);
        return true;
    }

    demonicVision(user, target, scene) {
        let damage = 1;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Doom", 5, 1, true, false, false, 
            (user, target, scene) => { // Start of turn: apply damage
                target.hp = Math.max(0, target.hp - target.statusEffects.find(e => e.name === "Doom").damage);
                scene.queueOutput(`<span class='output-text-${target === game.player ? 'player' : 'enemy'}'>${target.name}</span> takes ${target.statusEffects.find(e => e.name === "Doom").damage} damage from <span class='status-doom'>Doom 💀</span>!`);
                updateStatus();
                deathCheck();
                return false; // Continue turn
            }));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-genjutsu">Demonic Vision</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-doom">Doom 💀</span>!`);
        return target.hp <= 0;
    }

    healingStance(user, target, scene) {
        let heal = user.hp < user.maxHp ? 1 : 0;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal));
        user.statusEffects.push(new StatusEffect("Regen", 3, 1, true, false, false, 
            (user, target, scene) => { // Start of turn: apply heal
                let heal = user.hp < user.maxHp ? user.statusEffects.find(e => e.name === "Regen").damage : 0;
                user.hp = Math.min(user.maxHp, user.hp + heal);
                if (heal > 0) scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> heals ${heal} HP from <span class='status-regen'>Regen 🌿</span>!`);
                updateStatus();
                return false; // Continue turn
            }));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> enters <span class="output-text-neutral">Healing Stance</span>${heal > 0 ? `, healing ${heal} HP` : ""} <span class="status-regen">🌿</span>!`);
        return true;
    }

    earthDomeJutsu(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Dome", 2, 0, false, false, true, null, null, 
            (user, target, scene, skillStyle) => { // Triggered: mitigate non-Genjutsu
                if (skillStyle !== "illusion") {
                    scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses Earth Dome to mitigate the attack!`);
                    user.statusEffects = user.statusEffects.filter(e => e.name !== "Dome");
                    return false; // Continue skill
                }
                return false; // Allow Genjutsu to proceed
            }));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> raises <span class="output-text-earth">Earth Dome Jutsu</span> <span class="status-dome">🪨</span>!`);
        return true;
    }

    flameThrowJutsu(user, target, scene) {
        let damage = Math.floor(Math.random() * 2) + 4;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burn", 1, 2, true, false, false, 
            (user, target, scene) => { // Start of turn: apply damage
                target.hp = Math.max(0, target.hp - target.statusEffects.find(e => e.name === "Burn").damage);
                scene.queueOutput(`<span class='output-text-${target === game.player ? 'player' : 'enemy'}'>${target.name}</span> takes ${target.statusEffects.find(e => e.name === "Burn").damage} damage from <span class='status-burn'>Burn 🔥</span>!`);
                updateStatus();
                deathCheck();
                return false; // Continue turn
            }));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Flame Throw Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burn">Burn 🔥</span>!`);
        return target.hp <= 0;
    }

    staticFieldJutsu(user, target, scene) {
        let damage = Math.floor(Math.random() * 2) + 2;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        user.statusEffects.push(new StatusEffect("Numb", 1, 0, false, false, false, 
            (user, target, scene) => { // Start of turn: stun user
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> is stunned by Numb and skips their turn!`);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb");
                return true; // End turn early
            }));
        target.statusEffects.push(new StatusEffect("Numb", 1, 0, false, false, false, 
            (user, target, scene) => { // Start of turn: stun target
                scene.queueOutput(`<span class='output-text-${target === game.player ? 'player' : 'enemy'}'>${target.name}</span> is stunned by Numb and skips their turn!`);
                target.statusEffects = target.statusEffects.filter(e => e.name !== "Numb");
                return true; // End turn early
            }));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-lightning">Static Field Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-numb">Numb ⚡️</span> on both!`);
        return target.hp <= 0;
    }

    fireballJutsu(user, target, scene) {
        let damage = Math.floor(Math.random() * 2) + 3;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burn", 1, 1, true, false, false, 
            (user, target, scene) => { // Start of turn: apply damage
                target.hp = Math.max(0, target.hp - target.statusEffects.find(e => e.name === "Burn").damage);
                scene.queueOutput(`<span class='output-text-${target === game.player ? 'player' : 'enemy'}'>${target.name}</span> takes ${target.statusEffects.find(e => e.name === "Burn").damage} damage from <span class='status-burn'>Burn 🔥</span>!`);
                updateStatus();
                deathCheck();
                return false; // Continue turn
            }));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Fireball Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burn">Burn 🔥</span>!`);
        return target.hp <= 0;
    }

    dynamicEntry(user, target, scene) {
        let damage = 1;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        let usableSkills = user.skills.filter(skill => !skill.support && skill !== this.findSkill("Dynamic Entry"));
        let nextSkill = usableSkills.length > 0 ? usableSkills[Math.floor(Math.random() * usableSkills.length)] : null;
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-neutral">Dynamic Entry</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage!`);
        if (nextSkill && !user.statusEffects.some(e => e.name === "DynamicEntryProc")) {
            user.statusEffects.push(new StatusEffect("DynamicEntryProc", 1, 0, false, true, false, null, 
                (user, target, scene) => { // Active: trigger next skill
                    nextSkill.skillFunction(user, target, scene);
                    user.statusEffects = user.statusEffects.filter(e => e.name !== "DynamicEntryProc");
                    return false; // Continue turn
                }));
        }
        return target.hp <= 0;
    }

    falconDrop(user, target, scene) {
        let damage = 2;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp - 2));
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Numb", 1, 0, false, false, false, 
            (user, target, scene) => { // Start of turn: stun target
                scene.queueOutput(`<span class='output-text-${target === game.player ? 'player' : 'enemy'}'>${target.name}</span> is stunned by Numb and skips their turn!`);
                target.statusEffects = target.statusEffects.filter(e => e.name !== "Numb");
                return true; // End turn early
            }));
        user.statusEffects.push(new StatusEffect("READY", 1, 0, false, true, false, null, 
            (user, target, scene) => { // Active: trigger Barrage
                let barrageSkill = this.findSkill("Barrage");
                if (barrageSkill) barrageSkill.skillFunction(user, target, scene);
                user.statusEffects = user.statusEffects.filter(e => e.name !== "READY");
                deathCheck();
                return false; // Continue turn
            }));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-neutral">Falcon Drop</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, stunning target and taking 2 damage!`);
        return target.hp <= 0;
    }

    rockSmashJutsu(user, target, scene) {
        let damage = 6;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-earth">Rock Smash Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage!`);
        return target.hp <= 0;
    }

    genjutsuRelease(user, target, scene) {
        user.statusEffects = user.statusEffects.filter(e => e.name !== "Doom");
        user.statusEffects.push(new StatusEffect("Release", 1, 0, false, false, true, null, null, 
            (user, target, scene, skillStyle) => { // Triggered: resist Genjutsu
                if (skillStyle === "illusion") {
                    scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses Release to resist the Genjutsu attack!`);
                    user.statusEffects = user.statusEffects.filter(e => e.name !== "Release");
                    return false; // Continue skill (resist only Genjutsu)
                }
                return false; // Allow other styles to proceed
            }));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-genjutsu">Genjutsu Release</span>, dispelling Doom and gaining <span class="status-substitution">Release 🌀</span>!`);
        return true;
    }


lightningEdge(user, target, scene) {
    let damage = Math.floor(Math.random() * 2) + 4;
    target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
    target.statusEffects = target.statusEffects.filter(effect => !effect.triggered); // Clear only triggered effects
    scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> strikes with <span class="output-text-lightning">Lightning Edge</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, breaking all defenses!`);
    return target.hp <= 0;
}


    bite(user, target, scene) {
        let damage = 1;
        let heal = user.hp < user.maxHp ? 1 : 0;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal));
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Bleed", 2, 1, true, false, false, 
            (user, target, scene) => { // Start of turn: apply damage
                target.hp = Math.max(0, target.hp - target.statusEffects.find(e => e.name === "Bleed").damage);
                scene.queueOutput(`<span class='output-text-${target === game.player ? 'player' : 'enemy'}'>${target.name}</span> takes ${target.statusEffects.find(e => e.name === "Bleed").damage} damage from <span class='status-bleed'>Bleed 🩸</span>!`);
                updateStatus();
                deathCheck();
                return false; // Continue turn
            }));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-feral">Bite</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage${heal > 0 ? `, healing ${heal} HP` : ""}, inflicting <span class="status-bleed">Bleed 🩸</span>!`);
        return target.hp <= 0;
    }
}

function compareRanks(rank1, rank2) {
    const ranks = ["D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"];
    return ranks.indexOf(rank1) - ranks.indexOf(rank2);
}
