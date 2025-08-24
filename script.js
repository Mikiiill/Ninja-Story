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
    constructor(name, turns, damage, heal, is_damage) {
        this.name = name;
        this.turns = turns;
        this.damage = damage;
        this.heal = heal;
        this.is_damage = is_damage;
    }
}

class BattleSkill {
    constructor(name, attributes, requirements, skill_function, support) {
        this.name = name;
        this.attributes = attributes;
        this.requirements = requirements;
        this.skill_function = skill_function;
        this.support = support;
    }
}

class Mob {
    constructor(name, hp, maxHp, ninja_styles, skills, status_effects, shadow_clone_multiplier) {
        this.name = name;
        this.hp = hp;
        this.max_hp = max_hp;
        this.ninja_styles = ninja_styles;
        this.skills = skills;
        this.status_effects = status_effects;
        this.shadow_clone_multiplier = shadow_clone_multiplier;
    }

    regenerate() {
        this.hp = this.max_hp;
        this.status_effects = [];
        this.shadow_clone_multiplier = 1;
    }
}

class Skills {
    constructor() {
        this.skills = [];
        this.initialize_skills();
    }

    barrage(caster, target) {
        if (target.hp <= 0) return;
        if (this.check_defense(target, this.find_skill("Barrage"))) {
            console.log("忍 attempts Barrage, but 敵 dodges!");
            return;
        }
        let damage1 = 1;
        let damage2 = random.randint(1, 2);
        target.hp = max(0, target.hp - (damage1 + damage2));
        console.log(`忍 uses Barrage, hitting 敵 for ${damage1} + ${damage2} (${damage1 + damage2} total) damage!`);
    }

    demon_mind_jutsu(caster, target) {
        if (target.hp <= 0) return;
        if (this.check_defense(target, this.find_skill("Demon Mind Jutsu"))) {
            console.log("忍 attempts Demon Mind Jutsu, but 敵 dodges!");
            return;
        }
        let damage = 1;
        target.hp = max(0, target.hp - damage);
        let applied = this.add_status_effect(target, "Trauma", 3, 1, 0, true);
        console.log(`忍 uses Demon Mind Jutsu, dealing ${damage} damage to 敵 and ${applied ? "applying" : "failing to apply"} Trauma!`);
    }

    fireball_jutsu(caster, target) {
        if (target.hp <= 0) return;
        if (this.check_defense(target, this.find_skill("Fireball Jutsu"))) {
            console.log("忍 attempts Fireball Jutsu, but 敵 dodges!");
            return;
        }
        let damage = 2;
        target.hp = max(0, target.hp - damage);
        let applied = this.add_status_effect(target, "Burned", 3, 1, 0, true);
        console.log(`忍 uses Fireball Jutsu, dealing ${damage} damage to 敵 and ${applied ? "applying" : "failing to apply"} Burned!`);
    }

    flame_throw_jutsu(caster, target) {
        if (target.hp <= 0) return;
        if (this.check_defense(target, this.find_skill("Flame Throw Jutsu"))) {
            console.log("忍 attempts Flame Throw Jutsu, but 敵 dodges!");
            return;
        }
        let damage = 2;
        target.hp = max(0, target.hp - damage);
        let applied = this.add_status_effect(target, "Burned", 3, 2, 0, true);
        console.log(`忍 uses Flame Throw Jutsu, dealing ${damage} damage to 敵 and ${applied ? "applying" : "failing to apply"} Burned!`);
    }

    healing_stance(caster, target) {
        if (target !== caster) return;
        let gain = 1;
        caster.hp = min(caster.max_hp, caster.hp + gain);
        let applied = this.add_status_effect(caster, "Healing", 3, 0, 1, false);
        console.log(`忍 uses Healing Stance, recovering ${gain} Health (HP: ${caster.hp}/${caster.max_hp})!`);
    }

