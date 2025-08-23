// Debug: Log when script loads
console.log("script.js loaded");

// Global input lock
let isInputLocked = false;

// Lock input for 1 second
function lockInput() {
    isInputLocked = true;
    setTimeout(() => {
        isInputLocked = false;
        console.log("Input unlocked");
    }, 1000);
}

// Game state
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
    gameState: "start"
};

// Status effect class
class StatusEffect {
    constructor(name, turns, damage, heal, isDamage) {
        this.name = name;
        this.turns = turns;
        this.damage = damage;
        this.heal = heal;
        this.isDamage = isDamage;
    }
}

// Battle skill class
class BattleSkill {
    constructor(name, attributes, requirements, skillFunction, style) {
        this.name = name;
        this.attributes = attributes;
        this.requirements = requirements;
        this.skillFunction = skillFunction;
        this.style = style;
    }
}

// Mob class
class Mob {
    constructor(name, hp, maxHp, ninjaStyles, skills, statusEffects, shadowCloneMultiplier) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.ninjaStyles = ninjaStyles;
        this.skills = skills;
        this.statusEffects = statusEffects;
        this.shadowCloneMultiplier = shadowCloneMultiplier;
    }

    regenerate() {
        this.hp = this.maxHp;
        this.statusEffects = [];
        this.shadowCloneMultiplier = 1;
    }
}

// Skills class
class Skills {
    constructor() {
        this.skills = [];
        this.initializeSkills();
    }

    barrage(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Barrage"))) {
            return `${caster.name} attempts Barrage, but ${target.name} dodges!`;
        }
        let damage1 = 1;
        let damage2 = Math.floor(Math.random() * 2) + 1;
        target.hp = Math.max(0, target.hp - (damage1 + damage2));
        return `${caster.name} uses Barrage, hitting ${target.name} for ${damage1} + ${damage2} (${damage1 + damage2} total) damage!`;
    }

    demonMindJutsu(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Demon Mind Jutsu"))) {
            return `${caster.name} attempts Demon Mind Jutsu, but ${target.name} dodges!`;
        }
        let damage = 1;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Trauma", 3, 1, 0, true);
        return `${caster.name} uses Demon Mind Jutsu, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Trauma 😵!`;
    }

    fireballJutsu(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Fireball Jutsu"))) {
            return `${caster.name} attempts Fireball Jutsu, but ${target.name} dodges!`;
        }
        let damage = 2;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Burned", 3, 1, 0, true);
        return `${caster.name} uses Fireball Jutsu, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Burned 🔥!`;
    }

    flameThrowJutsu(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Flame Throw Jutsu"))) {
            return `${caster.name} attempts Flame Throw Jutsu, but ${target.name} dodges!`;
        }
        let damage = 2;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Burned", 3, 2, 0, true);
        return `${caster.name} uses Flame Throw Jutsu, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Burned 🔥!`;
    }

    healingStance(caster, target) {
        if (target !== caster) return "";
        let gain = 1;
        caster.hp = Math.min(caster.maxHp, caster.hp + gain);
        let applied = this.addStatusEffect(caster, "Healing", 3, 0, 1, false);
        return `${caster.name} uses Healing Stance, recovering ${gain} Health (HP: ${caster.hp}/${caster.maxHp}) 🌿!`;
    }

    raikiri(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Raikiri"))) {
            return `${caster.name} attempts Raikiri, but ${target.name} dodges!`;
        }
        let damage = Math.floor(Math.random() * 2) + 2;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Stunned", 1, 0, 0, false);
        return `${caster.name} uses Raikiri, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Stunned ⚡️!`;
    }

    shadowCloneJutsu(caster, target) {
        if (target !== caster) return "";
        if (caster.shadowCloneMultiplier < 8) {
            caster.shadowCloneMultiplier *= 2;
        }
        let applied = this.addStatusEffect(caster, "ShadowCloneEffect", 1, 0, 0, true);
        return `${caster.name} uses Shadow Clone Jutsu, multiplying next skill by ${caster.shadowCloneMultiplier}x 👥!`;
    }

    bite(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Bite"))) {
            return `${caster.name} attempts Bite, but ${target.name} dodges!`;
        }
        let damage = Math.floor(Math.random() * 2) + 1;
        target.hp = Math.max(0, target.hp - damage);
        return `${caster.name} uses Bite, dealing ${damage} damage to ${target.name}!`;
    }

    kawarami(caster, target) {
        if (target !== caster) return "";
        let applied = this.addStatusEffect(caster, "Kawarami", 2, 0, 0, false);
        return `${caster.name} uses Kawarami, ${applied ? "preparing" : "failing to prepare"} substitution 🪵!`;
    }

    rockBarrierJutsu(caster, target) {
        if (target !== caster) return "";
        let applied = this.addStatusEffect(caster, "Rock Barrier", 1, 0, 0, false);
        return `${caster.name} uses Rock Barrier Jutsu, ${applied ? "summoning" : "failing to summon"} a barrier 🪨!`;
    }

    impendingDoom(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Impending Doom"))) {
            return `${caster.name} attempts Impending Doom, but ${target.name} dodges!`;
        }
        let appliedStun = this.addStatusEffect(target, "Stunned", 1, 0, 0, false);
        target.statusEffects.push(new StatusEffect("Trauma", 3, 1, 0, true));
        target.statusEffects.push(new StatusEffect("Trauma", 3, 1, 0, true));
        return `${caster.name} uses Impending Doom, ${appliedStun ? "applying" : "failing to apply"} Stunned ⚡️ and applying 2 Trauma 😵 effects!`;
    }

    boulderCrush(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Boulder Crush"))) {
            return `${caster.name} attempts Boulder Crush, but ${target.name} dodges!`;
        }
        let damage = 4;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Stunned", 1, 0, 0, false);
        return `${caster.name} uses Boulder Crush, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Stunned ⚡️!`;
    }

    checkDefense(target, skill) {
        if (!skill) return false;
        let kawarami = target.statusEffects.find(e => e.name === "Kawarami");
        if (kawarami && kawarami.turns > 0) {
            kawarami.turns -= 1;
            if (kawarami.turns <= 0) {
                target.statusEffects = target.statusEffects.filter(e => e !== kawarami);
            }
            return true;
        }
        if (target.shadowCloneMultiplier > 1) {
            target.shadowCloneMultiplier = 1;
            target.statusEffects = target.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
            return true;
        }
        let rockBarrier = target.statusEffects.find(e => e.name === "Rock Barrier");
        if (rockBarrier && rockBarrier.turns > 0 && !skill.attributes.includes("Illusion")) {
            rockBarrier.turns -= 1;
            if (rockBarrier.turns <= 0) {
                target.statusEffects = target.statusEffects.filter(e => e !== rockBarrier);
            }
            return true;
        }
        return false;
    }

    findSkill(name) {
        return this.skills.find(s => s.name === name) || null;
    }

    canUseSkill(player, skill) {
        if (!skill || !Object.keys(skill.requirements).length) return true;
        for (let style in skill.requirements) {
            let playerRank = player.ninjaStyles[style] || "D-Rank";
            let requiredRank = skill.requirements[style];
            if (requiredRank === "D-Rank") return true;
            if (requiredRank === "C-Rank" && ["C-Rank", "B-Rank", "A-Rank", "S-Rank"].includes(playerRank)) return true;
            if (requiredRank === "B-Rank" && ["B-Rank", "A-Rank", "S-Rank"].includes(playerRank)) return true;
            if (requiredRank === "A-Rank" && ["A-Rank", "S-Rank"].includes(playerRank)) return true;
            if (requiredRank === "S-Rank" && playerRank === "S-Rank") return true;
        }
        return false;
    }

    addStatusEffect(target, name, turns, damage, heal, isDamage) {
        if (!target.statusEffects.some(e => e.name === name)) {
            target.statusEffects.push(new StatusEffect(name, turns, damage, heal, isDamage));
            return true;
        }
        return false;
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
}

// Battle scene
class BattleScene {
    constructor() {
        this.skills = new Skills();
        this.asciiMap = {
            Trauma: "😵",
            Burned: "🔥",
            Healing: "🌿",
            Stunned: "⚡️",
            ShadowCloneEffect: "👥",
            Kawarami: "🪵",
            "Rock Barrier": "🪨"
        };
        this.chosenStyles = [];
        this.chosenSkills = [];
    }

    updateOutput(text) {
        game.output.push(text);
        document.getElementById("output").innerText = game.output.join("\n");
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    }

    updateStatus() {
        let playerEffects = game.player.statusEffects.map(e => `<span class="status-${e.name.toLowerCase().replace(" ", "")}">${this.asciiMap[e.name] || ""}</span>`).join("");
        let enemyEffects = game.enemy ? game.enemy.statusEffects.map(e => `<span class="status-${e.name.toLowerCase().replace(" ", "")}">${this.asciiMap[e.name] || ""}</span>`).join("") : "";
        document.getElementById("player-status").innerHTML = `Shinobi [HP: <span class="player-hp">${game.player.hp}/${game.player.maxHp}</span>] ${playerEffects}`;
        document.getElementById("enemy-status").innerHTML = game.enemy ? `${game.enemy.name} [HP: <span class="enemy-hp">${game.enemy.hp}/${game.enemy.maxHp}</span>] ${enemyEffects}` : "Enemy [HP: <span class='enemy-hp'>0/0</span>]";
        document.getElementById("skill-count").innerText = `Skill cards: ${game.player.skills.length}`;
    }

