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
        this.requirements = requirements || {};
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
            new BattleSkill("Barrage", [], { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" }, this.barrage.bind(this), "neutral", false, "D-Rank"),
            new BattleSkill("Demon Mind Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.demonMindJutsu.bind(this), "illusion", false, "C-Rank"),
            new BattleSkill("Fireball Jutsu", ["Fire"], { Fire: "C-Rank" }, this.fireballJutsu.bind(this), "fire", false, "C-Rank"),
            new BattleSkill("Flame Throw Jutsu", ["Fire"], { Fire: "B-Rank" }, this.flameThrowJutsu.bind(this), "fire", false, "B-Rank"),
            new BattleSkill("Healing Stance", [], { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" }, this.healingStance.bind(this), "neutral", true, "D-Rank"),
            new BattleSkill("Shock Field Jutsu", ["Lightning"], { Lightning: "C-Rank" }, this.shockFieldJutsu.bind(this), "lightning", false, "C-Rank"),
            new BattleSkill("Shadow Clone Jutsu", ["Illusion"], { Illusion: "C-Rank" }, this.shadowCloneJutsu.bind(this), "illusion", true, "C-Rank"),
            new BattleSkill("Bite", ["Feral"], { Feral: "C-Rank" }, this.bite.bind(this), "feral", false, "C-Rank"),
            new BattleSkill("Substitution", [], { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" }, this.substitution.bind(this), "neutral", true, "D-Rank"),
            new BattleSkill("Rock Barrier Jutsu", ["Earth"], { Earth: "C-Rank" }, this.rockBarrierJutsu.bind(this), "earth", true, "C-Rank"),
            new BattleSkill("Impending Doom", ["Illusion"], { Illusion: "B-Rank" }, this.impendingDoom.bind(this), "illusion", false, "B-Rank"),
            new BattleSkill("Rock Smash Jutsu", ["Earth"], { Earth: "B-Rank" }, this.rockSmashJutsu.bind(this), "earth", false, "B-Rank")
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
        scene.queueOutput(`${user.name} attacks ${target.name} with Barrage and hits for ${baseDamage} damage!`);
        if (target.hp > 0) {
            target.hp = Math.max(0, Math.min(target.maxHp, target.hp - comboDamage));
            scene.queueOutput(`${user.name} combos for ${comboDamage} damage!`);
        }
        if (target.hp <= 0) return true;
        return false;
    }

    demonMindJutsu(user, target, scene) {
        let damage = 2;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Doom", 3, 2));
        scene.queueOutput(`${user.name} casts Demon Mind Jutsu on ${target.name} for ${damage} damage, inflicting Doom!`);
        if (target.hp <= 0) return true;
        return false;
    }

    fireballJutsu(user, target, scene) {
        let damage = Math.round(Math.random()) + 3;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burn", 3));
        scene.queueOutput(`${user.name} casts Fireball Jutsu on ${target.name} for ${damage} damage, inflicting Burn!`);
        if (target.hp <= 0) return true;
        return false;
    }

    flameThrowJutsu(user, target, scene) {
        let damage = Math.round(Math.random()) + 5; // Adjusted to 5-6 damage
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Burn", 3, 2));
        scene.queueOutput(`${user.name} casts Flame Throw Jutsu on ${target.name} for ${damage} damage, inflicting Burn!`);
        if (target.hp <= 0) return true;
        return false;
    }

    healingStance(user, target, scene) {
        let heal = user.hp < user.maxHp ? 1 : 0;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal));
        user.statusEffects.push(new StatusEffect("Healing", 3));
        scene.queueOutput(`${user.name} enters Healing Stance${heal > 0 ? `, healing ${heal} HP` : ""}!`);
        return true;
    }

    shockFieldJutsu(user, target, scene) {
        let damage = Math.round(Math.random() * 2) + 2;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        user.statusEffects.push(new StatusEffect("Numb", 1));
        target.statusEffects.push(new StatusEffect("Numb", 1));
        scene.queueOutput(`${user.name} uses Shock Field Jutsu on ${target.name} for ${damage} damage, inflicting Numb on both!`);
        if (target.hp <= 0) return true;
        return false;
    }

    shadowCloneJutsu(user, target, scene) {
        if (user.hp < 2) {
            scene.queueOutput(`${user.name} does not have enough HP to cast Shadow Clone Jutsu!`);
            return false;
        }
        let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
        if (cloneCount >= 3) {
            scene.queueOutput(`${user.name} already has the maximum of 3 shadow clones!`);
            return false;
        }
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp - 2));
        user.statusEffects.push(new StatusEffect("ShadowCloneEffect", 3));
        scene.queueOutput(`${user.name} casts Shadow Clone Jutsu, adding a clone!`);
        return true;
    }

    bite(user, target, scene) {
        let damage = 1;
        let heal = user.hp < user.maxHp ? 1 : 0;
        user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal));
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Bleed", 3, 2));
        scene.queueOutput(`${user.name} uses Bite on ${target.name} for ${damage} damage${heal > 0 ? `, healing ${heal} HP` : ""}, inflicting Bleed!`);
        if (target.hp <= 0) return true;
        return false;
    }

    substitution(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Substitution", 3));
        scene.queueOutput(`${user.name} prepares Substitution!`);
        return true;
    }

    rockBarrierJutsu(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Rock Barrier", 3));
        scene.queueOutput(`${user.name} casts Rock Barrier Jutsu!`);
        return true;
    }

    impendingDoom(user, target, scene) {
        let damage = 3;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        target.statusEffects.push(new StatusEffect("Doom", 3, 3));
        scene.queueOutput(`${user.name} casts Impending Doom on ${target.name} for ${damage} damage, inflicting Doom!`);
        if (target.hp <= 0) return true;
        return false;
    }

    rockSmashJutsu(user, target, scene) {
        let damage = Math.round(Math.random() * 2) + 6;
        target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
        scene.queueOutput(`${user.name} casts Rock Smash Jutsu on ${target.name} for ${damage} damage!`);
        if (target.hp <= 0) return true;
        return false;
    }
}