    raikiri(caster, target) {
        if (target.hp <= 0) return;
        if (this.check_defense(target, this.find_skill("Raikiri"))) {
            console.log("忍 attempts Raikiri, but 敵 dodges!");
            return;
        }
        let damage = random.randint(2, 3);
        target.hp = max(0, target.hp - damage);
        let applied = this.add_status_effect(target, "Stunned", 1, 0, 0, false);
        console.log(`忍 uses Raikiri, dealing ${damage} damage to 敵 and ${applied ? "applying" : "failing to apply"} Stunned!`);
    }

    shadow_clone_jutsu(caster, target) {
        if (target !== caster) return;
        if (caster.shadow_clone_multiplier < 8) {
            caster.shadow_clone_multiplier *= 2;
        }
        let applied = this.add_status_effect(caster, "ShadowCloneEffect", 1, 0, 0, true);
        console.log(`忍 uses Shadow Clone Jutsu, multiplying next skill by ${caster.shadow_clone_multiplier}x!`);
    }

    bite(caster, target) {
        if (target.hp <= 0) return;
        if (this.check_defense(target, this.find_skill("Bite"))) {
            console.log("忍 attempts Bite, but 敵 dodges!");
            return;
        }
        let damage = random.randint(1, 2);
        target.hp = max(0, target.hp - damage);
        console.log(`忍 uses Bite, dealing ${damage} damage to 敵!`);
    }

    kawarami(caster, target) {
        if (target !== caster) return;
        let applied = this.add_status_effect(caster, "Kawarami", 2, 0, 0, false);
        console.log(`忍 uses Kawarami, ${applied ? "preparing" : "failing to prepare"} substitution!`);
    }

    rock_barrier_jutsu(caster, target) {
        if (target !== caster) return;
        let applied = this.add_status_effect(caster, "Rock Barrier", 1, 0, 0, false);
        console.log(`忍 uses Rock Barrier Jutsu, ${applied ? "summoning" : "failing to summon"} a barrier!`);
    }

    impending_doom(caster, target) {
        if (target.hp <= 0) return;
        if (this.check_defense(target, this.find_skill("Impending Doom"))) {
            console.log("忍 attempts Impending Doom, but 敵 dodges!");
            return;
        }
        let applied_stun = this.add_status_effect(target, "Stunned", 1, 0, 0, false);
        for (let i = 0; i < 2; i++) {
            target.status_effects.push(new StatusEffect("Trauma", 3, 1, 0, true));
        }
        console.log(`忍 uses Impending Doom, ${applied_stun ? "applying" : "failing to apply"} Stunned and applying 2 Trauma effects!`);
    }

    boulder_crush(caster, target) {
        if (target.hp <= 0) return;
        if (this.check_defense(target, this.find_skill("Boulder Crush"))) {
            console.log("忍 attempts Boulder Crush, but 敵 dodges!");
            return;
        }
        let damage = 4;
        target.hp = max(0, target.hp - damage);
        let applied = this.add_status_effect(target, "Stunned", 1, 0, 0, false);
        console.log(`忍 uses Boulder Crush, dealing ${damage} damage to 敵 and ${applied ? "applying" : "failing to apply"} Stunned!`);
    }

    check_defense(target, skill) {
        if (!skill) return false;
        let kawarami = target.status_effects.find(e => e.name === "Kawarami");
        if (kawarami && kawarami.turns > 0) {
            console.log("敵 dodges with Kawarami!");
            kawarami.turns -= 1;
            if (kawarami.turns <= 0) {
                target.status_effects = target.status_effects.filter(e => e !== kawarami);
            }
            return true;
        }
        if (target.shadow_clone_multiplier > 1) {
            console.log("敵 sacrifices shadow clones to dodge!");
            target.shadow_clone_multiplier = 1;
            target.status_effects = target.status_effects.filter(e => e.name !== "ShadowCloneEffect");
            return true;
        }
        let rock_barrier = target.status_effects.find(e => e.name === "Rock Barrier");
        if (rock_barrier && rock_barrier.turns > 0 && !skill.attributes.includes("Illusion")) {
            console.log("敵 blocks with Rock Barrier!");
            rock_barrier.turns -= 1;
            if (rock_barrier.turns <= 0) {
                target.status_effects = target.status_effects.filter(e => e !== rock_barrier);
            }
            return true;
        }
        return false;
    }