    chooseNinjaStyles() {
        if (isInputLocked) return;
        game.gameState = "chooseStyles";
        let styles = ["Fire", "Lightning", "Illusion", "Earth", "Feral"].filter(s => !this.chosenStyles.includes(s));
        this.updateOutput("Choose two Ninja Styles to rank up to C-Rank:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        styles.forEach((style) => {
            let button = document.createElement("button");
            button.innerText = style;
            button.className = style.toLowerCase();
            button.onclick = () => {
                if (isInputLocked) return;
                if (window.confirm(`Train ${style} to C-Rank?`)) {
                    console.log(`Style ${style} confirmed`);
                    lockInput();
                    this.selectStyle(style);
                } else {
                    console.log(`Style ${style} cancelled`);
                }
            };
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    selectStyle(style) {
        if (this.chosenStyles.length < 2) {
            this.chosenStyles.push(style);
            game.player.ninjaStyles[style] = "C-Rank";
            this.updateOutput(`Shinobi trains Ninja Style ${style} to C-Rank!`);
            if (this.chosenStyles.length === 2) {
                setTimeout(() => this.chooseStartingSkills(), 1000);
            } else {
                setTimeout(() => this.chooseNinjaStyles(), 1000);
            }
        }
    }

    chooseStartingSkills() {
        if (isInputLocked) return;
        game.gameState = "chooseSkills";
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s) && !this.chosenSkills.includes(s));
        this.updateOutput("\nChoose three starting skill cards:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        availableSkills.forEach((skill) => {
            let button = document.createElement("button");
            button.innerText = skill.name;
            button.className = skill.style;
            button.onclick = () => {
                if (isInputLocked) return;
                if (window.confirm(`Choose ${skill.name} as a starting skill?`)) {
                    console.log(`Skill ${skill.name} confirmed`);
                    lockInput();
                    this.selectSkill(skill);
                } else {
                    console.log(`Skill ${skill.name} cancelled`);
                }
            };
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    selectSkill(skill) {
        if (this.chosenSkills.length < 3) {
            this.chosenSkills.push(skill);
            game.player.skills.push(skill);
            this.updateOutput(`Selected skill card: ${skill.name}`);
            if (this.chosenSkills.length === 3) {
                this.updateOutput(`Skill cards: ${game.player.skills.length}`);
                setTimeout(() => this.startBattle(), 1000);
            } else {
                setTimeout(() => this.chooseStartingSkills(), 1000);
            }
        }
    }

    generateEnemy() {
        let enemyName = this.battleNum <= 2 ? `Wild Dog ${this.battleNum}` : this.battleNum === 3 ? "Dummy" : "Genin";
        let hp = this.battleNum <= 3 ? 5 : 8 + this.battleNum;
        let enemy = new Mob(
            enemyName,
            hp,
            hp,
            { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" },
            [],
            [],
            1
        );
        let biteSkill = this.skills.findSkill("Bite");
        if (this.battleNum <= 2 && biteSkill) {
            enemy.skills = [biteSkill];
        } else {
            let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(enemy, s));
            enemy.skills = availableSkills.sort(() => Math.random() - 0.5).slice(0, Math.min(3, availableSkills.length));
        }
        if (this.battleNum > 3) {
            let style = Object.keys(enemy.ninjaStyles)[Math.floor(Math.random() * 5)];
            enemy.ninjaStyles[style] = "C-Rank";
            enemy.skills = this.skills.skills.filter(s => this.skills.canUseSkill(enemy, s)).sort(() => Math.random() - 0.5).slice(0, Math.min(3, availableSkills.length));
        }
        return enemy;
    }

    applyStatusEffects(mob) {
        let messages = [];
        let toRemove = [];
        mob.statusEffects.forEach(effect => {
            if (effect.isDamage) {
                mob.hp = Math.max(0, mob.hp - effect.damage);
                messages.push(`${mob.name} takes ${effect.damage} ${effect.name} ${this.asciiMap[effect.name]} damage! (HP: ${mob.hp}/${mob.maxHp})`);
            } else {
                mob.hp = Math.min(mob.maxHp, mob.hp + effect.heal);
                messages.push(`${mob.name} recovers ${effect.heal} Health ${this.asciiMap[effect.name]}! (HP: ${mob.hp}/${mob.maxHp})`);
            }
            effect.turns -= 1;
            if (effect.turns <= 0) {
                toRemove.push(effect);
            }
        });
        mob.statusEffects = mob.statusEffects.filter(e => !toRemove.includes(e));
        return messages;
    }

    rankUpBStyle(mob) {
        let available = Object.keys(mob.ninjaStyles).filter(k => mob.ninjaStyles[k] === "C-Rank");
        if (available.length) {
            let style = available[Math.floor(Math.random() * available.length)];
            mob.ninjaStyles[style] = "B-Rank";
            return `Shinobi ranked up Ninja Style ${style} to B-Rank!`;
        }
        return "";
    }

    chooseSkillCard() {
        if (isInputLocked) return;
        game.gameState = "chooseSkillCard";
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s) && game.player.skills.filter(skill => skill.name === s.name).length < 4);
        if (!availableSkills.length) {
            this.updateOutput("No new skill cards available!");
            setTimeout(() => this.continueGame(), 1000);
            return;
        }
        let choices = availableSkills.sort(() => Math.random() - 0.5).slice(0, Math.min(3, availableSkills.length));
        this.updateOutput("\nChoose a new skill card:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        choices.forEach((skill) => {
            let button = document.createElement("button");
            button.innerText = skill.name;
            button.className = skill.style;
            button.onclick = () => {
                if (isInputLocked) return;
                if (window.confirm(`Add ${skill.name} to your skills?`)) {
                    console.log(`Skill card ${skill.name} confirmed`);
                    lockInput();
                    game.player.skills = game.player.skills.filter(s => game.player.skills.filter(skill => skill.name === s.name).length < 4 || s.name !== skill.name);
                    game.player.skills.push(skill);
                    this.updateOutput(`Shinobi gains new skill card: ${skill.name}!`);
                    if (game.player.skills.length === 10) {
                        this.updateOutput("Congratulations, Shinobi! You are a Genin Shinobi!");
                        let rankUpMessage = this.rankUpBStyle(game.player);
                        if (rankUpMessage) this.updateOutput(rankUpMessage);
                        game.enemy = this.generateEnemy();
                        game.enemy.hp = 20;
                        game.enemy.maxHp = 20;
                        game.enemy.ninjaStyles = { Fire: "C-Rank", Lightning: "C-Rank", Illusion: "C-Rank", Earth: "C-Rank", Feral: "C-Rank" };
                        game.enemy.skills = this.skills.skills.filter(s => this.skills.canUseSkill(game.enemy, s)).sort(() => Math.random() - 0.5).slice(0, 5);
                        setTimeout(() => this.startBattle(), 1000);
                    } else {
                        setTimeout(() => this.continueGame(), 1000);
                    }
                } else {
                    console.log(`Skill card ${skill.name} cancelled`);
                }
            };
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    continueGame() {
        game.battleNum += 1;
        if (game.battleNum <= 4 || game.player.skills.length < 10) {
            game.enemy = this.generateEnemy();
            this.startBattle();
        } else {
            this.updateOutput("Game Complete! Collected 10 skill cards!");
            document.getElementById("controls").innerHTML = "";
        }
    }

    startBattle() {
        game.gameState = "battle";
        game.enemy = game.enemy || this.generateEnemy();
        game.enemy.regenerate();
        this.updateOutput(`\n--- Battle ${game.battleNum} ---`);
        this.updateOutput(`--- Shinobi vs ${game.enemy.name}! ---`);
        document.getElementById("controls").innerHTML = "";
        this.updateStatus();
        this.battleLoop();
    }

    battleLoop() {
        if (game.player.hp <= 0 || game.enemy.hp <= 0) {
            this.endBattle();
            return;
        }

        this.updateOutput("\n--- Shinobi's Turn ---");
        this.updateStatus();
        if (game.player.statusEffects.some(e => e.name === "Stunned")) {
            this.updateOutput(`Shinobi is Stunned ⚡️ and skips this turn!`);
            game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "Stunned");
            setTimeout(() => this.enemyTurn(), 1000);
        } else {
            let validSkills = game.player.skills.filter(s => this.skills.canUseSkill(game.player, s));
            if (validSkills.length) {
                let skill = validSkills[Math.floor(Math.random() * validSkills.length)];
                this.updateOutput(`Shinobi chooses ${skill.name}!`);
                let target = ["Healing Stance", "Shadow Clone Jutsu", "Kawarami", "Rock Barrier Jutsu"].includes(skill.name) ? game.player : game.enemy;
                let multiplier = skill.name === "Shadow Clone Jutsu" ? 1 : game.player.shadowCloneMultiplier;
                for (let i = 0; i < multiplier && game.player.hp > 0 && (target !== game.enemy || game.enemy.hp > 0); i++) {
                    let message = skill.skillFunction(game.player, target);
                    if (message) this.updateOutput(message);
                }
                if (skiname !== "Shadow Clone Jutsu") {
                    game.player.shadowCloneMultiplier = 1;
                    game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                }
            } else {
                this.updateOutput("Shinobi has no skills, skipping turn.");
            }
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }

    enemyTurn() {
        if (game.player.hp <= 0 || game.enemy.hp <= 0) {
            this.endBattle();
            return;
        }

        this.updateOutput(`\n--- ${game.enemy.name}'s Turn ---`);
        this.updateStatus();
        if (game.enemy.statusEffects.some(e => e.name === "Stunned")) {
            this.updateOutput(`${game.enemy.name} is Stunned ⚡️ and skips this turn!`);
            game.enemy.statusEffects = game.enemy.statusEffects.filter(e => e.name !== "Stunned");
            setTimeout(() => this.applyEffects(), 1000);
        } else {
            let skill = game.enemy.skills.length ? game.enemy.skills[Math.floor(Math.random() * game.enemy.skills.length)] : null;
            if (skill) {
                this.updateOutput(`${game.enemy.name} chooses ${skill.name}!`);
                let target = ["Healing Stance", "Shadow Clone Jutsu", "Kawarami", "Rock Barrier Jutsu"].includes(skill.name) ? game.enemy : game.player;
                let multiplier = skill.name === "Shadow Clone Jutsu" ? 1 : game.enemy.shadowCloneMultiplier;
                for (let i = 0; i < multiplier && game.enemy.hp > 0 && (target !== game.player || game.player.hp > 0); i++) {
                    let message = skill.skillFunction(game.enemy, target);
                    if (message) this.updateOutput(message);
                }
                if (skill.name !== "Shadow Clone Jutsu") {
                    game.enemy.shadowCloneMultiplier = 1;
                    game.enemy.statusEffects = game.enemy.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                }
            } else {
                this.updateOutput(`${game.enemy.name} has no skills, skipping turn.`);
            }
            setTimeout(() => this.applyEffects(), 1000);
        }
    }

    applyEffects() {
        let playerMessages = this.applyStatusEffects(game.player);
        playerMessages.forEach(msg => this.updateOutput(msg));
        if (game.player.hp <= 0) {
            this.endBattle();
            return;
        }
        let enemyMessages = this.applyStatusEffects(game.enemy);
        enemyMessages.forEach(msg => this.updateOutput(msg));
        if (game.enemy.hp <= 0) {
            this.endBattle();
            return;
        }
        setTimeout(() => this.battleLoop(), 1000);
    }

    endBattle() {
        this.updateOutput(`\n--- ${game.player.hp > 0 ? "Shinobi" : game.enemy.name} wins! ---`);
        this.updateStatus();
        if (game.player.hp <= 0) {
            this.updateOutput("Game Over! You were defeated.");
            document.getElementById("controls").innerHTML = "";
            return;
        }
        game.player.regenerate();
        this.updateOutput(`Shinobi healed! (HP: ${game.player.hp}/${game.player.maxHp})`);
        if (game.battleNum === 3) {
            let rankUpMessage = this.rankUpBStyle(game.player);
            if (rankUpMessage) this.updateOutput(rankUpMessage);
        }
        setTimeout(() => this.chooseSkillCard(), 1000);
    }
}

// Start game
function startGame() {
    if (isInputLocked) {
        console.log("Start Game blocked: input locked");
        return;
    }
    if (window.confirm("Start ShinobiWay?")) {
        console.log("Start Game confirmed");
        lockInput();
        alert("Starting ShinobiWay!");
        game.output = ["Train to become a Genin Shinobi! Collect 10 skill cards!"];
        document.getElementById("output").innerText = game.output.join("\n");
        let barrageSkill = new Skills().findSkill("Barrage");
        if (barrageSkill) {
            game.player.skills = [barrageSkill];
            console.log("Barrage skill assigned to player");
        } else {
            game.output.push("Error: Barrage skill not found!");
            document.getElementById("output").innerText = game.output.join("\n");
            console.error("Barrage skill not found");
            alert("Error: Barrage skill not found!");
            return;
        }
        setTimeout(() => new BattleScene().chooseNinjaStyles(), 1000);
    } else {
        console.log("Start Game cancelled");
    }
}

// Attach start game handler
document.getElementById("start-game").addEventListener("click", startGame);        this.requirements = requirements;
        this.skillFunction = skillFunction;
        this.style = style; // For button coloring
    }
}