class BattleScene {
    constructor() {
        this.skills = new Skills();
        this.asciiMap = {
            Doom: "💀",
            Burn: "🔥",
            Bleed: "🩸",
            Healing: "🌿",
            Numb: "⚡️",
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
        let playerEffects = [...new Set(game.player.statusEffects.map(e => e.name))].map(name => `${this.asciiMap[name] || ""}`).join("");
        let enemyEffects = game.enemy ? [...new Set(game.enemy.statusEffects.map(e => e.name))].map(name => `${this.asciiMap[name] || ""}`).join("") : "";
        let playerSprite = game.player.sprite ? `<img src="${game.player.sprite}" class="sprite" alt="Shinobi Sprite">` : "";
        let enemySprite = game.enemy && game.enemy.sprite ? `<img src="${game.enemy.sprite}" class="sprite" alt="${game.enemy.name} Sprite">` : "";
        document.getElementById("player-status").innerHTML = `${playerSprite} Shinobi [HP: ${game.player.hp}/${game.player.maxHp}] ${playerEffects}`;
        document.getElementById("enemy-status").innerHTML = game.enemy ? `${enemySprite} ${game.enemy.name} [HP: ${game.enemy.hp}/${game.enemy.maxHp}] ${enemyEffects}` : "Enemy [HP: 0/0]";
        let rankCounts = {
            "C-Rank": game.player.skills.filter(s => s.rank === "C-Rank").length,
            "B-Rank": game.player.skills.filter(s => s.rank === "B-Rank").length,
            "A-Rank": game.player.skills.filter(s => s.rank === "A-Rank").length,
            "S-Rank": game.player.skills.filter(s => s.rank === "S-Rank").length
        };
        let limits = game.player.Rank === "Student" ? { "C-Rank": 4, "B-Rank": 1, "A-Rank": 0, "S-Rank": 0 } : { "C-Rank": 6, "B-Rank": 2, "A-Rank": 1, "S-Rank": 0 };
        document.getElementById("skill-count").innerText = `Skill cards: ${game.player.skills.length} (C: ${rankCounts["C-Rank"]}/${limits["C-Rank"]}, B: ${rankCounts["B-Rank"]}/${limits["B-Rank"]}, A: ${rankCounts["A-Rank"]}/${limits["A-Rank"]}, S: ${rankCounts["S-Rank"]}/${limits["S-Rank"]})`;
    }

    showSkillsPopup() {
        let popup = document.createElement("div");
        popup.id = "skills-popup";
        popup.className = "skills-popup";
        popup.style.position = "fixed";
        popup.style.top = "20%";
        popup.style.left = "20%";
        popup.style.width = "60%";
        popup.style.padding = "20px";
        popup.style.zIndex = "1000";
        popup.style.fontSize = window.innerWidth <= 768 ? "1rem" : "1.2rem";

        let limits = game.player.Rank === "Student" ? { "C-Rank": 4, "B-Rank": 1, "A-Rank": 0, "S-Rank": 0 } : { "C-Rank": 6, "B-Rank": 2, "A-Rank": 1, "S-Rank": 0 };
        let rankCounts = {
            "C-Rank": game.player.skills.filter(s => s.rank === "C-Rank").length,
            "B-Rank": game.player.skills.filter(s => s.rank === "B-Rank").length,
            "A-Rank": game.player.skills.filter(s => s.rank === "A-Rank").length,
            "S-Rank": game.player.skills.filter(s => s.rank === "S-Rank").length
        };

        let inventoryCounts = {};
        game.player.skillInventory.forEach(s => inventoryCounts[s.name] = (inventoryCounts[s.name] || 0) + 1);
        let inventoryHtml = "<h3>Skill Inventory</h3><ul>";
        Object.keys(inventoryCounts).forEach(skillName => {
            let skill = this.skills.findSkill(skillName);
            inventoryHtml += `<li><button data-skill="${skillName}">${skillName} (${skill.rank}): ${inventoryCounts[skillName]}</button></li>`;
        });
        inventoryHtml += "</ul>";

        let activeHtml = "<h3>Active Skills</h3><ul>";
        game.player.skills.forEach(skill => {
            activeHtml += `<li><button data-skill="${skill.name}">${skill.name} (${skill.rank})</button></li>`;
        });
        activeHtml += "</ul>";

        let compositionHtml = `<p>Deck Composition: C: ${rankCounts["C-Rank"]}/${limits["C-Rank"]}, B: ${rankCounts["B-Rank"]}/${limits["B-Rank"]}, A: ${rankCounts["A-Rank"]}/${limits["A-Rank"]}, S: ${rankCounts["S-Rank"]}/${limits["S-Rank"]}</p>`;
        let limitsHtml = `<p>${game.player.Rank} Limits: C-Rank ${limits["C-Rank"]}, B-Rank ${limits["B-Rank"]}, A-Rank ${limits["A-Rank"]}, S-Rank ${limits["S-Rank"]}</p>`;

        let closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.className = "close-button";

        popup.innerHTML = `${inventoryHtml}${activeHtml}${compositionHtml}${limitsHtml}`;
        popup.appendChild(closeButton);
        document.body.appendChild(popup);

        closeButton.addEventListener("click", () => {
            document.getElementById("skills-popup").remove();
        });
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
            button.setAttribute("onclick", `selectStyle('${style}')`);
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    chooseStartingSkills() {
        game.gameState = "chooseSkills";
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s));
        this.queueOutput("\nChoose four starting skill cards (minimum 4):");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        availableSkills.forEach((skill) => {
            let button = document.createElement("button");
            button.innerText = `${skill.name} (${skill.rank})`;
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
        let minCards = game.player.Rank === "Student" ? 4 : 10;
        if (game.player.skills.length < minCards) {
            this.queueOutput(`Cannot start battle: ${game.player.Rank} requires at least ${minCards} active skills, but you have ${game.player.skills.length}!`);
            document.getElementById("controls").innerHTML = `<button class="skills-button" onclick="game.battleScene.showSkillsPopup()">Adjust Skills</button>`;
            return;
        }
        game.enemy = this.generateEnemy();
        game.enemy.hp = game.enemy.maxHp = game.enemy.name === "Training Dummy" ? 6 : game.enemy.name === "Wild Dog" ? 8 : 12;
        game.enemy.ninjaStyles = { Fire: "C-Rank", Lightning: "C-Rank", Illusion: "C-Rank", Earth: "C-Rank", Feral: "C-Rank" };
        game.enemy.skills = this.generateEnemySkills(game.enemy);
        this.queueOutput(`\nBattle ${game.battleNum}: ${game.player.name} vs. ${game.enemy.name}!`);
        setTimeout(() => this.playerTurn(), 1000);
    }

    generateEnemy() {
        let names = game.player.skillInventory.length < 10 ? ["Wild Dog", "Training Dummy"] : ["Illusionist Genin", "Fire Genin", "Lightning Genin", "Earth Genin", "Feral Genin"];
        let name = names[Math.floor(Math.random() * names.length)];
        let sprite;
        let rank = game.player.skillInventory.length < 10 ? "Basic" : "Genin";
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
        let damageEffects = mob.statusEffects.filter(e => !e.new && (e.name === "Burn" || e.name === "Bleed" || e.name === "Doom"));
        let totalDamage = 0;
        damageEffects.forEach(effect => {
            if (effect.name === "Burn") totalDamage += 2;
            if (effect.name === "Bleed") totalDamage += effect.damage;
            if (effect.name === "Doom") totalDamage += effect.damage;
        });
        if (totalDamage > 0) {
            mob.hp = Math.max(0, Math.min(mob.maxHp, mob.hp - totalDamage));
            scene.queueOutput(`${mob.name} takes ${totalDamage} damage from status effects!`);
        }
        let healingEffects = mob.statusEffects.filter(e => !e.new && e.name === "Healing");
        let totalHeal = 0;
        healingEffects.forEach(effect => {
            totalHeal += 1;
        });
        if (totalHeal > 0) {
            mob.hp = Math.max(0, Math.min(mob.maxHp, mob.hp + totalHeal));
            scene.queueOutput(`${mob.name} heals ${totalHeal} HP from Healing!`);
        }
        mob.statusEffects.forEach(effect => {
            if (!effect.new) {
                effect.duration--;
                if (effect.duration > 0 || ["ShadowCloneEffect", "Substitution", "Rock Barrier"].includes(effect.name)) {
                    newEffects.push(effect);
                } else {
                    scene.queueOutput(`${mob.name}'s ${effect.name} wears off!`);
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
            scene.queueOutput(`${user.name} uses ${skill.name}!`);
            scene.queueOutput(`${target.name}'s Rock Barrier blocks the attack! The rock barrier cracks in half!`);
            return true;
        }
        let substitution = target.statusEffects.some(e => e.name === "Substitution");
        if (substitution && !skill.support) {
            target.statusEffects = target.statusEffects.filter(e => e.name === "Substitution");
            scene.queueOutput(`${user.name} uses ${skill.name}!`);
            scene.queueOutput(`${target.name} uses Substitution to dodge!`);
            return true;
        }
        let shadowClone = target.statusEffects.some(e => e.name === "ShadowCloneEffect");
        if (shadowClone && !skill.support) {
            let cloneEffects = target.statusEffects.filter(e => e.name === "ShadowCloneEffect");
            if (cloneEffects.length > 0) {
                let index = target.statusEffects.indexOf(cloneEffects[0]);
                target.statusEffects.splice(index, 1);
                scene.queueOutput(`${user.name} uses ${skill.name}!`);
                scene.queueOutput(`${target.name}'s shadow clone takes the hit and disappears!`);
                return true;
            }
        }
        return false;
    }

    handleShadowCloneAction(skill, user, target, scene) {
        if (skill.support) return false;
        let clones = user.statusEffects.filter(e => e.name === "ShadowCloneEffect" && !e.new);
        if (clones.length === 0) return false;
        scene.queueOutput(`${user.name} uses ${skill.name}!`);
        let barrageSkill = this.skills.findSkill("Barrage");
        clones.forEach(() => {
            scene.queueOutput(`${user.name}'s shadow clone uses Barrage!`);
            let killed = barrageSkill.skillFunction(user, target, scene);
            scene.queueOutput(`${user.name}'s shadow clone disappears!`);
            if (killed) return true;
        });
        user.statusEffects = user.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
        return target.hp <= 0;
    }

    playerTurn() {
        this.queueOutput(`\n\n✴ ${game.player.name.toUpperCase()}'S TURN! ✴`);
        setTimeout(() => {
            let killed = this.applyStatusEffects(game.player, this);
            if (killed) return;
            if (game.enemy && game.enemy.hp > 0) {
                let numbed = game.player.statusEffects.some(e => e.name === "Numb");
                if (!numbed) {
                    let skill = game.player.skills[Math.floor(Math.random() * game.player.skills.length)];
                    let blocked = this.checkTargetedEffects(skill, game.player, game.enemy, this);
                    if (!blocked) {
                        let cloneKilled = this.handleShadowCloneAction(skill, game.player, game.enemy, this);
                        if (cloneKilled) {
                            setTimeout(() => this.endBattle(), 1000);
                            return;
                        }
                        skill.skillFunction(game.player, game.enemy, this);
                        this.updateStatus();
                        if (game.enemy.hp <= 0) {
                            setTimeout(() => this.endBattle(), 1000);
                            return;
                        }
                        setTimeout(() => this.enemyTurn(), 1000);
                    } else {
                        this.updateStatus();
                        setTimeout(() => this.enemyTurn(), 1000);
                    }
                } else {
                    this.queueOutput(`${game.player.name} is Numb and cannot act!`);
                    game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "Numb");
                    setTimeout(() => this.enemyTurn(), 1000);
                }
            } else {
                setTimeout(() => this.endBattle(), 1000);
            }
            this.updateStatus();
        }, 3000);
    }

    enemyTurn() {
        this.queueOutput(`\n\n✴ ${game.enemy.name.toUpperCase()}'S TURN! ✴`);
        setTimeout(() => {
            let killed = this.applyStatusEffects(game.enemy, this);
            if (killed) return;
            if (game.enemy.hp > 0) {
                let numbed = game.enemy.statusEffects.some(e => e.name === "Numb");
                if (!numbed) {
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
                    this.queueOutput(`${game.enemy.name} is Numb and cannot act!`);
                    game.enemy.statusEffects = game.enemy.statusEffects.filter(e => e.name !== "Numb");
                    setTimeout(() => this.playerTurn(), 1000);
                }
            } else {
                setTimeout(() => this.endBattle(), 1000);
            }
        }, 3000);
    }

    endBattle() {
        if (game.player.hp <= 0) {
            this.queueOutput("Shinobi has been defeated! Game Over!");
            document.getElementById("controls").innerHTML = `<button class="start-button" onclick="startGame()">Restart Game</button>`;
            return;
        }
        this.queueOutput(`${game.enemy.name} has been defeated!`);
        game.player.hp = game.player.maxHp;
        game.player.statusEffects = [];
        game.battleNum++;
        game.enemy = null;
        this.updateStatus();
        if (game.player.skillInventory.length >= 10 && game.player.Rank === "Student") {
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
        let inventoryCounts = {};
        game.player.skillInventory.forEach(s => inventoryCounts[s.name] = (inventoryCounts[s.name] || 0) + 1);
        let availableSkills = this.skills.skills.filter(s => {
            if (!this.skills.canUseSkill(game.player, s)) return false;
            if (inventoryCounts[s.name] >= 4) return false;
            return true;
        });
        if (!availableSkills.length) {
            this.queueOutput("No skill cards available!");
            document.getElementById("controls").innerHTML = `
                <button class="skills-button" onclick="game.battleScene.showSkillsPopup()">Skills</button>
                <button class="train-button" onclick="game.battleScene.startBattle()">Train</button>
            `;
            this.updateStatus();
            return;
        }
        let choices = availableSkills.sort(() => Math.random() - 0.5).slice(0, Math.min(4, availableSkills.length));
        this.queueOutput("\nChoose a new skill card:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        choices.forEach((skill) => {
            let button = document.createElement("button");
            button.innerText = `${skill.name} (${skill.rank})`;
            button.setAttribute("onclick", `selectSkillCard('${skill.name}')`);
            controls.appendChild(button);
        });
        this.updateStatus();
    }
}

let lastClickTime = 0;
function startGame() {
    let now = Date.now();
    if (now - lastClickTime < 1500) {
        console.log("Click ignored: Debounce active, time since last click:", now - lastClickTime);
        return;
    }
    lastClickTime = now;
    console.log("Starting ShinobiWay, time:", now);

    if (!document.getElementById("output") || !document.getElementById("controls") || !document.getElementById("player-status") || !document.getElementById("enemy-status") || !document.getElementById("skill-count")) {
        console.error("Error: Missing DOM elements (#output, #controls, #player-status, #enemy-status, #skill-count)");
        document.getElementById("output").innerHTML = "Error: Missing game elements. Check index.html!";
        return;
    }

    game.output = ["Train to become a Genin Shinobi! Collect 10 skill cards!"];
    game.player = new Mob("Shinobi", 10, 10, "Student", { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" }, [], [], "images/shinobi.png");
    game.player.skillInventory = [];
    game.battleNum = 1;
    game.enemy = null;
    game.gameState = "start";
    game.outputQueue = [];
    game.isOutputting = false;
    document.getElementById("output").innerHTML = game.output.join("<br>");
    game.battleScene = new BattleScene();
    let barrageSkill = game.battleScene.skills.findSkill("Barrage");
    if (barrageSkill) {
        game.player.skillInventory = [barrageSkill];
        game.player.skills = [barrageSkill];
        console.log("Barrage skill added to inventory and active skills:", barrageSkill);
    } else {
        console.error("Error: Barrage skill not found in game.battleScene.skills!");
        game.output.push("Error: Barrage skill not found!");
        document.getElementById("output").innerHTML = game.output.join("<br>");
        return;
    }
    setTimeout(() => {
        try {
            game.battleScene.chooseNinjaStyles();
            console.log("chooseNinjaStyles called successfully");
        } catch (e) {
            console.error("Error in chooseNinjaStyles:", e);
            game.output.push("Error: Failed to start style selection!");
            document.getElementById("output").innerHTML = game.output.join("<br>");
        }
    }, 1000);
}

function selectStyle(style) {
    let now = Date.now();
    if (now - lastClickTime < 1500) return;
    lastClickTime = now;
    if (game.battleScene.chosenStyles.length < 2) {
        game.battleScene.chosenStyles.push(style);
        game.player.ninjaStyles[style] = "C-Rank";
        game.battleScene.queueOutput(`Shinobi trains Ninja Style ${style} to C-Rank!`);
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
    if (now - lastClickTime < 1500) return;
    lastClickTime = now;
    let skill = game.battleScene.skills.findSkill(skillName);
    if (game.battleScene.chosenSkills.length < 4 && skill) {
        game.battleScene.chosenSkills.push(skill);
        game.player.skillInventory.push(skill);
        game.player.skills.push(skill);
        game.battleScene.queueOutput(`Shinobi learns ${skillName}!`);
        document.getElementById("controls").innerHTML = "";
        if (game.battleScene.chosenSkills.length === 4) {
            setTimeout(() => game.battleScene.startBattle(), 1000);
        } else {
            setTimeout(() => game.battleScene.chooseStartingSkills(), 1000);
        }
    }
}

function selectRankUpStyle(style) {
    let now = Date.now();
    if (now - lastClickTime < 1500) return;
    lastClickTime = now;
    game.player.ninjaStyles[style] = game.battleScene.rankUpStages[game.player.ninjaStyles[style]];
    game.player.Rank = "Genin";
    game.battleScene.queueOutput(`Shinobi ranks up ${style} to ${game.player.ninjaStyles[style]} and becomes a Genin!`);
    document.getElementById("controls").innerHTML = "";
    setTimeout(() => game.battleScene.chooseSkillCard(), 1000);
}

function selectSkillCard(skillName) {
    let now = Date.now();
    if (now - lastClickTime < 1500) return;
    lastClickTime = now;
    let skill = game.battleScene.skills.findSkill(skillName);
    if (skill && game.player.skillInventory.length < 10) {
        game.player.skillInventory.push(skill);
        game.battleScene.queueOutput(`Shinobi learns ${skillName}!`);
        document.getElementById("controls").innerHTML = "";
        setTimeout(() => game.battleScene.chooseSkillCard(), 1000);
    } else if (game.player.skillInventory.length >= 10) {
        game.battleScene.queueOutput("Skill inventory is full! You are ready to rank up!");
        document.getElementById("controls").innerHTML = `<button onclick="game.battleScene.chooseRankUpStyle()">Rank Up</button>`;
    }
            }