    find_skill(name) {
        return this.skills.find(s => s.name === name) || null;
    }

    can_use_skill(player, skill) {
        if (!skill || !Object.keys(skill.requirements).length) return true;
        for (let style in skill.requirements) {
            let player_rank = player.ninja_styles[style] || "D-Rank";
            let required_rank = skill.requirements[style];
            if (required_rank === "D-Rank") return true;
            if (required_rank === "C-Rank" && ["C-Rank", "B-Rank", "A-Rank", "S-Rank"].includes(player_rank)) return true;
            if (required_rank === "B-Rank" && ["B-Rank", "A-Rank", "S-Rank"].includes(player_rank)) return true;
            if (required_rank === "A-Rank" && ["A-Rank", "S-Rank"].includes(player_rank)) return true;
            if (required_rank === "S-Rank" && player_rank === "S-Rank") return true;
        }
        return false;
    }

    add_status_effect(target, name, turns, damage, heal, is_damage) {
        if (!target.status_effects.some(e => e.name === name)) {
            target.status_effects.push(new StatusEffect(name, turns, damage, heal, is_damage));
            return true;
        }
        return false;
    }

    initialize_skills() {
        this.skills = [
            new BattleSkill("Barrage", [], {}, this.barrage.bind(this), false),
            new BattleSkill("Demon Mind Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.demonMindJutsu.bind(this), false),
            new BattleSkill("Fireball Jutsu", ["Fire"], { Fire: "C-Rank" }, this.fireballJutsu.bind(this), false),
            new BattleSkill("Flame Throw Jutsu", ["Fire"], { Fire: "B-Rank" }, this.flameThrowJutsu.bind(this), false),
            new BattleSkill("Healing Stance", [], {}, this.healingStance.bind(this), true),
            new BattleSkill("Raikiri", ["Lightning"], { Lightning: "C-Rank" }, this.raikiri.bind(this), false),
            new BattleSkill("Shadow Clone Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.shadowCloneJutsu.bind(this), true),
            new BattleSkill("Bite", ["Feral"], { Feral: "C-Rank" }, this.bite.bind(this), false),
            new BattleSkill("Kawarami", [], {}, this.kawarami.bind(this), true),
            new BattleSkill("Rock Barrier Jutsu", ["Earth"], { Earth: "C-Rank" }, this.rockBarrierJutsu.bind(this), true),
            new BattleSkill("Impending Doom", ["Illusion"], { Illusion: "B-Rank" }, this.impendingDoom.bind(this), false),
            new BattleSkill("Boulder Crush", ["Earth"], { Earth: "B-Rank" }, this.boulderCrush.bind(this), false)
        ];
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
            Kawarami: "🪵",
            "Rock Barrier": "🪨"
        };
        this.chosenStyles = [];
        this.chosenSkills = [];
    }

    updateOutput(text) {
        game.output.push(text);
        document.getElementById("output").innerHTML = game.output.join("<br>");
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    }

    updateStatus() {
        let playerEffects = [...new Set(game.player.statusEffects.map(e => e.name))].map(name => `<span class="status-${name.toLowerCase().replace(" ", "")}">${this.asciiMap[name] || ""}</span>`).join("");
        let enemyEffects = game.enemy ? [...new Set(game.enemy.statusEffects.map(e => e.name))].map(name => `<span class="status-${name.toLowerCase().replace(" ", "")}">${this.asciiMap[name] || ""}</span>`).join("") : "";
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
            button.setAttribute("onclick", `selectStyle('${style}')`);
            controls.appendChild(button);
        });
        this.updateStatus();
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
            button.setAttribute("onclick", `selectSkill('${skill.name}')`);
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    chooseRankUpStyle() {
        game.gameState = "chooseRankUpStyle";
        let upgradableStyles = Object.keys(game.player.ninjaStyles).filter(style => this.rankUpStages[game.player.ninjaStyles[style]]);
        if (upgradableStyles.length > 0) {
            this.updateOutput("You are a Genin Shinobi! Choose one Ninja Style to rank up:");
            let controls = document.getElementById("controls");
            controls.innerHTML = "";
            upgradableStyles.forEach((style) => {
                let button = document.createElement("button");
                button.innerText = style;
                button.className = style.toLowerCase();
                button.setAttribute("onclick", `selectRankUpStyle('${style}')`);
                controls.appendChild(button);
            });
            this.updateStatus();
        } else {
            this.updateOutput("No styles to rank up!");
            setTimeout(() => this.continueGame(), 1000);
        }
    }