// Mob class
class Mob {
    constructor(name, hp, maxHp, ninjaStyles, skills, statusEffects, shadowCloneMultiplier) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.ninjaStyles = ninjaStyles;
        this.skills = skills;
        this.statusEffects = statusEffects;
        this.shadowCloneMultiplier = shadowCloneMultiplier;
    }

    regenerate() {
        this.hp = this.maxHp;
        this.statusEffects = [];
        this.shadowCloneMultiplier = 1;
    }
}

// Skills class
class Skills {
    constructor() {
        this.skills = [];
        this.initializeSkills();
    }

    barrage(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Barrage"))) {
            return `${caster.name} attempts Barrage, but ${target.name} dodges!`;
        }
        let damage1 = 1;
        let damage2 = Math.floor(Math.random() * 2) + 1;
        target.hp = Math.max(0, target.hp - (damage1 + damage2));
        return `${caster.name} uses Barrage, hitting ${target.name} for ${damage1} + ${damage2} (${damage1 + damage2} total) damage!`;
    }

    demonMindJutsu(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Demon Mind Jutsu"))) {
            return `${caster.name} attempts Demon Mind Jutsu, but ${target.name} dodges!`;
        }
        let damage = 1;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Trauma", 3, 1, 0, true);
        return `${caster.name} uses Demon Mind Jutsu, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Trauma 😵!`;
    }

    fireballJutsu(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Fireball Jutsu"))) {
            return `${caster.name} attempts Fireball Jutsu, but ${target.name} dodges!`;
        }
        let damage = 2;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Burned", 3, 1, 0, true);
        return `${caster.name} uses Fireball Jutsu, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Burned 🔥!`;
    }

    flameThrowJutsu(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Flame Throw Jutsu"))) {
            return `${caster.name} attempts Flame Throw Jutsu, but ${target.name} dodges!`;
        }
        let damage = 2;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Burned", 3, 2, 0, true);
        return `${caster.name} uses Flame Throw Jutsu, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Burned 🔥!`;
    }

    healingStance(caster, target) {
        if (target !== caster) return "";
        let gain = 1;
        caster.hp = Math.min(caster.maxHp, caster.hp + gain);
        let applied = this.addStatusEffect(caster, "Healing", 3, 0, 1, false);
        return `${caster.name} uses Healing Stance, recovering ${gain} Health (HP: ${caster.hp}/${caster.maxHp}) 🌿!`;
    }

    raikiri(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Raikiri"))) {
            return `${caster.name} attempts Raikiri, but ${target.name} dodges!`;
        }
        let damage = Math.floor(Math.random() * 2) + 2;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Stunned", 1, 0, 0, false);
        return `${caster.name} uses Raikiri, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Stunned ⚡️!`;
    }

    shadowCloneJutsu(caster, target) {
        if (target !== caster) return "";
        if (caster.shadowCloneMultiplier < 8) {
            caster.shadowCloneMultiplier *= 2;
        }
        let applied = this.addStatusEffect(caster, "ShadowCloneEffect", 1, 0, 0, true);
        return `${caster.name} uses Shadow Clone Jutsu, multiplying next skill by ${caster.shadowCloneMultiplier}x 👥!`;
    }

    bite(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Bite"))) {
            return `${caster.name} attempts Bite, but ${target.name} dodges!`;
        }
        let damage = Math.floor(Math.random() * 2) + 1;
        target.hp = Math.max(0, target.hp - damage);
        return `${caster.name} uses Bite, dealing ${damage} damage to ${target.name}!`;
    }

    kawarami(caster, target) {
        if (target !== caster) return "";
        let applied = this.addStatusEffect(caster, "Kawarami", 2, 0, 0, false);
        return `${caster.name} uses Kawarami, ${applied ? "preparing" : "failing to prepare"} substitution 🪵!`;
    }

    rockBarrierJutsu(caster, target) {
        if (target !== caster) return "";
        let applied = this.addStatusEffect(caster, "Rock Barrier", 1, 0, 0, false);
        return `${caster.name} uses Rock Barrier Jutsu, ${applied ? "summoning" : "failing to summon"} a barrier 🪨!`;
    }

    impendingDoom(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Impending Doom"))) {
            return `${caster.name} attempts Impending Doom, but ${target.name} dodges!`;
        }
        let appliedStun = this.addStatusEffect(target, "Stunned", 1, 0, 0, false);
        target.statusEffects.push(new StatusEffect("Trauma", 3, 1, 0, true));
        target.statusEffects.push(new StatusEffect("Trauma", 3, 1, 0, true));
        return `${caster.name} uses Impending Doom, ${appliedStun ? "applying" : "failing to apply"} Stunned ⚡️ and applying 2 Trauma 😵 effects!`;
    }

    boulderCrush(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Boulder Crush"))) {
            return `${caster.name} attempts Boulder Crush, but ${target.name} dodges!`;
        }
        let damage = 4;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Stunned", 1, 0, 0, false);
        return `${caster.name} uses Boulder Crush, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Stunned ⚡️!`;
    }

    checkDefense(target, skill) {
        if (!skill) return false;
        let kawarami = target.statusEffects.find(e => e.name === "Kawarami");
        if (kawarami && kawarami.turns > 0) {
            kawarami.turns -= 1;
            if (kawarami.turns <= 0) {
                target.statusEffects = target.statusEffects.filter(e => e !== kawarami);
            }
            return true;
        }
        if (target.shadowCloneMultiplier > 1) {
            target.shadowCloneMultiplier = 1;
            target.statusEffects = target.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
            return true;
        }
        let rockBarrier = target.statusEffects.find(e => e.name === "Rock Barrier");
        if (rockBarrier && rockBarrier.turns > 0 && !skill.attributes.includes("Illusion")) {
            rockBarrier.turns -= 1;
            if (rockBarrier.turns <= 0) {
                target.statusEffects = target.statusEffects.filter(e => e !== rockBarrier);
            }
            return true;
        }
        return false;
    }

    findSkill(name) {
        return this.skills.find(s => s.name === name) || null;
    }

    canUseSkill(player, skill) {
        if (!skill || !Object.keys(skill.requirements).length) return true;
        for (let style in skill.requirements) {
            let playerRank = player.ninjaStyles[style] || "D-Rank";
            let requiredRank = skill.requirements[style];
            if (requiredRank === "D-Rank") return true;
            if (requiredRank === "C-Rank" && ["C-Rank", "B-Rank", "A-Rank", "S-Rank"].includes(playerRank)) return true;
            if (requiredRank === "B-Rank" && ["B-Rank", "A-Rank", "S-Rank"].includes(playerRank)) return true;
            if (requiredRank === "A-Rank" && ["A-Rank", "S-Rank"].includes(playerRank)) return true;
            if (requiredRank === "S-Rank" && playerRank === "S-Rank") return true;
        }
        return false;
    }

    addStatusEffect(target, name, turns, damage, heal, isDamage) {
        if (!target.statusEffects.some(e => e.name === name)) {
            target.statusEffects.push(new StatusEffect(name, turns, damage, heal, isDamage));
            return true;
        }
        return false;
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
}

// Battle scene
class BattleScene {
    constructor() {
        this.skills = new Skills();
        this.asciiMap = {
            Trauma: "😵",
            Burned: "🔥",
            Healing: "🌿",
            Stunned: "⚡️",
            ShadowCloneEffect: "👥",
            Kawarami: "🪵",
            "Rock Barrier": "🪨"
        };
        this.chosenStyles = [];
        this.chosenSkills = [];
    }

    updateOutput(text) {
        game.output.push(text);
        document.getElementById("output").innerText = game.output.join("\n");
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    }

    updateStatus() {
        let playerEffects = game.player.statusEffects.map(e => `<span class="status-${e.name.toLowerCase().replace(" ", "")}">${this.asciiMap[e.name] || ""}</span>`).join("");
        let enemyEffects = game.enemy ? game.enemy.statusEffects.map(e => `<span class="status-${e.name.toLowerCase().replace(" ", "")}">${this.asciiMap[e.name] || ""}</span>`).join("") : "";
        document.getElementById("player-status").innerHTML = `Shinobi [HP: <span class="player-hp">${game.player.hp}/${game.player.maxHp}</span>] ${playerEffects}`;
        document.getElementById("enemy-status").innerHTML = game.enemy ? `${game.enemy.name} [HP: <span class="enemy-hp">${game.enemy.hp}/${game.enemy.maxHp}</span>] ${enemyEffects}` : "Enemy [HP: <span class='enemy-hp'>0/0</span>]";
        document.getElementById("skill-count").innerText = `Skill cards: ${game.player.skills.length}`;
    }

