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
            new BattleSkill("Raikiri", ["Lightning"], { Lightning: "C-Rank" }, this.raikiri.bind(this), "lightning", false),
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
        let heal = 1;
        user.hp = Math.max(0, Math.min(10, user.hp + heal));
        user.statusEffects.push(new StatusEffect("Healing", 3));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> enters <span class="output-text-neutral">Healing Stance</span>, healing ${heal} HP <span class="status-healing">🌿</span>!`);
        return true;
    }

    raikiri(user, target, scene) {
        let damage = Math.round(Math.random() * 4) + 4;
        target.hp = Math.max(0, Math.min(10, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Stunned", 1));
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-lightning">Raikiri</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-stunned">Stunned ⚡️</span>!`);
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
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-feral">Wild Dog Bite</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-bleed">Bleed 🩸</span>!`);
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
        let enemySprite = game.enemy && game.enemy.sprite ? `<img src="${game.enemy.sprite}" class="sprite" alt="${game.enemy.name} Sprite">` : "";
        document.getElementById("player-status").innerHTML = `${playerSprite} Shinobi [HP: <span class="player-hp">${game.player.hp}/${game.player.maxHp}</span>] ${playerEffects}`;
        document.getElementById("enemy-status").innerHTML = game.enemy ? `${enemySprite} ${game.enemy.name} [HP: <span class="enemy-hp">${game.enemy.hp}/${game.enemy.maxHp}</span>] ${enemyEffects}` : "Enemy [HP: <span class='enemy-hp'>0/0</span>]";
        document.getElementById("skill-count").innerText = `Skill cards: ${game.player.skills.length}`;
    }

    chooseNinjaStyles() {
        game.gameState = "chooseStyles";
        let styles = ["Fire", "Lightning", "Illusion", "Earth", "Feral"].filter(s => !this.chosenStyles.includes(s));
        this.queueOutput("Choose two Ninja Styles to rank up to C-Rank:");
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
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s));
        this.queueOutput("\nChoose three starting skill cards:");
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
        if (game.gameState === "rankedUp" || game.player.Rank !== "Student") {
            this.chooseSkillCard();
            return;
        }
        game.gameState = "chooseRankUpStyle";
        let upgradableStyles = Object.keys(game.player.ninjaStyles).filter(style => this.rankUpStages[game.player.ninjaStyles[style]]);
        if (upgradableStyles.length > 0) {
            this.queueOutput("You are ready to become a Genin Shinobi! Choose one Ninja Style to rank up:");
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
            this.queueOutput("No styles to rank up!");
            setTimeout(() => this.chooseSkillCard(), 1000);
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
        this.queueOutput(`\nBattle ${game.battleNum}: <span class="output-text-player">${game.player.name}</span> vs. <span class="output-text-enemy">${game.enemy.name}</span>!`);
        setTimeout(() => this.playerTurn(), 1000);
    }

    generateEnemy() {
        let names = game.player.skills.length < 10 ? ["Wild Dog", "Training Dummy"] : ["Illusionist Genin", "Fire Genin", "Lightning Genin", "Earth Genin", "Feral Genin"];
        let name = names[Math.floor(Math.random() * names.length)];
        let sprite;
        let rank = game.player.skills.length < 10 ? "Basic" : "Genin";
        switch (name) {
            case "Wild Dog": sprite = "images/wild_dog.png"; break;
            case "Training Dummy": sprite = "images/training_dummy.png"; break;
            case "Illusionist Genin": sprite = "images/illusionist_genin.png"; break;
            case "Fire Genin": sprite = "images/fire_genin.png"; break;
            case "Lightning Genin": sprite = "images/lightning_genin.png"; break;
            case "Earth Genin": sprite = "images/earth_genin.png"; break;
            case "Feral Genin": sprite = "images/feral_genin.png"; break;
            default: sprite = "";
        }
        return new Mob(name, 0, 0, rank, {}, [], [], sprite);
    }

    generateEnemySkills(enemy) {
        if (enemy.name === "Wild Dog") {
            return [this.skills.findSkill("Bite")];
        } else if (enemy.name === "Training Dummy") {
            return [this.skills.findSkill("Healing Stance")];
        } else {
            let style = enemy.name.split(" ")[0].toLowerCase();
            if (style === "illusionist") style = "illusion";
            return this.skills.skills.filter(s => s.attributes.includes(style.charAt(0).toUpperCase() + style.slice(1)) && this.skills.canUseSkill(enemy, s)).sort(() => Math.random() - 0.5).slice(0, 5);
        }
    }

    applyStatusEffects(mob, scene) {
        let newEffects = [];
        let damageEffects = mob.statusEffects.filter(e => !e.new && (e.name === "Burned" || e.name === "Bleed" || e.name === "Doom"));
        let totalDamage = 0;
        damageEffects.forEach(effect => {
            if (effect.name === "Burned") totalDamage += 2;
            if (effect.name === "Bleed") totalDamage += 1;
            if (effect.name === "Doom") totalDamage += 3;
        });
        if (totalDamage > 0) {
            mob.hp = Math.max(0, Math.min(10, mob.hp - totalDamage));
            scene.queueOutput(`<span class="output-text-${mob === game.player ? 'player' : 'enemy'}">${mob.name}</span> takes ${totalDamage} damage from status effects!`);
        }
        let healingEffects = mob.statusEffects.filter(e => !e.new && e.name === "Healing");
        let totalHeal = 0;
        healingEffects.forEach(effect => {
            totalHeal += 1;
        });
        if (totalHeal > 0) {
            mob.hp = Math.max(0, Math.min(10, mob.hp + totalHeal));
            scene.queueOutput(`<span class="output-text-${mob === game.player ? 'player' : 'enemy'}">${mob.name}</span> heals ${totalHeal} HP from <span class="status-healing">Healing 🌿</span>!`);
        }
        mob.statusEffects.forEach(effect => {
            if (!effect.new) {
                effect.duration--;
                if (effect.duration > 0 || ["ShadowCloneEffect", "Substitution", "Rock Barrier"].includes(effect.name)) {
                    newEffects.push(effect);
                } else {
                    scene.queueOutput(`<span class="output-text-${mob === game.player ? 'player' : 'enemy'}">${mob.name}</span>'s <span class="status-${effect.name.toLowerCase().replace(" ", "")}">${effect.name} ${this.asciiMap[effect.name]}</span> wears off!`);
                }
            } else {
                effect.new = false;
                newEffects.push(effect);
            }
        });
        mob.statusEffects = newEffects;
        if (mob.hp <= 0) {
            setTimeout(() => scene.endBattle(), 1000);
            return true;
        }
        return false;
    }

    checkTargetedEffects(skill, user, target, scene) {
        let rockBarrier = target.statusEffects.some(e => e.name === "Rock Barrier");
        if (rockBarrier && !skill.support && !skill.attributes.includes("Illusion")) {
            target.statusEffects = target.statusEffects.filter(e => e.name !== "Rock Barrier");
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-${skill.style}">${skill.name}</span>!`);
            scene.queueOutput(`<span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>'s <span class="status-rockbarrier">Rock Barrier 🪨</span> blocks the attack! The rock barrier cracks in half!`);
            return true;
        }
        let substitution = target.statusEffects.some(e => e.name === "Substitution");
        if (substitution && !skill.support) {
            target.statusEffects = target.statusEffects.filter(e => e.name === "Substitution");
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-${skill.style}">${skill.name}</span>!`);
            scene.queueOutput(`<span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> uses <span class="status-substitution">Substitution 🪵</span> to dodge! 💨`);
            return true;
        }
        let shadowClone = target.statusEffects.some(e => e.name === "ShadowCloneEffect");
        if (shadowClone && !skill.support) {
            let cloneEffects = target.statusEffects.filter(e => e.name === "ShadowCloneEffect");
            if (cloneEffects.length > 0) {
                let index = target.statusEffects.indexOf(cloneEffects[0]);
                target.statusEffects.splice(index, 1);
                scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-${skill.style}">${skill.name}</span>!`);
                scene.queueOutput(`<span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>'s shadow clone takes the hit and disappears! 💨`);
                return true;
            }
        }
        return false;
    }

    handleShadowCloneAction(skill, user, target, scene) {
        if (skill.support) return false;
        let clones = user.statusEffects.filter(e => e.name === "ShadowCloneEffect" && !e.new);
        if (clones.length === 0) return false;
        // Display user's skill first
        scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-${skill.style}">${skill.name}</span>!`);
        let barrageSkill = this.skills.findSkill("Barrage");
        clones.forEach(() => {
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span>'s shadow clone uses <span class="output-text-neutral">Barrage</span>!`);
            let killed = barrageSkill.skillFunction(user, target, scene);
            scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span>'s shadow clone disappears! 💨`);
            if (killed) return true;
        });
        user.statusEffects = user.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
        return target.hp <= 0;
    }

    playerTurn() {
        this.queueOutput(`\n✴ ${game.player.name.toUpperCase()}'S TURN! ✴`);
        setTimeout(() => {
            let killed = this.applyStatusEffects(game.player, this);
            if (killed) return;
            if (game.enemy && game.enemy.hp > 0) {
                let stunned = game.player.statusEffects.some(e => e.name === "Stunned");
                if (!stunned) {
                    let skill = game.player.skills[Math.floor(Math.random() * game.player.skills.length)];
                    let blocked = this.checkTargetedEffects(skill, game.player, game.enemy, this);
                    if (!blocked) {
                        let cloneKilled = this.handleShadowCloneAction(skill, game.player, game.enemy, this);
                        if (cloneKilled) {
                            setTimeout(() => this.endBattle(), 1000);
                            return;
                        }
                        if (!skill.support) { // Execute skill only if not support (support skills don't need separate output)
                            skill.skillFunction(game.player, game.enemy, this);
                        }
                        this.updateStatus();
                        if (game.enemy.hp <= 0) {
                            setTimeout(() => this.endBattle(), 1000);
                            return;
                        }
                    } else {
                        this.updateStatus();
                    }
                    setTimeout(() => this.enemyTurn(), 1000);
                } else {
                    this.queueOutput(`<span class="output-text-player">${game.player.name}</span> is <span class="status-stunned">Stunned ⚡️</span> and cannot act!`);
                    game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "Stunned");
                    setTimeout(() => this.enemyTurn(), 1000);
                }
            } else {
                setTimeout(() => this.endBattle(), 1000);
            }
            this.updateStatus();
        }, 2000);
    }

    enemyTurn() {
        this.queueOutput(`\n✴ ${game.enemy.name.toUpperCase()}'S TURN! ✴`);
        setTimeout(() => {
            let killed = this.applyStatusEffects(game.enemy, this);
            if (killed) return;
            if (game.enemy.hp > 0) {
                let stunned = game.enemy.statusEffects.some(e => e.name === "Stunned");
                if (!stunned) {
                    let skill = game.enemy.skills[Math.floor(Math.random() * game.enemy.skills.length)];
                    let blocked = this.checkTargetedEffects(skill, game.enemy, game.player, this);
                    if (!blocked) {
                        let cloneKilled = this.handleShadowCloneAction(skill, game.enemy, game.player, this);
                        if (cloneKilled) {
                            setTimeout(() => this.endBattle(), 1000);
                            return;
                        }
                        skill.skillFunction(game.enemy, game.player, this);
                        this.updateStatus();
                        if (game.player.hp <= 0) {
                            setTimeout(() => this.endBattle(), 1000);
                            return;
                        }
                    } else {
                        this.updateStatus();
                    }
                    setTimeout(() => this.playerTurn(), 1000);
                } else {
                    this.queueOutput(`<span class="output-text-enemy">${game.enemy.name}</span> is <span class="status-stunned">Stunned ⚡️</span> and cannot act!`);
                    game.enemy.statusEffects = game.enemy.statusEffects.filter(e => e.name !== "Stunned");
                    setTimeout(() => this.playerTurn(), 1000);
                }
            } else {
                setTimeout(() => this.endBattle(), 1000);
            }
        }, 2000);
    }

    endBattle() {
        if (game.player.hp <= 0) {
            this.queueOutput("Shinobi has been defeated! Game Over!");
            document.getElementById("controls").innerHTML = `<button class="start-button" onclick="startGame()">Restart Game</button>`;
            return;
        }
        this.queueOutput(`<span class="output-text-enemy">${game.enemy.name}</span> has been defeated!`);
        game.player.hp = game.player.maxHp;
        game.player.statusEffects = [];
        game.battleNum++;
        game.enemy = null;
        this.updateStatus();
        if (game.player.skills.length >= 10 && game.player.Rank === "Student") {
            setTimeout(() => {
                this.queueOutput("Congratulations, Shinobi! You are ready to become a Genin Shinobi!");
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
            this.queueOutput("No skill cards available!");
            setTimeout(() => this.continueGame(), 1000);
            return;
        }
        let choices = availableSkills.sort(() => Math.random() - 0.5).slice(0, Math.min(4, availableSkills.length));
        this.queueOutput("\nChoose a new skill card:");
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
        this.queueOutput(`\nBattle ${game.battleNum}: <span class="output-text-player">${game.player.name}</span> vs. <span class="output-text-enemy">${game.enemy.name}</span>!`);
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
    game.player = new Mob("Shinobi", 10, 10, "Student", { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" }, [], [], "images/shinobi.png");
    game.battleNum = 1;
    game.enemy = null;
    game.gameState = "start";
    game.outputQueue = [];
    game.isOutputting = false;
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
        game.battleScene.queueOutput(`Shinobi trains Ninja Style <span class="output-text-${style.toLowerCase()}">${style}</span> to C-Rank!`);
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
        game.battleScene.queueOutput(`Selected skill card: <span class="output-text-${skill.style}">${skill.name}</span>`);
        document.getElementById("controls").innerHTML = "";
        if (game.battleScene.chosenSkills.length === 3) {
            game.battleScene.queueOutput(`Skill cards: ${game.player.skills.length}`);
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
    let currentCount = game.player.skills.filter(s => s.name === skill.name).length;
    if (currentCount >= 4) {
        game.battleScene.queueOutput(`You already have the maximum of 4 <span class="output-text-${skill.style}">${skill.name}</span>! Moving to next battle.`);
        document.getElementById("controls").innerHTML = "";
        setTimeout(() => game.battleScene.continueGame(), 1000);
        return;
    }
    game.player.skills.push(skill);
    game.battleScene.queueOutput(`Shinobi gains new skill card: <span class="output-text-${skill.style}">${skill.name}</span>!`);
    document.getElementById("controls").innerHTML = "";
    setTimeout(() => game.battleScene.continueGame(), 1000);
}

function selectRankUpStyle(style) {
    let now = Date.now();
    if (now - lastClickTime < 1000) return;
    lastClickTime = now;
    if (game.gameState === "chooseRankUpStyle") {
        game.player.ninjaStyles[style] = game.battleScene.rankUpStages[game.player.ninjaStyles[style]];
        game.player.Rank = "Genin";
        game.battleScene.queueOutput(`Shinobi ranks up <span class="output-text-${style.toLowerCase()}">${style}</span> to ${game.player.ninjaStyles[style]} and becomes a <span class="output-text-player">Genin</span>!`);
        game.gameState = "rankedUp";
        document.getElementById("controls").innerHTML = "";
        setTimeout(() => game.battleScene.chooseSkillCard(), 1000);
    }
    }