    rankUpStages = {
        "D-Rank": "C-Rank",
        "C-Rank": "B-Rank",
        "B-Rank": "A-Rank",
        "A-Rank": "S-Rank"
    };

    startBattle() {
        game.enemy = this.generateEnemy();
        game.enemy.hp = 10;
        game.enemy.maxHp = 10;
        game.enemy.ninjaStyles = { Fire: "C-Rank", Lightning: "C-Rank", Illusion: "C-Rank", Earth: "C-Rank", Feral: "C-Rank" };
        game.enemy.skills = this.generateEnemySkills(game.enemy);
        this.updateOutput(`\nBattle ${game.battleNum}: <span class="output-text-player">${game.player.name}</span> vs. <span class="output-text-enemy">${game.enemy.name}</span>!`);
        setTimeout(() => this.playerTurn(), 1000);
    }

    generateEnemy() {
        let names = game.player.skills.length < 10 ? ["Wild Dog", "Dummy"] : ["Illusionist Genin", "Fire Genin", "Lightning Genin", "Earth Genin", "Feral Genin"];
        let name = names[Math.floor(Math.random() * names.length)];
        return new Mob(name, 0, 0, {}, [], []);
    }

    generateEnemySkills(enemy) {
        if (enemy.name === "Wild Dog") {
            return [this.skills.findSkill("Bite")];
        } else if (enemy.name === "Dummy") {
            return [this.skills.findSkill("Healing Stance")];
        } else {
            let style = enemy.name.split(" ")[0].toLowerCase();
            if (style === "illusionist") style = "illusion";
            return this.skills.skills.filter(s => s.attributes.includes(style.charAt(0).toUpperCase() + style.slice(1)) && this.skills.canUseSkill(enemy, s)).sort(() => Math.random() - 0.5).slice(0, 5);
        }
    }

    applyStatusEffects(mob, scene) {
        let damage_total = 0;
        let heal_total = 0;
        let newEffects = [];
        mob.status_effects.forEach(effect => {
            if (effect.is_damage) {
                damage_total += effect.damage;
            } else {
                heal_total += effect.heal;
            }
            effect.turns -= 1;
            if (effect.turns > 0) {
                newEffects.push(effect);
            } else {
                if (effect.name === "ShadowCloneEffect") mob.shadow_clone_multiplier = 1;
            }
        });
        if (damage_total > 0) {
            mob.hp = Math.max(0, Math.min(10, mob.hp - damage_total));
            scene.updateOutput(`<span class="output-text-${mob === game.player ? 'player' : 'enemy'}">${mob.name}</span> takes ${damage_total} damage from status effects!`);
        }
        if (heal_total > 0) {
            mob.hp = Math.max(0, Math.min(10, mob.hp + heal_total));
            scene.updateOutput(`<span class="output-text-${mob === game.player ? 'player' : 'enemy'}">${mob.name}</span> heals ${heal_total} HP from status effects!`);
        }
        mob.status_effects = newEffects;
    }