    chooseNinjaStyles() {
        game.gameState = "chooseStyles";
        let styles = ["Fire", "Lightning", "Illusion", "Earth", "Feral"].filter(s => !this.chosenStyles.includes(s));
        this.updateOutput("Choose two Ninja Styles to rank up to C-Rank:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        styles.forEach((style) => {
            let button = document.createElement("button");
            button.innerText = style;
            button.className = style.toLowerCase();
            button.onclick = () => {
                if (window.confirm(`Train ${style} to C-Rank?`)) {
                    button.disabled = true;
                    this.selectStyle(style);
                }
            };
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    selectStyle(style) {
        if (this.chosenStyles.length < 2) {
            this.chosenStyles.push(style);
            game.player.ninjaStyles[style] = "C-Rank";
            this.updateOutput(`Shinobi trains Ninja Style ${style} to C-Rank!`);
            if (this.chosenStyles.length === 2) {
                setTimeout(() => this.chooseStartingSkills(), 1000);
            } else {
                setTimeout(() => this.chooseNinjaStyles(), 1000);
            }
        }
    }

    chooseStartingSkills() {
        game.gameState = "chooseSkills";
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s) && !this.chosenSkills.includes(s));
        this.updateOutput("\nChoose three starting skill cards:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        availableSkills.forEach((skill) => {
            let button = document.createElement("button");
            button.innerText = skill.name;
            button.className = skill.style;
            button.onclick = () => {
                if (window.confirm(`Choose ${skill.name} as a starting skill?`)) {
                    button.disabled = true;
                    this.selectSkill(skill);
                }
            };
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    selectSkill(skill) {
        if (this.chosenSkills.length < 3) {
            this.chosenSkills.push(skill);
            game.player.skills.push(skill);
            this.updateOutput(`Selected skill card: ${skill.name}`);
            if (this.chosenSkills.length === 3) {
                this.updateOutput(`Skill cards: ${game.player.skills.length}`);
                setTimeout(() => this.startBattle(), 1000);
            } else {
                setTimeout(() => this.chooseStartingSkills(), 1000);
            }
        }
    }

    generateEnemy() {
        let enemyName = this.battleNum <= 2 ? `Wild Dog ${this.battleNum}` : this.battleNum === 3 ? "Dummy" : "Genin";
        let hp = this.battleNum <= 3 ? 5 : 8 + this.battleNum; // Wild Dog 1, 2, and Dummy: 5 HP
        let enemy = new Mob(
            enemyName,
            hp,
            hp,
            { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" },
            [],
            [],
            1
        );
        let biteSkill = this.skills.findSkill("Bite");
        if (this.battleNum <= 2 && biteSkill) {
            enemy.skills = [biteSkill]; // Wild Dogs only use Bite
        } else {
            let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(enemy, s));
            enemy.skills = availableSkills.sort(() => Math.random() - 0.5).slice(0, Math.min(3, availableSkills.length));
        }
        if (this.battleNum > 3) {
            let style = Object.keys(enemy.ninjaStyles)[Math.floor(Math.random() * 5)];
            enemy.ninjaStyles[style] = "C-Rank";
            enemy.skills = this.skills.skills.filter(s => this.skills.canUseSkill(enemy, s)).sort(() => Math.random() - 0.5).slice(0, Math.min(3, availableSkills.length));
        }
        return enemy;
    }

    applyStatusEffects(mob) {
        let messages = [];
        let toRemove = [];
        mob.statusEffects.forEach(effect => {
            if (effect.isDamage) {
                mob.hp = Math.max(0, mob.hp - effect.damage);
                messages.push(`${mob.name} takes ${effect.damage} ${effect.name} ${this.asciiMap[effect.name]} damage! (HP: ${mob.hp}/${mob.maxHp})`);
            } else {
                mob.hp = Math.min(mob.maxHp, mob.hp + effect.heal);
                messages.push(`${mob.name} recovers ${effect.heal} Health ${this.asciiMap[effect.name]}! (HP: ${mob.hp}/${mob.maxHp})`);
            }
            effect.turns -= 1;
            if (effect.turns <= 0) {
                toRemove.push(effect);
            }
        });
        mob.statusEffects = mob.statusEffects.filter(e => !toRemove.includes(e));
        return messages;
    }

    rankUpBStyle(mob) {
        let available = Object.keys(mob.ninjaStyles).filter(k => mob.ninjaStyles[k] === "C-Rank");
        if (available.length) {
            let style = available[Math.floor(Math.random() * available.length)];
            mob.ninjaStyles[style] = "B-Rank";
            return `Shinobi ranked up Ninja Style ${style} to B-Rank!`;
        }
        return "";
    }

    chooseSkillCard() {
        game.gameState = "chooseSkillCard";
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s) && game.player.skills.filter(skill => skill.name === s.name).length < 4);
        if (!availableSkills.length) {
            this.updateOutput("No new skill cards available!");
            setTimeout(() => this.continueGame(), 1000);
            return;
        }
        let choices = availableSkills.sort(() => Math.random() - 0.5).slice(0, Math.min(3, availableSkills.length));
        this.updateOutput("\nChoose a new skill card:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        choices.forEach((skill) => {
            let button = document.createElement("button");
            button.innerText = skill.name;
            button.className = skill.style;
            button.onclick = () => {
                if (window.confirm(`Add ${skill.name} to your skills?`)) {
                    button.disabled = true;
                    game.player.skills = game.player.skills.filter(s => game.player.skills.filter(skill => skill.name === s.name).length < 4 || s.name !== skill.name);
                    game.player.skills.push(skill);
                    this.updateOutput(`Shinobi gains new skill card: ${skill.name}!`);
                    if (game.player.skills.length === 10) {
                        this.updateOutput("Congratulations, Shinobi! You are a Genin Shinobi!");
                        let rankUpMessage = this.rankUpBStyle(game.player);
                        if (rankUpMessage) this.updateOutput(rankUpMessage);
                        game.enemy = this.generateEnemy();
                        game.enemy.hp = 20;
                        game.enemy.maxHp = 20;
                        game.enemy.ninjaStyles = { Fire: "C-Rank", Lightning: "C-Rank", Illusion: "C-Rank", Earth: "C-Rank", Feral: "C-Rank" };
                        game.enemy.skills = this.skills.skills.filter(s => this.skills.canUseSkill(game.enemy, s)).sort(() => Math.random() - 0.5).slice(0, 5);
                        setTimeout(() => this.startBattle(), 1000);
                    } else {
                        setTimeout(() => this.continueGame(), 1000);
                    }
                }
            };
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    continueGame() {
        game.battleNum += 1;
        if (game.battleNum <= 4 || game.player.skills.length < 10) {
            game.enemy = this.generateEnemy();
            this.startBattle();
        } else {
            this.updateOutput("Game Complete! Collected 10 skill cards!");
            document.getElementById("controls").innerHTML = "";
        }
    }

    startBattle() {
        game.gameState = "battle";
        game.enemy = game.enemy || this.generateEnemy();
        game.enemy.regenerate();
        this.updateOutput(`\n--- Battle ${game.battleNum} ---`);
        this.updateOutput(`--- Shinobi vs ${game.enemy.name}! ---`);
        document.getElementById("controls").innerHTML = "";
        this.updateStatus();
        this.battleLoop();
    }

    battleLoop() {
        if (game.player.hp <= 0 || game.enemy.hp <= 0) {
            this.endBattle();
            return;
        }

        // Player's turn
        this.updateOutput("\n--- Shinobi's Turn ---");
        this.updateStatus();
        if (game.player.statusEffects.some(e => e.name === "Stunned")) {
            this.updateOutput(`Shinobi is Stunned ⚡️ and skips this turn!`);
            game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "Stunned");
            setTimeout(() => this.enemyTurn(), 1000);
        } else {
            let validSkills = game.player.skills.filter(s => this.skills.canUseSkill(game.player, s));
            if (validSkills.length) {
                let skill = validSkills[Math.floor(Math.random() * validSkills.length)];
                this.updateOutput(`Shinobi chooses ${skill.name}!`);
                let target = ["Healing Stance", "Shadow Clone Jutsu", "Kawarami", "Rock Barrier Jutsu"].includes(skill.name) ? game.player : game.enemy;
                let multiplier = skill.name === "Shadow Clone Jutsu" ? 1 : game.player.shadowCloneMultiplier;
                for (let i = 0; i < multiplier && game.player.hp > 0 && (target !== game.enemy || game.enemy.hp > 0); i++) {
                    let message = skill.skillFunction(game.player, target);
                    if (message) this.updateOutput(message);
                }
                if (skill.name !== "Shadow Clone Jutsu") {
                    game.player.shadowCloneMultiplier = 1;
                    game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                }
            } else {
                this.updateOutput("Shinobi has no skills, skipping turn.");
            }
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }

    enemyTurn() {
        if (game.player.hp <= 0 || game.enemy.hp <= 0) {
            this.endBattle();
            return;
        }

        this.updateOutput(`\n--- ${game.enemy.name}'s Turn ---`);
        this.updateStatus();
        if (game.enemy.statusEffects.some(e => e.name === "Stunned")) {
            this.updateOutput(`${game.enemy.name} is Stunned ⚡️ and skips this turn!`);
            game.enemy.statusEffects = game.enemy.statusEffects.filter(e => e.name !== "Stunned");
            setTimeout(() => this.applyEffects(), 1000);
        } else {
            let skill = game.enemy.skills.length ? game.enemy.skills[Math.floor(Math.random() * game.enemy.skills.length)] : null;
            if (skill) {
                this.updateOutput(`${game.enemy.name} chooses ${skill.name}!`);
                let target = ["Healing Stance", "Shadow Clone Jutsu", "Kawarami", "Rock Barrier Jutsu"].includes(skill.name) ? game.enemy : game.player;
                let multiplier = skill.name === "Shadow Clone Jutsu" ? 1 : game.enemy.shadowCloneMultiplier;
                for (let i = 0; i < multiplier && game.enemy.hp > 0 && (target !== game.player || game.player.hp > 0); i++) {
                    let message = skill.skillFunction(game.enemy, target);
                    if (message) this.updateOutput(message);
                }
                if (skill.name !== "Shadow Clone Jutsu") {
                    game.enemy.shadowCloneMultiplier = 1;
                    game.enemy.statusEffects = game.enemy.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                }
            } else {
                this.updateOutput(`${game.enemy.name} has no skills, skipping turn.`);
            }
            setTimeout(() => this.applyEffects(), 1000);
        }
    }

    applyEffects() {
        let playerMessages = this.applyStatusEffects(game.player);
        playerMessages.forEach(msg => this.updateOutput(msg));
        if (game.player.hp <= 0) {
            this.endBattle();
            return;
        }
        let enemyMessages = this.applyStatusEffects(game.enemy);
        enemyMessages.forEach(msg => this.updateOutput(msg));
        if (game.enemy.hp <= 0) {
            this.endBattle();
            return;
        }
        setTimeout(() => this.battleLoop(), 1000);
    }

    endBattle() {
        this.updateOutput(`\n--- ${game.player.hp > 0 ? "Shinobi" : game.enemy.name} wins! ---`);
        this.updateStatus();
        if (game.player.hp <= 0) {
            this.updateOutput("Game Over! You were defeated.");
            document.getElementById("controls").innerHTML = "";
            return;
        }
        game.player.regenerate();
        this.updateOutput(`Shinobi healed! (HP: ${game.player.hp}/${game.player.maxHp})`);
        if (game.battleNum === 3) {
            let rankUpMessage = this.rankUpBStyle(game.player);
            if (rankUpMessage) this.updateOutput(rankUpMessage);
        }
        setTimeout(() => this.chooseSkillCard(), 1000);
    }
}

// Start game
document.getElementById("start-game").onclick = () => {
    if (window.confirm("Start ShinobiWay?")) {
        document.getElementById("start-game").disabled = true;
        console.log("Start Game button clicked");
        alert("Starting ShinobiWay!");
        game.output = ["Train to become a Genin Shinobi! Collect 10 skill cards!"];
        document.getElementById("output").innerText = game.output.join("\n");
        let barrageSkill = new Skills().findSkill("Barrage");
        if (barrageSkill) {
            game.player.skills = [barrageSkill];
            console.log("Barrage skill assigned to player");
        } else {
            game.output.push("Error: Barrage skill not found!");
            document.getElementById("output").innerText = game.output.join("\n");
            console.error("Barrage skill not found");
            alert("Error: Barrage skill not found!");
            return;
        }
        setTimeout(() => new BattleScene().chooseNinjaStyles(), 1000);
    }
};        this.damage = damage;
        this.heal = heal;
        this.isDamage = isDamage;
    }
}

// Battle skill class
class BattleSkill {
    constructor(name, attributes, requirements, skillFunction) {
        this.name = name;
        this.attributes = attributes;
        this.requirements = requirements;
        this.skillFunction = skillFunction;
    }
}

// Mob class
class Mob {
    constructor(name, hp, maxHp, ninjaStyles, skills, statusEffects, shadowCloneMultiplier) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.ninjaStyles = ninjaStyles;
        this.skills = skills;
        this.statusEffects = statusEffects;
        this.shadowCloneMultiplier = shadowCloneMultiplier;
    }

    regenerate() {
        this.hp = this.maxHp;
        this.statusEffects = [];
        this.shadowCloneMultiplier = 1;
    }
}

// Skills class
class Skills {
    constructor() {
        this.skills = [];
        this.initializeSkills();
    }

    barrage(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Barrage"))) {
            return `${caster.name} attempts Barrage, but ${target.name} dodges!`;
        }
        let damage1 = 1;
        let damage2 = Math.floor(Math.random() * 2) + 1;
        target.hp = Math.max(0, target.hp - (damage1 + damage2));
        return `${caster.name} uses Barrage, hitting ${target.name} for ${damage1} + ${damage2} (${damage1 + damage2} total) damage!`;
    }

    demonMindJutsu(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Demon Mind Jutsu"))) {
            return `${caster.name} attempts Demon Mind Jutsu, but ${target.name} dodges!`;
        }
        let damage = 1;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Trauma", 3, 1, 0, true);
        return `${caster.name} uses Demon Mind Jutsu, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Trauma!`;
    }

    fireballJutsu(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Fireball Jutsu"))) {
            return `${caster.name} attempts Fireball Jutsu, but ${target.name} dodges!`;
        }
        let damage = 2;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Burned", 3, 1, 0, true);
        return `${caster.name} uses Fireball Jutsu, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Burned!`;
    }

    flameThrowJutsu(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Flame Throw Jutsu"))) {
            return `${caster.name} attempts Flame Throw Jutsu, but ${target.name} dodges!`;
        }
        let damage = 2;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Burned", 3, 2, 0, true);
        return `${caster.name} uses Flame Throw Jutsu, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Burned!`;
    }

    healingStance(caster, target) {
        if (target !== caster) return "";
        let gain = 1;
        caster.hp = Math.min(caster.maxHp, caster.hp + gain);
        let applied = this.addStatusEffect(caster, "Healing", 3, 0, 1, false);
        return `${caster.name} uses Healing Stance, recovering ${gain} Health (HP: ${caster.hp}/${caster.maxHp})!`;
    }

    raikiri(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Raikiri"))) {
            return `${caster.name} attempts Raikiri, but ${target.name} dodges!`;
        }
        let damage = Math.floor(Math.random() * 2) + 2;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Stunned", 1, 0, 0, false);
        return `${caster.name} uses Raikiri, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Stunned!`;
    }

    shadowCloneJutsu(caster, target) {
        if (target !== caster) return "";
        if (caster.shadowCloneMultiplier < 8) {
            caster.shadowCloneMultiplier *= 2;
        }
        let applied = this.addStatusEffect(caster, "ShadowCloneEffect", 1, 0, 0, true);
        return `${caster.name} uses Shadow Clone Jutsu, multiplying next skill by ${caster.shadowCloneMultiplier}x!`;
    }

    bite(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Bite"))) {
            return `${caster.name} attempts Bite, but ${target.name} dodges!`;
        }
        let damage = Math.floor(Math.random() * 2) + 1;
        target.hp = Math.max(0, target.hp - damage);
        return `${caster.name} uses Bite, dealing ${damage} damage to ${target.name}!`;
    }

    kawarami(caster, target) {
        if (target !== caster) return "";
        let applied = this.addStatusEffect(caster, "Kawarami", 2, 0, 0, false);
        return `${caster.name} uses Kawarami, ${applied ? "preparing" : "failing to prepare"} substitution!`;
    }

    rockBarrierJutsu(caster, target) {
        if (target !== caster) return "";
        let applied = this.addStatusEffect(caster, "Rock Barrier", 1, 0, 0, false);
        return `${caster.name} uses Rock Barrier Jutsu, ${applied ? "summoning" : "failing to summon"} a barrier!`;
    }

    impendingDoom(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Impending Doom"))) {
            return `${caster.name} attempts Impending Doom, but ${target.name} dodges!`;
        }
        let appliedStun = this.addStatusEffect(target, "Stunned", 1, 0, 0, false);
        target.statusEffects.push(new StatusEffect("Trauma", 3, 1, 0, true));
        target.statusEffects.push(new StatusEffect("Trauma", 3, 1, 0, true));
        return `${caster.name} uses Impending Doom, ${appliedStun ? "applying" : "failing to apply"} Stunned and applying 2 Trauma effects!`;
    }

    boulderCrush(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Boulder Crush"))) {
            return `${caster.name} attempts Boulder Crush, but ${target.name} dodges!`;
        }
        let damage = 4;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Stunned", 1, 0, 0, false);
        return `${caster.name} uses Boulder Crush, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Stunned!`;
    }

    checkDefense(target, skill) {
        if (!skill) return false;
        let kawarami = target.statusEffects.find(e => e.name === "Kawarami");
        if (kawarami && kawarami.turns > 0) {
            kawarami.turns -= 1;
            if (kawarami.turns <= 0) {
                target.statusEffects = target.statusEffects.filter(e => e !== kawarami);
            }
            return true;
        }
        if (target.shadowCloneMultiplier > 1) {
            target.shadowCloneMultiplier = 1;
            target.statusEffects = target.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
            return true;
        }
        let rockBarrier = target.statusEffects.find(e => e.name === "Rock Barrier");
        if (rockBarrier && rockBarrier.turns > 0 && !skill.attributes.includes("Illusion")) {
            rockBarrier.turns -= 1;
            if (rockBarrier.turns <= 0) {
                target.statusEffects = target.statusEffects.filter(e => e !== rockBarrier);
            }
            return true;
        }
        return false;
    }

    findSkill(name) {
        return this.skills.find(s => s.name === name) || null;
    }

    canUseSkill(player, skill) {
        if (!skill || !Object.keys(skill.requirements).length) return true;
        for (let style in skill.requirements) {
            let playerRank = player.ninjaStyles[style] || "D-Rank";
            let requiredRank = skill.requirements[style];
            if (requiredRank === "D-Rank") return true;
            if (requiredRank === "C-Rank" && ["C-Rank", "B-Rank", "A-Rank", "S-Rank"].includes(playerRank)) return true;
            if (requiredRank === "B-Rank" && ["B-Rank", "A-Rank", "S-Rank"].includes(playerRank)) return true;
            if (requiredRank === "A-Rank" && ["A-Rank", "S-Rank"].includes(playerRank)) return true;
            if (requiredRank === "S-Rank" && playerRank === "S-Rank") return true;
        }
        return false;
    }

    addStatusEffect(target, name, turns, damage, heal, isDamage) {
        if (!target.statusEffects.some(e => e.name === name)) {
            target.statusEffects.push(new StatusEffect(name, turns, damage, heal, isDamage));
            return true;
        }
        return false;
    }

    initializeSkills() {
        this.skills = [
            new BattleSkill("Barrage", [], {}, this.barrage.bind(this)),
            new BattleSkill("Demon Mind Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.demonMindJutsu.bind(this)),
            new BattleSkill("Fireball Jutsu", ["Fire"], { Fire: "C-Rank" }, this.fireballJutsu.bind(this)),
            new BattleSkill("Flame Throw Jutsu", ["Fire"], { Fire: "B-Rank" }, this.flameThrowJutsu.bind(this)),
            new BattleSkill("Healing Stance", [], {}, this.healingStance.bind(this)),
            new BattleSkill("Raikiri", ["Lightning"], { Lightning: "C-Rank" }, this.raikiri.bind(this)),
            new BattleSkill("Shadow Clone Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.shadowCloneJutsu.bind(this)),
            new BattleSkill("Bite", ["Feral"], { Feral: "C-Rank" }, this.bite.bind(this)),
            new BattleSkill("Kawarami", [], {}, this.kawarami.bind(this)),
            new BattleSkill("Rock Barrier Jutsu", ["Earth"], { Earth: "C-Rank" }, this.rockBarrierJutsu.bind(this)),
            new BattleSkill("Impending Doom", ["Illusion"], { Illusion: "B-Rank" }, this.impendingDoom.bind(this)),
            new BattleSkill("Boulder Crush", ["Earth"], { Earth: "B-Rank" }, this.boulderCrush.bind(this))
        ];
    }
}

// Battle scene
class BattleScene {
    constructor() {
        this.skills = new Skills();
        this.asciiMap = {
            Trauma: "T",
            Burned: "B",
            Healing: "H",
            Stunned: "S",
            ShadowCloneEffect: "C",
            Kawarami: "K",
            "Rock Barrier": "R"
        };
        this.chosenStyles = [];
        this.chosenSkills = [];
    }

    updateOutput(text) {
        game.output.push(text);
        document.getElementById("output").innerText = game.output.join("\n");
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    }

    updateStatus() {
        let playerEffects = game.player.statusEffects.map(e => this.asciiMap[e.name] || "").join("");
        let enemyEffects = game.enemy ? game.enemy.statusEffects.map(e => this.asciiMap[e.name] || "").join("") : "";
        document.getElementById("player-status").innerText = `Shinobi [HP: ${game.player.hp}/${game.player.maxHp}] ${playerEffects}`;
        document.getElementById("enemy-status").innerText = game.enemy ? `${game.enemy.name} [HP: ${game.enemy.hp}/${game.enemy.maxHp}] ${enemyEffects}` : "Enemy [HP: 0/0]";
        document.getElementById("skill-count").innerText = `Skill cards: ${game.player.skills.length}`;
    }

    chooseNinjaStyles() {
        game.gameState = "chooseStyles";
        let styles = ["Fire", "Lightning", "Illusion", "Earth", "Feral"].filter(s => !this.chosenStyles.includes(s));
        this.updateOutput("Choose two Ninja Styles to rank up to C-Rank:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        styles.forEach((style, index) => {
            let button = document.createElement("button");
            button.innerText = style;
            button.onclick = debounce(() => this.selectStyle(style));
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    selectStyle(style) {
        if (this.chosenStyles.length < 2) {
            this.chosenStyles.push(style);
            game.player.ninjaStyles[style] = "C-Rank";
            this.updateOutput(`Shinobi trains Ninja Style ${style} to C-Rank!`);
            if (this.chosenStyles.length === 2) {
                setTimeout(() => this.chooseStartingSkills(), 1000);
            } else {
                setTimeout(() => this.chooseNinjaStyles(), 1000);
            }
        }
    }

    chooseStartingSkills() {
        game.gameState = "chooseSkills";
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s) && !this.chosenSkills.includes(s));
        this.updateOutput("\nChoose three starting skill cards:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        availableSkills.forEach((skill, index) => {
            let button = document.createElement("button");
            button.innerText = skill.name;
            button.onclick = debounce(() => this.selectSkill(skill));
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    selectSkill(skill) {
        if (this.chosenSkills.length < 3) {
            this.chosenSkills.push(skill);
            game.player.skills.push(skill);
            this.updateOutput(`Selected skill card: ${skill.name}`);
            if (this.chosenSkills.length === 3) {
                this.updateOutput(`Skill cards: ${game.player.skills.length}`);
                setTimeout(() => this.startBattle(), 1000);
            } else {
                setTimeout(() => this.chooseStartingSkills(), 1000);
            }
        }
    }

    generateEnemy() {
        let enemyName = this.battleNum <= 2 ? `Wild Dog ${this.battleNum}` : this.battleNum === 3 ? "Dummy" : "Genin";
        let hp = this.battleNum <= 3 ? 5 : 8 + this.battleNum; // Wild Dog 1, 2, and Dummy: 5 HP
        let enemy = new Mob(
            enemyName,
            hp,
            hp,
            { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" },
            [],
            [],
            1
        );
        let biteSkill = this.skills.findSkill("Bite");
        if (this.battleNum <= 2 && biteSkill) {
            enemy.skills = [biteSkill]; // Wild Dogs only use Bite
        } else {
            let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(enemy, s));
            enemy.skills = availableSkills.sort(() => Math.random() - 0.5).slice(0, Math.min(3, availableSkills.length));
        }
        if (this.battleNum > 3) {
            let style = Object.keys(enemy.ninjaStyles)[Math.floor(Math.random() * 5)];
            enemy.ninjaStyles[style] = "C-Rank";
            enemy.skills = this.skills.skills.filter(s => this.skills.canUseSkill(enemy, s)).sort(() => Math.random() - 0.5).slice(0, Math.min(3, availableSkills.length));
        }
        return enemy;
    }

    applyStatusEffects(mob) {
        let messages = [];
        let toRemove = [];
        mob.statusEffects.forEach(effect => {
            if (effect.isDamage) {
                mob.hp = Math.max(0, mob.hp - effect.damage);
                messages.push(`${mob.name} takes ${effect.damage} ${effect.name} damage! (HP: ${mob.hp}/${mob.maxHp})`);
            } else {
                mob.hp = Math.min(mob.maxHp, mob.hp + effect.heal);
                messages.push(`${mob.name} recovers ${effect.heal} Health! (HP: ${mob.hp}/${mob.maxHp})`);
            }
            effect.turns -= 1;
            if (effect.turns <= 0) {
                toRemove.push(effect);
            }
        });
        mob.statusEffects = mob.statusEffects.filter(e => !toRemove.includes(e));
        return messages;
    }

    rankUpBStyle(mob) {
        let available = Object.keys(mob.ninjaStyles).filter(k => mob.ninjaStyles[k] === "C-Rank");
        if (available.length) {
            let style = available[Math.floor(Math.random() * available.length)];
            mob.ninjaStyles[style] = "B-Rank";
            return `Shinobi ranked up Ninja Style ${style} to B-Rank!`;
        }
        return "";
    }

    chooseSkillCard() {
        game.gameState = "chooseSkillCard";
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s) && game.player.skills.filter(skill => skill.name === s.name).length < 4);
        if (!availableSkills.length) {
            this.updateOutput("No new skill cards available!");
            setTimeout(() => this.continueGame(), 1000);
            return;
        }
        let choices = availableSkills.sort(() => Math.random() - 0.5).slice(0, Math.min(3, availableSkills.length));
        this.updateOutput("\nChoose a new skill card:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        choices.forEach((skill, index) => {
            let button = document.createElement("button");
            button.innerText = skill.name;
            button.onclick = debounce(() => {
                game.player.skills = game.player.skills.filter(s => game.player.skills.filter(skill => skill.name === s.name).length < 4 || s.name !== skill.name);
                game.player.skills.push(skill);
                this.updateOutput(`Shinobi gains new skill card: ${skill.name}!`);
                if (game.player.skills.length === 10) {
                    this.updateOutput("Congratulations, Shinobi! You are a Genin Shinobi!");
                    let rankUpMessage = this.rankUpBStyle(game.player);
                    if (rankUpMessage) this.updateOutput(rankUpMessage);
                    game.enemy = this.generateEnemy();
                    game.enemy.hp = 20;
                    game.enemy.maxHp = 20;
                    game.enemy.ninjaStyles = { Fire: "C-Rank", Lightning: "C-Rank", Illusion: "C-Rank", Earth: "C-Rank", Feral: "C-Rank" };
                    game.enemy.skills = this.skills.skills.filter(s => this.skills.canUseSkill(game.enemy, s)).sort(() => Math.random() - 0.5).slice(0, 5);
                    setTimeout(() => this.startBattle(), 1000);
                } else {
                    setTimeout(() => this.continueGame(), 1000);
                }
            });
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    continueGame() {
        game.battleNum += 1;
        if (game.battleNum <= 4 || game.player.skills.length < 10) {
            game.enemy = this.generateEnemy();
            this.startBattle();
        } else {
            this.updateOutput("Game Complete! Collected 10 skill cards!");
            document.getElementById("controls").innerHTML = "";
        }
    }

    startBattle() {
        game.gameState = "battle";
        game.enemy = game.enemy || this.generateEnemy();
        game.enemy.regenerate();
        this.updateOutput(`\n--- Battle ${game.battleNum} ---`);
        this.updateOutput(`--- Shinobi vs ${game.enemy.name}! ---`);
        document.getElementById("controls").innerHTML = "";
        this.updateStatus();
        this.battleLoop();
    }

    battleLoop() {
        if (game.player.hp <= 0 || game.enemy.hp <= 0) {
            this.endBattle();
            return;
        }

        // Player's turn
        this.updateOutput("\n--- Shinobi's Turn ---");
        this.updateStatus();
        if (game.player.statusEffects.some(e => e.name === "Stunned")) {
            this.updateOutput("Shinobi is Stunned and skips this turn!");
            game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "Stunned");
            setTimeout(() => this.enemyTurn(), 1000);
        } else {
            let validSkills = game.player.skills.filter(s => this.skills.canUseSkill(game.player, s));
            if (validSkills.length) {
                let skill = validSkills[Math.floor(Math.random() * validSkills.length)];
                this.updateOutput(`Shinobi chooses ${skill.name}!`);
                let target = ["Healing Stance", "Shadow Clone Jutsu", "Kawarami", "Rock Barrier Jutsu"].includes(skill.name) ? game.player : game.enemy;
                let multiplier = skill.name === "Shadow Clone Jutsu" ? 1 : game.player.shadowCloneMultiplier;
                for (let i = 0; i < multiplier && game.player.hp > 0 && (target !== game.enemy || game.enemy.hp > 0); i++) {
                    let message = skill.skillFunction(game.player, target);
                    if (message) this.updateOutput(message);
                }
                if (skill.name !== "Shadow Clone Jutsu") {
                    game.player.shadowCloneMultiplier = 1;
                    game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                }
            } else {
                this.updateOutput("Shinobi has no skills, skipping turn.");
            }
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }

    enemyTurn() {
        if (game.player.hp <= 0 || game.enemy.hp <= 0) {
            this.endBattle();
            return;
        }

        this.updateOutput(`\n--- ${game.enemy.name}'s Turn ---`);
        this.updateStatus();
        if (game.enemy.statusEffects.some(e => e.name === "Stunned")) {
            this.updateOutput(`${game.enemy.name} is Stunned and skips this turn!`);
            game.enemy.statusEffects = game.enemy.statusEffects.filter(e => e.name !== "Stunned");
            setTimeout(() => this.applyEffects(), 1000);
        } else {
            let skill = game.enemy.skills.length ? game.enemy.skills[Math.floor(Math.random() * game.enemy.skills.length)] : null;
            if (skill) {
                this.updateOutput(`${game.enemy.name} chooses ${skill.name}!`);
                let target = ["Healing Stance", "Shadow Clone Jutsu", "Kawarami", "Rock Barrier Jutsu"].includes(skill.name) ? game.enemy : game.player;
                let multiplier = skill.name === "Shadow Clone Jutsu" ? 1 : game.enemy.shadowCloneMultiplier;
                for (let i = 0; i < multiplier && game.enemy.hp > 0 && (target !== game.player || game.player.hp > 0); i++) {
                    let message = skill.skillFunction(game.enemy, target);
                    if (message) this.updateOutput(message);
                }
                if (skill.name !== "Shadow Clone Jutsu") {
                    game.enemy.shadowCloneMultiplier = 1;
                    game.enemy.statusEffects = game.enemy.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                }
            } else {
                this.updateOutput(`${game.enemy.name} has no skills, skipping turn.`);
            }
            setTimeout(() => this.applyEffects(), 1000);
        }
    }

    applyEffects() {
        let playerMessages = this.applyStatusEffects(game.player);
        playerMessages.forEach(msg => this.updateOutput(msg));
        if (game.player.hp <= 0) {
            this.endBattle();
            return;
        }
        let enemyMessages = this.applyStatusEffects(game.enemy);
        enemyMessages.forEach(msg => this.updateOutput(msg));
        if (game.enemy.hp <= 0) {
            this.endBattle();
            return;
        }
        setTimeout(() => this.battleLoop(), 1000);
    }

    endBattle() {
        this.updateOutput(`\n--- ${game.player.hp > 0 ? "Shinobi" : game.enemy.name} wins! ---`);
        this.updateStatus();
        if (game.player.hp <= 0) {
            this.updateOutput("Game Over! You were defeated.");
            document.getElementById("controls").innerHTML = "";
            return;
        }
        game.player.regenerate();
        this.updateOutput(`Shinobi healed! (HP: ${game.player.hp}/${game.player.maxHp})`);
        if (game.battleNum === 3) {
            let rankUpMessage = this.rankUpBStyle(game.player);
            if (rankUpMessage) this.updateOutput(rankUpMessage);
        }
        setTimeout(() => this.chooseSkillCard(), 1000);
    }
}

// Start game
const startGame = debounce(function () {
    console.log("Start Game button clicked");
    alert("Starting ShinobiWay!"); // Mobile debug alert
    game.output = ["Train to become a Genin Shinobi! Collect 10 skill cards!"];
    document.getElementById("output").innerText = game.output.join("\n");
    let barrageSkill = new Skills().findSkill("Barrage");
    if (barrageSkill) {
        game.player.skills = [barrageSkill];
        console.log("Barrage skill assigned to player");
    } else {
        game.output.push("Error: Barrage skill not found!");
        document.getElementById("output").innerText = game.output.join("\n");
        console.error("Barrage skill not found");
        alert("Error: Barrage skill not found!");
        return;
    }
    setTimeout(() => new BattleScene().chooseNinjaStyles(), 1000);
});        this.requirements = requirements;
        this.skillFunction = skillFunction;
    }
}

// Mob class
class Mob {
    constructor(name, hp, maxHp, ninjaStyles, skills, statusEffects, shadowCloneMultiplier) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.ninjaStyles = ninjaStyles;
        this.skills = skills;
        this.statusEffects = statusEffects;
        this.shadowCloneMultiplier = shadowCloneMultiplier;
    }

    regenerate() {
        this.hp = this.maxHp;
        this.statusEffects = [];
        this.shadowCloneMultiplier = 1;
    }
}