    playerTurn() {
        this.applyStatusEffects(game.player, this);
        if (game.player.hp <= 0) {
            this.updateOutput("Shinobi has been defeated! Game Over!");
            document.getElementById("controls").innerHTML = `<button class="start-button" onclick="startGame()">Restart Game</button>`;
            return;
        }
        if (game.enemy && game.enemy.hp > 0) {
            let stunned = game.player.statusEffects.some(e => e.name === "Stunned");
            if (!stunned) {
                let skill = game.player.skills[Math.floor(Math.random() * game.player.skills.length)];
                if (skill.name === "Shadow Clone Jutsu") {
                    this.shadowCloneJutsu(game.player, game.player, this);
                    let nextSkill = game.player.skills.filter(s => s.name !== "Shadow Clone Jutsu")[Math.floor(Math.random() * (game.player.skills.length - 1))];
                    if (nextSkill) {
                        for (let i = 0; i < game.player.shadowCloneMultiplier; i++) {
                            setTimeout(() => {
                                let blocked = this.checkTargetedEffects(game.enemy, nextSkill, game.player, this);
                                if (blocked) return;
                                let death = nextSkill.skill_function(game.player, game.enemy, this);
                                this.updateStatus();
                                if (death) {
                                    this.endBattle();
                                }
                            }, 1000 * (i + 1));
                        }
                        setTimeout(() => this.enemyTurn(), 1000 * (game.player.shadowCloneMultiplier + 1));
                    } else {
                        setTimeout(() => this.enemyTurn(), 1000);
                    }
                } else {
                    for (let i = 0; i < game.player.shadowCloneMultiplier; i++) {
                        setTimeout(() => {
                            let blocked = this.checkTargetedEffects(game.enemy, skill, game.player, this);
                            if (blocked) return;
                            let death = skill.skill_function(game.player, game.enemy, this);
                            this.updateStatus();
                            if (death) {
                                this.endBattle();
                            }
                        }, 1000 * (i + 1));
                    }
                    setTimeout(() => this.enemyTurn(), 1000 * (game.player.shadowCloneMultiplier + 1));
                }
            } else {
                this.updateOutput(`<span class="output-text-player">${game.player.name}</span> is <span class="status-stunned">Stunned ⚡️</span> and cannot act!`);
                game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "Stunned");
                setTimeout(() => this.enemyTurn(), 1000);
            }
        } else {
            setTimeout(() => this.endBattle(), 1000);
        }
        this.updateStatus();
    }

    enemyTurn() {
        this.updateOutput(`--- ${game.enemy.name}'s Turn ---`);
        this.applyStatusEffects(game.enemy, this);
        if (game.enemy.hp <= 0) {
            setTimeout(() => this.endBattle(), 1000);
            return;
        }
        let kawarami = game.player.statusEffects.some(e => e.name === "Kawarami");
        if (kawarami) {
            this.updateOutput(`<span class="output-text-player">${game.player.name}</span> uses <span class="status-kawarami">Kawarami 🪵</span> to evade! POOF!`);
            game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "Kawarami");
            setTimeout(() => this.playerTurn(), 1000);
            return;
        }
        let rock_barrier = game.player.status_effects.some(e => e.name === "Rock Barrier");
        let stunned = game.enemy.statusEffects.some(e => e.name === "Stunned");
        if (!stunned) {
            let skill = game.enemy.skills[Math.floor(Math.random() * game.enemy.skills.length)];
            let blocked = this.checkTargetedEffects(game.player, skill, game.enemy, this);
            if (blocked) return;
            let death = skill.skillFunction(game.enemy, game.player, this);
            if (death) {
                setTimeout(() => this.endBattle(), 1000);
                return;
            }
            setTimeout(() => this.playerTurn(), 1000);
        } else {
            this.updateOutput(`<span class="output-text-enemy">${game.enemy.name}</span> is <span class="status-stunned">Stunned ⚡️</span> and cannot act!`);
            game.enemy.statusEffects = game.enemy.statusEffects.filter(e => e.name !== "Stunned");
            setTimeout(() => this.playerTurn(), 1000);
        }
    }

    checkTargetedEffects(target, skill, user, scene) {
        let rock_barrier = target.statusEffects.find(e => e.name === "Rock Barrier");
        if (rock_barrier && rock_barrier.duration > 0 && !skill.support && !skill.attributes.includes("Illusion")) {
            scene.updateOutput(`<span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> blocks with <span class="status-rockbarrier">Rock Barrier 🪨</span>!`);
            rock_barrier.duration -= 1;
            if (rock_barrier.duration <= 0) {
                target.statusEffects = target.statusEffects.filter(e => e !== rock_barrier);
            }
            return true;
        }
        let kawarami = target.statusEffects.find(e => e.name === "Kawarami");
        if (kawarami && kawarami.duration > 0 && !skill.support) {
            scene.updateOutput(`<span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> uses <span class="status-kawarami">Kawarami 🪵</span> to dodge! POOF!`);
            kawarami.duration -= 1;
            if (kawarami.duration <= 0) {
                target.statusEffects = target.statusEffects.filter(e => e !== kawarami);
            }
            return true;
        }
        return false;
    }

    endBattle() {
        if (game.player.hp <= 0) {
            this.updateOutput("Shinobi has been defeated! Game Over!");
            document.getElementById("controls").innerHTML = `<button class="start-button" onclick="startGame()">Restart Game</button>`;
            return;
        }
        this.updateOutput(`<span class="output-text-enemy">${game.enemy.name}</span> has been defeated!`);
        game.battleNum++;
        game.enemy = null;
        if (game.player.skills.length >= 10 && game.gameState !== "rankedUp") {
            setTimeout(() => {
                this.updateOutput("Congratulations, Shinobi! You are a Genin Shinobi!");
                setTimeout(() => this.chooseRankUpStyle(), 1000);
            }, 1000);
        } else {
            setTimeout(() => this.chooseSkillCard(), 1000);
        }
    }

    chooseSkillCard() {
        game.gameState = "chooseSkillCard";
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s));
        if (!availableSkills.length) {
            this.updateOutput("No new skill cards available!");
            setTimeout(() => this.continueGame(), 1000);
            return;
        }
        let choices = availableSkills.sort(() => Math.random() - 0.5).slice(0, 3); // 3 random skills, allow duplicates
        this.updateOutput("\nChoose a new skill card:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        choices.forEach((skill) => {
            let button = document.createElement("button");
            button.innerText = skill.name;
            button.className = skill.style;
            button.setAttribute("onclick", `selectSkillCard('${skill.name}')`);
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    continueGame() {
        game.enemy = this.generateEnemy();
        game.enemy.hp = 10;
        game.enemy.maxHp = 10;
        game.enemy.ninjaStyles = { Fire: "C-Rank", Lightning: "C-Rank", Illusion: "C-Rank", Earth: "C-Rank", Feral: "C-Rank" };
        game.enemy.skills = this.generateEnemySkills(game.enemy);
        this.updateOutput(`\nBattle ${game.battleNum}: <span class="output-text-player">${game.player.name}</span> vs. <span class="output-text-enemy">${game.enemy.name}</span>!`);
        setTimeout(() => this.playerTurn(), 1000);
        this.updateStatus();
    }
}