// Skills class
class Skills {
    constructor() {
        this.skills = [];
        this.initializeSkills();
    }

    barrage(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Barrage"))) {
            return `${caster.name} attempts Barrage, but ${target.name} dodges!`;
        }
        let damage1 = 1;
        let damage2 = Math.floor(Math.random() * 2) + 1;
        target.hp = Math.max(0, target.hp - (damage1 + damage2));
        return `${caster.name} uses Barrage, hitting ${target.name} for ${damage1} + ${damage2} (${damage1 + damage2} total) damage!`;
    }

    demonMindJutsu(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Demon Mind Jutsu"))) {
            return `${caster.name} attempts Demon Mind Jutsu, but ${target.name} dodges!`;
        }
        let damage = 1;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Trauma", 3, 1, 0, true);
        return `${caster.name} uses Demon Mind Jutsu, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Trauma!`;
    }

    fireballJutsu(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Fireball Jutsu"))) {
            return `${caster.name} attempts Fireball Jutsu, but ${target.name} dodges!`;
        }
        let damage = 2;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Burned", 3, 1, 0, true);
        return `${caster.name} uses Fireball Jutsu, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Burned!`;
    }

    flameThrowJutsu(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Flame Throw Jutsu"))) {
            return `${caster.name} attempts Flame Throw Jutsu, but ${target.name} dodges!`;
        }
        let damage = 2;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Burned", 3, 2, 0, true);
        return `${caster.name} uses Flame Throw Jutsu, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Burned!`;
    }

    healingStance(caster, target) {
        if (target !== caster) return "";
        let gain = 1;
        caster.hp = Math.min(caster.maxHp, caster.hp + gain);
        let applied = this.addStatusEffect(caster, "Healing", 3, 0, 1, false);
        return `${caster.name} uses Healing Stance, recovering ${gain} Health (HP: ${caster.hp}/${caster.maxHp})!`;
    }

    raikiri(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Raikiri"))) {
            return `${caster.name} attempts Raikiri, but ${target.name} dodges!`;
        }
        let damage = Math.floor(Math.random() * 2) + 2;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Stunned", 1, 0, 0, false);
        return `${caster.name} uses Raikiri, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Stunned!`;
    }

    shadowCloneJutsu(caster, target) {
        if (target !== caster) return "";
        if (caster.shadowCloneMultiplier < 8) {
            caster.shadowCloneMultiplier *= 2;
        }
        let applied = this.addStatusEffect(caster, "ShadowCloneEffect", 1, 0, 0, true);
        return `${caster.name} uses Shadow Clone Jutsu, multiplying next skill by ${caster.shadowCloneMultiplier}x!`;
    }

    bite(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Bite"))) {
            return `${caster.name} attempts Bite, but ${target.name} dodges!`;
        }
        let damage = Math.floor(Math.random() * 2) + 1;
        target.hp = Math.max(0, target.hp - damage);
        return `${caster.name} uses Bite, dealing ${damage} damage to ${target.name}!`;
    }

    kawarami(caster, target) {
        if (target !== caster) return "";
        let applied = this.addStatusEffect(caster, "Kawarami", 2, 0, 0, false);
        return `${caster.name} uses Kawarami, ${applied ? "preparing" : "failing to prepare"} substitution!`;
    }

    rockBarrierJutsu(caster, target) {
        if (target !== caster) return "";
        let applied = this.addStatusEffect(caster, "Rock Barrier", 1, 0, 0, false);
        return `${caster.name} uses Rock Barrier Jutsu, ${applied ? "summoning" : "failing to summon"} a barrier!`;
    }

    impendingDoom(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Impending Doom"))) {
            return `${caster.name} attempts Impending Doom, but ${target.name} dodges!`;
        }
        let appliedStun = this.addStatusEffect(target, "Stunned", 1, 0, 0, false);
        target.statusEffects.push(new StatusEffect("Trauma", 3, 1, 0, true));
        target.statusEffects.push(new StatusEffect("Trauma", 3, 1, 0, true));
        return `${caster.name} uses Impending Doom, ${appliedStun ? "applying" : "failing to apply"} Stunned and applying 2 Trauma effects!`;
    }

    boulderCrush(caster, target) {
        if (target.hp <= 0) return "";
        if (this.checkDefense(target, this.findSkill("Boulder Crush"))) {
            return `${caster.name} attempts Boulder Crush, but ${target.name} dodges!`;
        }
        let damage = 4;
        target.hp = Math.max(0, target.hp - damage);
        let applied = this.addStatusEffect(target, "Stunned", 1, 0, 0, false);
        return `${caster.name} uses Boulder Crush, dealing ${damage} damage to ${target.name} and ${applied ? "applying" : "failing to apply"} Stunned!`;
    }

    checkDefense(target, skill) {
        if (!skill) return false;
        let kawarami = target.statusEffects.find(e => e.name === "Kawarami");
        if (kawarami && kawarami.turns > 0) {
            kawarami.turns -= 1;
            if (kawarami.turns <= 0) {
                target.statusEffects = target.statusEffects.filter(e => e !== kawarami);
            }
            return true;
        }
        if (target.shadowCloneMultiplier > 1) {
            target.shadowCloneMultiplier = 1;
            target.statusEffects = target.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
            return true;
        }
        let rockBarrier = target.statusEffects.find(e => e.name === "Rock Barrier");
        if (rockBarrier && rockBarrier.turns > 0 && !skill.attributes.includes("Illusion")) {
            rockBarrier.turns -= 1;
            if (rockBarrier.turns <= 0) {
                target.statusEffects = target.statusEffects.filter(e => e !== rockBarrier);
            }
            return true;
        }
        return false;
    }

    findSkill(name) {
        return this.skills.find(s => s.name === name) || null;
    }

    canUseSkill(player, skill) {
        if (!skill || !Object.keys(skill.requirements).length) return true;
        for (let style in skill.requirements) {
            let playerRank = player.ninjaStyles[style] || "D-Rank";
            let requiredRank = skill.requirements[style];
            if (requiredRank === "D-Rank") return true;
            if (requiredRank === "C-Rank" && ["C-Rank", "B-Rank", "A-Rank", "S-Rank"].includes(playerRank)) return true;
            if (requiredRank === "B-Rank" && ["B-Rank", "A-Rank", "S-Rank"].includes(playerRank)) return true;
            if (requiredRank === "A-Rank" && ["A-Rank", "S-Rank"].includes(playerRank)) return true;
            if (requiredRank === "S-Rank" && playerRank === "S-Rank") return true;
        }
        return false;
    }

    addStatusEffect(target, name, turns, damage, heal, isDamage) {
        if (!target.statusEffects.some(e => e.name === name)) {
            target.statusEffects.push(new StatusEffect(name, turns, damage, heal, isDamage));
            return true;
        }
        return false;
    }

    initializeSkills() {
        this.skills = [
            new BattleSkill("Barrage", [], {}, this.barrage.bind(this)),
            new BattleSkill("Demon Mind Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.demonMindJutsu.bind(this)),
            new BattleSkill("Fireball Jutsu", ["Fire"], { Fire: "C-Rank" }, this.fireballJutsu.bind(this)),
            new BattleSkill("Flame Throw Jutsu", ["Fire"], { Fire: "B-Rank" }, this.flameThrowJutsu.bind(this)),
            new BattleSkill("Healing Stance", [], {}, this.healingStance.bind(this)),
            new BattleSkill("Raikiri", ["Lightning"], { Lightning: "C-Rank" }, this.raikiri.bind(this)),
            new BattleSkill("Shadow Clone Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.shadowCloneJutsu.bind(this)),
            new BattleSkill("Bite", ["Feral"], { Feral: "C-Rank" }, this.bite.bind(this)),
            new BattleSkill("Kawarami", [], {}, this.kawarami.bind(this)),
            new BattleSkill("Rock Barrier Jutsu", ["Earth"], { Earth: "C-Rank" }, this.rockBarrierJutsu.bind(this)),
            new BattleSkill("Impending Doom", ["Illusion"], { Illusion: "B-Rank" }, this.impendingDoom.bind(this)),
            new BattleSkill("Boulder Crush", ["Earth"], { Earth: "B-Rank" }, this.boulderCrush.bind(this))
        ];
    }
}

// Battle scene
class BattleScene {
    constructor() {
        this.skills = new Skills();
        this.asciiMap = {
            Trauma: "T",
            Burned: "B",
            Healing: "H",
            Stunned: "S",
            ShadowCloneEffect: "C",
            Kawarami: "K",
            "Rock Barrier": "R"
        };
        this.chosenStyles = [];
        this.chosenSkills = [];
    }

    updateOutput(text) {
        game.output.push(text);
        document.getElementById("output").innerText = game.output.join("\n");
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    }

    updateStatus() {
        let playerEffects = game.player.statusEffects.map(e => this.asciiMap[e.name] || "").join("");
        let enemyEffects = game.enemy ? game.enemy.statusEffects.map(e => this.asciiMap[e.name] || "").join("") : "";
        document.getElementById("player-status").innerText = `Shinobi [HP: ${game.player.hp}/${game.player.maxHp}] ${playerEffects}`;
        document.getElementById("enemy-status").innerText = game.enemy ? `${game.enemy.name} [HP: ${game.enemy.hp}/${game.enemy.maxHp}] ${enemyEffects}` : "Enemy [HP: 0/0]";
        document.getElementById("skill-count").innerText = `Skill cards: ${game.player.skills.length}`;
    }

    chooseNinjaStyles() {
        game.gameState = "chooseStyles";
        let styles = ["Fire", "Lightning", "Illusion", "Earth", "Feral"].filter(s => !this.chosenStyles.includes(s));
        this.updateOutput("Choose two Ninja Styles to rank up to C-Rank:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        styles.forEach((style, index) => {
            let button = document.createElement("button");
            button.innerText = style;
            button.onclick = () => this.selectStyle(style);
            button.ontouchstart = () => this.selectStyle(style); // Mobile touch support
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    selectStyle(style) {
        if (this.chosenStyles.length < 2) {
            this.chosenStyles.push(style);
            game.player.ninjaStyles[style] = "C-Rank";
            this.updateOutput(`Shinobi trains Ninja Style ${style} to C-Rank!`);
            if (this.chosenStyles.length === 2) {
                setTimeout(() => this.chooseStartingSkills(), 1000);
            } else {
                setTimeout(() => this.chooseNinjaStyles(), 1000);
            }
        }
    }

    chooseStartingSkills() {
        game.gameState = "chooseSkills";
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s) && !this.chosenSkills.includes(s));
        this.updateOutput("\nChoose three starting skill cards:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        availableSkills.forEach((skill, index) => {
            let button = document.createElement("button");
            button.innerText = skill.name;
            button.onclick = () => this.selectSkill(skill);
            button.ontouchstart = () => this.selectSkill(skill); // Mobile touch support
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    selectSkill(skill) {
        if (this.chosenSkills.length < 3) {
            this.chosenSkills.push(skill);
            game.player.skills.push(skill);
            this.updateOutput(`Selected skill card: ${skill.name}`);
            if (this.chosenSkills.length === 3) {
                this.updateOutput(`Skill cards: ${game.player.skills.length}`);
                setTimeout(() => this.startBattle(), 1000);
            } else {
                setTimeout(() => this.chooseStartingSkills(), 1000);
            }
        }
    }

    generateEnemy() {
        let enemyName = this.battleNum <= 2 ? `Wild Dog ${this.battleNum}` : this.battleNum === 3 ? "Dummy" : "Genin";
        let hp = this.battleNum <= 3 ? 5 : 8 + this.battleNum; // Wild Dog 1, 2, and Dummy: 5 HP
        let enemy = new Mob(
            enemyName,
            hp,
            hp,
            { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" },
            [],
            [],
            1
        );
        let biteSkill = this.skills.findSkill("Bite");
        if (this.battleNum <= 2 && biteSkill) {
            enemy.skills = [biteSkill]; // Wild Dogs only use Bite
        } else {
            let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(enemy, s));
            enemy.skills = availableSkills.sort(() => Math.random() - 0.5).slice(0, Math.min(3, availableSkills.length));
        }
        if (this.battleNum > 3) {
            let style = Object.keys(enemy.ninjaStyles)[Math.floor(Math.random() * 5)];
            enemy.ninjaStyles[style] = "C-Rank";
            enemy.skills = this.skills.skills.filter(s => this.skills.canUseSkill(enemy, s)).sort(() => Math.random() - 0.5).slice(0, Math.min(3, availableSkills.length));
        }
        return enemy;
    }

    applyStatusEffects(mob) {
        let messages = [];
        let toRemove = [];
        mob.statusEffects.forEach(effect => {
            if (effect.isDamage) {
                mob.hp = Math.max(0, mob.hp - effect.damage);
                messages.push(`${mob.name} takes ${effect.damage} ${effect.name} damage! (HP: ${mob.hp}/${mob.maxHp})`);
            } else {
                mob.hp = Math.min(mob.maxHp, mob.hp + effect.heal);
                messages.push(`${mob.name} recovers ${effect.heal} Health! (HP: ${mob.hp}/${mob.maxHp})`);
            }
            effect.turns -= 1;
            if (effect.turns <= 0) {
                toRemove.push(effect);
            }
        });
        mob.statusEffects = mob.statusEffects.filter(e => !toRemove.includes(e));
        return messages;
    }

    rankUpBStyle(mob) {
        let available = Object.keys(mob.ninjaStyles).filter(k => mob.ninjaStyles[k] === "C-Rank");
        if (available.length) {
            let style = available[Math.floor(Math.random() * available.length)];
            mob.ninjaStyles[style] = "B-Rank";
            return `Shinobi ranked up Ninja Style ${style} to B-Rank!`;
        }
        return "";
    }

    chooseSkillCard() {
        game.gameState = "chooseSkillCard";
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s) && game.player.skills.filter(skill => skill.name === s.name).length < 4);
        if (!availableSkills.length) {
            this.updateOutput("No new skill cards available!");
            setTimeout(() => this.continueGame(), 1000);
            return;
        }
        let choices = availableSkills.sort(() => Math.random() - 0.5).slice(0, Math.min(3, availableSkills.length));
        this.updateOutput("\nChoose a new skill card:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        choices.forEach((skill, index) => {
            let button = document.createElement("button");
            button.innerText = skill.name;
            button.onclick = () => {
                game.player.skills = game.player.skills.filter(s => game.player.skills.filter(skill => skill.name === s.name).length < 4 || s.name !== skill.name);
                game.player.skills.push(skill);
                this.updateOutput(`Shinobi gains new skill card: ${skill.name}!`);
                if (game.player.skills.length === 10) {
                    this.updateOutput("Congratulations, Shinobi! You are a Genin Shinobi!");
                    let rankUpMessage = this.rankUpBStyle(game.player);
                    if (rankUpMessage) this.updateOutput(rankUpMessage);
                    game.enemy = this.generateEnemy();
                    game.enemy.hp = 20;
                    game.enemy.maxHp = 20;
                    game.enemy.ninjaStyles = { Fire: "C-Rank", Lightning: "C-Rank", Illusion: "C-Rank", Earth: "C-Rank", Feral: "C-Rank" };
                    game.enemy.skills = this.skills.skills.filter(s => this.skills.canUseSkill(game.enemy, s)).sort(() => Math.random() - 0.5).slice(0, 5);
                    setTimeout(() => this.startBattle(), 1000);
                } else {
                    setTimeout(() => this.continueGame(), 1000);
                }
            };
            button.ontouchstart = () => {
                game.player.skills = game.player.skills.filter(s => game.player.skills.filter(skill => skill.name === s.name).length < 4 || s.name !== skill.name);
                game.player.skills.push(skill);
                this.updateOutput(`Shinobi gains new skill card: ${skill.name}!`);
                if (game.player.skills.length === 10) {
                    this.updateOutput("Congratulations, Shinobi! You are a Genin Shinobi!");
                    let rankUpMessage = this.rankUpBStyle(game.player);
                    if (rankUpMessage) this.updateOutput(rankUpMessage);
                    game.enemy = this.generateEnemy();
                    game.enemy.hp = 20;
                    game.enemy.maxHp = 20;
                    game.enemy.ninjaStyles = { Fire: "C-Rank", Lightning: "C-Rank", Illusion: "C-Rank", Earth: "C-Rank", Feral: "C-Rank" };
                    game.enemy.skills = this.skills.skills.filter(s => this.skills.canUseSkill(game.enemy, s)).sort(() => Math.random() - 0.5).slice(0, 5);
                    setTimeout(() => this.startBattle(), 1000);
                } else {
                    setTimeout(() => this.continueGame(), 1000);
                }
            };
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    continueGame() {
        game.battleNum += 1;
        if (game.battleNum <= 4 || game.player.skills.length < 10) {
            game.enemy = this.generateEnemy();
            this.startBattle();
        } else {
            this.updateOutput("Game Complete! Collected 10 skill cards!");
            document.getElementById("controls").innerHTML = "";
        }
    }

    startBattle() {
        game.gameState = "battle";
        game.enemy = game.enemy || this.generateEnemy();
        game.enemy.regenerate();
        this.updateOutput(`\n--- Battle ${game.battleNum} ---`);
        this.updateOutput(`--- Shinobi vs ${game.enemy.name}! ---`);
        document.getElementById("controls").innerHTML = "";
        this.updateStatus();
        this.battleLoop();
    }

    battleLoop() {
        if (game.player.hp <= 0 || game.enemy.hp <= 0) {
            this.endBattle();
            return;
        }

        // Player's turn
        this.updateOutput("\n--- Shinobi's Turn ---");
        this.updateStatus();
        if (game.player.statusEffects.some(e => e.name === "Stunned")) {
            this.updateOutput("Shinobi is Stunned and skips this turn!");
            game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "Stunned");
            setTimeout(() => this.enemyTurn(), 1000);
        } else {
            let validSkills = game.player.skills.filter(s => this.skills.canUseSkill(game.player, s));
            if (validSkills.length) {
                let skill = validSkills[Math.floor(Math.random() * validSkills.length)];
                this.updateOutput(`Shinobi chooses ${skill.name}!`);
                let target = ["Healing Stance", "Shadow Clone Jutsu", "Kawarami", "Rock Barrier Jutsu"].includes(skill.name) ? game.player : game.enemy;
                let multiplier = skill.name === "Shadow Clone Jutsu" ? 1 : game.player.shadowCloneMultiplier;
                for (let i = 0; i < multiplier && game.player.hp > 0 && (target !== game.enemy || game.enemy.hp > 0); i++) {
                    let message = skill.skillFunction(game.player, target);
                    if (message) this.updateOutput(message);
                }
                if (skill.name !== "Shadow Clone Jutsu") {
                    game.player.shadowCloneMultiplier = 1;
                    game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                }
            } else {
                this.updateOutput("Shinobi has no skills, skipping turn.");
            }
            setTimeout(() => this.enemyTurn(), 1000);
        }
    }

    enemyTurn() {
        if (game.player.hp <= 0 || game.enemy.hp <= 0) {
            this.endBattle();
            return;
        }

        this.updateOutput(`\n--- ${game.enemy.name}'s Turn ---`);
        this.updateStatus();
        if (game.enemy.statusEffects.some(e => e.name === "Stunned")) {
            this.updateOutput(`${game.enemy.name} is Stunned and skips this turn!`);
            game.enemy.statusEffects = game.enemy.statusEffects.filter(e => e.name !== "Stunned");
            setTimeout(() => this.applyEffects(), 1000);
        } else {
            let skill = game.enemy.skills.length ? game.enemy.skills[Math.floor(Math.random() * game.enemy.skills.length)] : null;
            if (skill) {
                this.updateOutput(`${game.enemy.name} chooses ${skill.name}!`);
                let target = ["Healing Stance", "Shadow Clone Jutsu", "Kawarami", "Rock Barrier Jutsu"].includes(skill.name) ? game.enemy : game.player;
                let multiplier = skill.name === "Shadow Clone Jutsu" ? 1 : game.enemy.shadowCloneMultiplier;
                for (let i = 0; i < multiplier && game.enemy.hp > 0 && (target !== game.player || game.player.hp > 0); i++) {
                    let message = skill.skillFunction(game.enemy, target);
                    if (message) this.updateOutput(message);
                }
                if (skill.name !== "Shadow Clone Jutsu") {
                    game.enemy.shadowCloneMultiplier = 1;
                    game.enemy.statusEffects = game.engine.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                }
            } else {
                this.updateOutput(`${game.enemy.name} has no skills, skipping turn.`);
            }
            setTimeout(() => this.applyEffects(), 1000);
        }
    }

    applyEffects() {
        let playerMessages = this.applyStatusEffects(game.player);
        playerMessages.forEach(msg => this.updateOutput(msg));
        if (game.player.hp <= 0) {
            this.endBattle();
            return;
        }
        let enemyMessages = this.applyStatusEffects(game.enemy);
        enemyMessages.forEach(msg => this.updateOutput(msg));
        if (game.enemy.hp <= 0) {
            this.endBattle();
            return;
        }
        setTimeout(() => this.battleLoop(), 1000);
    }

    endBattle() {
        this.updateOutput(`\n--- ${game.player.hp > 0 ? "Shinobi" : game.enemy.name} wins! ---`);
        this.updateStatus();
        if (game.player.hp <= 0) {
            this.updateOutput("Game Over! You were defeated.");
            document.getElementById("controls").innerHTML = "";
            return;
        }
        game.player.regenerate();
        this.updateOutput(`Shinobi healed! (HP: ${game.player.hp}/${game.player.maxHp})`);
        if (game.battleNum === 3) {
            let rankUpMessage = this.rankUpBStyle(game.player);
            if (rankUpMessage) this.updateOutput(rankUpMessage);
        }
        setTimeout(() => this.chooseSkillCard(), 1000);
    }
}

// Start game
function startGame() {
    console.log("Start Game button clicked");
    alert("Starting ShinobiWay!"); // Mobile debug alert
    game.output = ["Train to become a Genin Shinobi! Collect 10 skill cards!"];
    document.getElementById("output").innerText = game.output.join("\n");
    let barrageSkill = new Skills().findSkill("Barrage");
    if (barrageSkill) {
        game.player.skills = [barrageSkill];
        console.log("Barrage skill assigned to player");
    } else {
        game.output.push("Error: Barrage skill not found!");
        document.getElementById("output").innerText = game.output.join("\n");
        console.error("Barrage skill not found");
        alert("Error: Barrage skill not found!");
        return;
    }
    setTimeout(() => new BattleScene().chooseNinjaStyles(), 1000);
}