let lastClickTime = 0;
function startGame() {
    let now = Date.now();
    if (now - lastClickTime < 1000) return;
    lastClickTime = now;
    alert("Starting ShinobiWay!");
    game.output = ["Train to become a Genin Shinobi! Collect 10 skill cards!"];
    game.player.hp = 10;
    game.player.maxHp = 10;
    game.player.skills = [];
    game.player.statusEffects = [];
    game.player.shadowCloneMultiplier = 1;
    game.battleNum = 1;
    game.enemy = null;
    game.gameState = "start";
    document.getElementById("output").innerHTML = game.output.join("<br>");
    let barrageSkill = new Skills().findSkill("Barrage");
    if (barrageSkill) {
        game.player.skills = [barrageSkill];
    } else {
        game.output.push("Error: Barrage skill not found!");
        document.getElementById("output").innerHTML = game.output.join("<br>");
        alert("Error: Barrage skill not found!");
        return;
    }
    game.battleScene = new BattleScene();
    setTimeout(() => game.battleScene.chooseNinjaStyles(), 1000);
}

function selectStyle(style) {
    let now = Date.now();
    if (now - lastClickTime < 1000) return;
    lastClickTime = now;
    if (game.battleScene.chosenStyles.length < 2) {
        game.battleScene.chosenStyles.push(style);
        game.player.ninjaStyles[style] = "C-Rank";
        game.battleScene.updateOutput(`Shinobi trains Ninja Style <span class="output-text-${style.toLowerCase()}">${style}</span> to C-Rank!`);
        document.getElementById("controls").innerHTML = "";
        if (game.battleScene.chosenStyles.length === 2) {
            setTimeout(() => game.battleScene.chooseStartingSkills(), 1000);
        } else {
            setTimeout(() => game.battleScene.chooseNinjaStyles(), 1000);
        }
    }
}

function selectSkill(skillName) {
    let now = Date.now();
    if (now - lastClickTime < 1000) return;
    lastClickTime = now;
    let skill = game.battleScene.skills.findSkill(skillName);
    if (game.battleScene.chosenSkills.length < 3) {
        game.battleScene.chosenSkills.push(skill);
        game.player.skills.push(skill);
        game.battleScene.updateOutput(`Selected skill card: <span class="output-text-${skill.style}">${skill.name}</span>`);
        document.getElementById("controls").innerHTML = "";
        if (game.battleScene.chosenSkills.length === 3) {
            game.battleScene.updateOutput(`Skill cards: ${game.player.skills.length}`);
            setTimeout(() => game.battleScene.startBattle(), 1000);
        } else {
            setTimeout(() => game.battleScene.chooseStartingSkills(), 1000);
        }
    }
}

function selectSkillCard(skillName) {
    let now = Date.now();
    if (now - lastClickTime < 1000) return;
    lastClickTime = now;
    let skill = game.battleScene.skills.findSkill(skillName);
    game.player.skills = game.player.skills.filter(s => game.player.skills.filter(skill => skill.name === s.name).length < 4 || s.name !== skill.name);
    game.player.skills.push(skill);
    game.battleScene.updateOutput(`Shinobi gains new skill card: <span class="output-text-${skill.style}">${skill.name}</span>!`);
    document.getElementById("controls").innerHTML = "";
    if (game.player.skills.length >= 10 && game.gameState !== "rankedUp") {
        setTimeout(() => {
            game.battleScene.updateOutput("Congratulations, Shinobi! You are a Genin Shinobi!");
            setTimeout(() => game.battleScene.chooseRankUpStyle(), 1000);
        }, 1000);
    } else {
        setTimeout(() => game.battleScene.chooseSkillCard(), 1000);
    }
}

function selectRankUpStyle(style) {
    let now = Date.now();
    if (now - lastClickTime < 1000) return;
    lastClickTime = now;
    game.player.ninjaStyles[style] = "B-Rank";
    game.battleScene.updateOutput(`Shinobi ranks up <span class="output-text-${style.toLowerCase()}">${style}</span> to B-Rank!`);
    document.getElementById("controls").innerHTML = "";
    game.gameState = "rankedUp";
    setTimeout(() => game.battleScene.chooseSkillCard(), 1000);
    }
