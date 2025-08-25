let game = {
    player: {
        name: "Shinobi",
        hp: 10,
        maxHp: 10,
        Rank: "Student",
        ninjaStyles: { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" },
        skills: [],
        skillInventory: [],
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

    barrage(user, target, scene) { let baseDamage = Math.round(Math.random()) + 1; let comboDamage = Math.round(Math.random()) + 1; target.hp = Math.max(0, Math.min(target.maxHp, target.hp - baseDamage)); scene.queueOutput(`<span class="output-text-neutral">Barrage</span> hits <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${baseDamage} damage!`); if (target.hp > 0) { target.hp = Math.max(0, Math.min(target.maxHp, target.hp - comboDamage)); scene.queueOutput(`Combo deals ${comboDamage} damage!`); } if (target.hp <= 0) return true; return false; }
    demonMindJutsu(user, target, scene) { let damage = 2; target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage)); target.statusEffects.push(new StatusEffect("Doom", 3, 2)); scene.queueOutput(`<span class="output-text-illusion">Demon Mind Jutsu</span> deals ${damage} damage to <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>, inflicting <span class="status-doom">Doom 💀</span>!`); if (target.hp <= 0) return true; return false; }
    fireballJutsu(user, target, scene) { let damage = Math.round(Math.random()) + 3; target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage)); target.statusEffects.push(new StatusEffect("Burn", 3)); scene.queueOutput(`<span class="output-text-fire">Fireball Jutsu</span> deals ${damage} damage to <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>, inflicting <span class="status-burn">Burn 🔥</span>!`); if (target.hp <= 0) return true; return false; }
    flameThrowJutsu(user, target, scene) { let damage = Math.round(Math.random()) + 5; target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage)); target.statusEffects.push(new StatusEffect("Burn", 3, 2)); scene.queueOutput(`<span class="output-text-fire">Flame Throw Jutsu</span> deals ${damage} damage to <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>, inflicting <span class="status-burn">Burn 🔥</span>!`); if (target.hp <= 0) return true; return false; }
    healingStance(user, target, scene) { let heal = user.hp < user.maxHp ? 1 : 0; user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal)); user.statusEffects.push(new StatusEffect("Healing", 3)); scene.queueOutput(`<span class="output-text-neutral">Healing Stance</span> ${heal > 0 ? `heals <span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> for ${heal} HP` : `for <span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span>`}, <span class="status-healing">Healing 🌿</span>!`); return true; }
    shockFieldJutsu(user, target, scene) { let damage = Math.round(Math.random() * 2) + 2; target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage)); user.statusEffects.push(new StatusEffect("Numb", 1)); target.statusEffects.push(new StatusEffect("Numb", 1)); scene.queueOutput(`<span class="output-text-lightning">Shock Field Jutsu</span> deals ${damage} damage to <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>, inflicting <span class="status-numb">Numb ⚡️</span> on both!`); if (target.hp <= 0) return true; return false; }
    shadowCloneJutsu(user, target, scene) { if (user.hp < 2) { scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> lacks HP for <span class="output-text-illusion">Shadow Clone Jutsu</span>!`); return false; } let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length; if (cloneCount >= 3) { scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> has max shadow clones!`); return false; } user.hp = Math.max(0, Math.min(user.maxHp, user.hp - 2)); user.statusEffects.push(new StatusEffect("ShadowCloneEffect", 3)); scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-illusion">Shadow Clone Jutsu</span>, adding <span class="status-shadowcloneeffect">👥</span>!`); return true; }
    bite(user, target, scene) { let damage = 1; let heal = user.hp < user.maxHp ? 1 : 0; user.hp = Math.max(0, Math.min(user.maxHp, user.hp + heal)); target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage)); target.statusEffects.push(new StatusEffect("Bleed", 3, 2)); scene.queueOutput(`<span class="output-text-feral">Bite</span> deals ${damage} damage to <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>${heal > 0 ? `, healing <span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> ${heal} HP` : ""}, inflicting <span class="status-bleed">Bleed 🩸</span>!`); if (target.hp <= 0) return true; return false; }
    substitution(user, target, scene) { user.statusEffects.push(new StatusEffect("Substitution", 3)); scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> prepares <span class="output-text-neutral">Substitution</span> <span class="status-substitution">🪵</span>!`); return true; }
    rockBarrierJutsu(user, target, scene) { user.statusEffects.push(new StatusEffect("Rock Barrier", 3)); scene.queueOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-earth">Rock Barrier Jutsu</span> <span class="status-rockbarrier">🪨</span>!`); return true; }
    impendingDoom(user, target, scene) { let damage = 3; target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage)); target.statusEffects.push(new StatusEffect("Doom", 3, 3)); scene.queueOutput(`<span class="output-text-illusion">Impending Doom</span> deals ${damage} damage to <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>, inflicting <span class="status-doom">Doom 💀</span>!`); if (target.hp <= 0) return true; return false; }
    rockSmashJutsu(user, target, scene) { let damage = Math.round(Math.random() * 2) + 6; target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage)); scene.queueOutput(`<span class="output-text-earth">Rock Smash Jutsu</span> deals ${damage} damage to <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>!`); if (target.hp <= 0) return true; return false; }
}

class BattleScene {
    constructor() {
        this.skills = new Skills();
        this.asciiMap = {
            Doom: "💀", Burn: "🔥", Bleed: "🩸", Healing: "🌿", Numb: "⚡️",
            ShadowCloneEffect: "👥", Substitution: "🪵", "Rock Barrier": "🪨"
        };
        this.chosenStyles = [];
        this.chosenSkills = [];
    }

    queueOutput(text) {
        game.outputQueue.push(text);
        if (!game.isOutputting) this.processOutputQueue();
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

    updateOutput(text) { this.queueOutput(text); }

    updateStatus() {
        let playerEffects = [...new Set(game.player.statusEffects.map(e => e.name))].map(name => `<span class="status-${name.toLowerCase().replace(" ", "")}">${this.asciiMap[name] || ""}</span>`).join("");
        let enemyEffects = game.enemy ? [...new Set(game.enemy.statusEffects.map(e => e.name))].map(name => `<span class="status-${name.toLowerCase().replace(" ", "")}">${this.asciiMap[name] || ""}</span>`).join("") : "";
        let playerSprite = game.player.sprite ? `<img src="${game.player.sprite}" class="sprite" alt="Shinobi Sprite">` : "";
        let enemySprite = game.enemy && game.enemy.sprite ? `<img src="${game.enemy.sprite}" class="sprite" alt="${game.enemy.name} Sprite">` : "";
        document.getElementById("player-status").innerHTML = `${playerSprite} Shinobi [HP: <span class="player-hp">${game.player.hp}/${game.player.maxHp}</span>] ${playerEffects}`;
        document.getElementById("enemy-status").innerHTML = game.enemy ? `${enemySprite} ${game.enemy.name} [HP: <span class="enemy-hp">${game.enemy.hp}/${game.enemy.maxHp}</span>] ${enemyEffects}` : "Enemy [HP: <span class='enemy-hp'>0/0</span>]";
        let rankCounts = { "C-Rank": game.player.skills.filter(s => s.rank === "C-Rank").length, "B-Rank": game.player.skills.filter(s => s.rank === "B-Rank").length, "A-Rank": game.player.skills.filter(s => s.rank === "A-Rank").length, "S-Rank": game.player.skills.filter(s => s.rank === "S-Rank").length };
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
        popup.style.background = "white";
        popup.style.border = "1px solid black";

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
            let canAdd = rankCounts[skill.rank] < limits[skill.rank] && inventoryCounts[skillName] > game.player.skills.filter(s => s.name === skillName).length;
            inventoryHtml += `<li><button class="${skill.style}" data-skill="${skillName}" onclick="${canAdd ? `addSkillToActive('${skillName}')` : ''}" ${canAdd ? '' : 'disabled'}>${skillName} (${skill.rank}): ${inventoryCounts[skillName]}</button></li>`;
        });
        inventoryHtml += "</ul>";

        let activeHtml = "<h3>Active Skills</h3><ul>";
        game.player.skills.forEach(skill => {
            activeHtml += `<li><button class="${skill.style}" data-skill="${skill.name}" onclick="removeSkillFromActive('${skill.name}')">${skill.name} (${skill.rank})</button></li>`;
        });
        activeHtml += "</ul>";

        let compositionHtml = `<p>Deck Composition: C: ${rankCounts["C-Rank"]}/${limits["C-Rank"]}, B: ${rankCounts["B-Rank"]}/${limits["B-Rank"]}, A: ${rankCounts["A-Rank"]}/${limits["A-Rank"]}, S: ${rankCounts["S-Rank"]}/${limits["S-Rank"]}</p>`;
        let limitsHtml = `<p>${game.player.Rank} Limits: C-Rank ${limits["C-Rank"]}, B-Rank ${limits["B-Rank"]}, A-Rank ${limits["A-Rank"]}, S-Rank ${limits["S-Rank"]}</p>`;

        let closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.className = "close-button";
        closeButton.onclick = () => document.getElementById("skills-popup").remove();

        popup.innerHTML = `${inventoryHtml}${activeHtml}${compositionHtml}${limitsHtml}`;
        popup.appendChild(closeButton);
        document.body.appendChild(popup);
    }

    chooseNinjaStyles() {
        log('Entering chooseNinjaStyles...');
        if (game.gameState !== "start" || this.chosenStyles.length >= 2) {
            log(`Exiting chooseNinjaStyles: gameState=${game.gameState}, chosenStyles.length=${this.chosenStyles.length}`);
            if (this.chosenStyles.length >= 2) {
                game.gameState = "chooseSkills";
                setTimeout(() => this.chooseStartingSkills(), 1000);
            }
            return;
        }
        game.gameState = "chooseStyles";
        let styles = ["Fire", "Lightning", "Illusion", "Earth", "Feral"].filter(s => !this.chosenStyles.includes(s));
        log(`Available styles: ${styles.join(', ')}`);
        this.queueOutput("Choose two Ninja Styles to rank up to C-Rank:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        if (styles.length === 0) {
            log('No styles left to choose, forcing next step...');
            game.gameState = "chooseSkills";
            setTimeout(() => this.chooseStartingSkills(), 1000);
            return;
        }
        styles.forEach((style) => {
            let button = document.createElement("button");
            button.innerText = style;
            button.className = style.toLowerCase();
            button.setAttribute("onclick", `selectStyle('${style}')`);
            controls.appendChild(button);
            log(`Added button for ${style}`);
        });
        this.updateStatus();
        log('chooseNinjaStyles completed, waiting for user input...');
    }

    chooseStartingSkills() {
        log('Entering chooseStartingSkills...');
        if (game.gameState !== "chooseSkills" || this.chosenSkills.length >= 4) {
            log(`Exiting chooseStartingSkills: gameState=${game.gameState}, chosenSkills.length=${this.chosenSkills.length}`);
            if (this.chosenSkills.length >= 4) {
                game.gameState = "battle";
                setTimeout(() => this.startBattle(), 1000);
            }
            return;
        }
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s));
        log(`Available skills count: ${availableSkills.length}`);
        this.queueOutput("\nChoose four starting skill cards:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        if (availableSkills.length === 0) {
            log('No skills available, forcing battle start...');
            game.gameState = "battle";
            setTimeout(() => this.startBattle(), 1000);
            return;
        }
        availableSkills.forEach((skill) => {
            let button = document.createElement("button");
            button.innerText = `${skill.name} (${skill.rank})`;
            button.className = skill.style;
            button.setAttribute("onclick", `selectSkill('${skill.name}')`);
            controls.appendChild(button);
            log(`Added button for ${skill.name}`);
        });
        this.updateStatus();
        log('chooseStartingSkills completed, waiting for user input...');
    }

    chooseRankUpStyle() {
        log('Entering chooseRankUpStyle...');
        if (game.gameState !== "chooseRankUpStyle") return;
        let upgradableStyles = Object.keys(game.player.ninjaStyles).filter(s => game.player.ninjaStyles[s] === "C-Rank");
        log(`Upgradable styles: ${upgradableStyles.join(', ')}`);
        this.queueOutput("Choose a style to rank up to B-Rank:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        if (upgradableStyles.length === 0) {
            log('No styles to rank up, forcing battle...');
            game.gameState = "battle";
            setTimeout(() => this.startBattle(), 1000);
            return;
        }
        upgradableStyles.forEach((style) => {
            let button = document.createElement("button");
            button.innerText = style;
            button.className = style.toLowerCase();
            button.setAttribute("onclick", `selectRankUpStyle('${style}')`);
            controls.appendChild(button);
            log(`Added button for ${style}`);
        });
        this.updateStatus();
        log('chooseRankUpStyle completed, waiting for user input...');
    }

    rankUpStages = { "D-Rank": "C-Rank", "C-Rank": "B-Rank", "B-Rank": "A-Rank", "A-Rank": "S-Rank" };

    startBattle() {
        log('Starting battle...');
        if (game.gameState !== "battle") return;
        if (!game.enemy) {
            this.generateEnemy();
            log(`Generated enemy: ${game.enemy.name}`);
        }
        this.queueOutput(`Battle ${game.battleNum} begins! Facing ${game.enemy.name}!`);
        this.showOptions();
        this.updateStatus();
        log('Battle started, awaiting player turn...');
    }

    generateEnemy() {
        let enemyNames = ["Ninja Rookie", "Bandit Leader", "Forest Guardian"];
        let name = enemyNames[Math.floor(Math.random() * enemyNames.length)];
        let hp = Math.floor(Math.random() * 5) + 5;
        let maxHp = hp;
        let Rank = "Student";
        let ninjaStyles = { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" };
        let skills = this.generateEnemySkills({ name, hp, maxHp, Rank, ninjaStyles });
        let statusEffects = [];
        let sprite = "/Shinobi.png"; // Placeholder; update with actual enemy sprites if available
        game.enemy = new Mob(name, hp, maxHp, Rank, ninjaStyles, skills, statusEffects, sprite);
    }

    generateEnemySkills(enemy) {
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(enemy, s));
        let skillCount = Math.min(Math.floor(Math.random() * 3) + 1, availableSkills.length);
        return availableSkills.slice(0, skillCount);
    }

    applyStatusEffects(mob, scene) {
        mob.statusEffects = mob.statusEffects.filter(e => {
            if (e.duration > 0) {
                e.duration--;
                if (e.damage > 0) mob.hp = Math.max(0, mob.hp - e.damage);
                return true;
            }
            return false;
        });
        scene.updateStatus();
    }

    checkTargetedEffects(skill, user, target, scene) {
        if (skill.attributes.includes("Fire") && Math.random() < 0.5) target.statusEffects.push(new StatusEffect("Burn", 3));
        if (skill.attributes.includes("Feral") && Math.random() < 0.5) target.statusEffects.push(new StatusEffect("Bleed", 3, 2));
        if (skill.attributes.includes("Lightning") && Math.random() < 0.5) target.statusEffects.push(new StatusEffect("Numb", 1));
    }

    handleShadowCloneAction(skill, user, target, scene) {
        let cloneEffect = user.statusEffects.find(e => e.name === "ShadowCloneEffect" && e.duration > 0);
        if (cloneEffect) {
            let damage = 1;
            target.hp = Math.max(0, Math.min(target.maxHp, target.hp - damage));
            scene.queueOutput(`<span class="output-text-illusion">Shadow Clone</span> deals ${damage} damage to <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>!`);
            if (target.hp <= 0) return true;
        }
        return false;
    }

    playerTurn() {
        log('Player turn started...');
        if (game.gameState !== "battle") return;
        this.showOptions();
        this.updateStatus();
        log('Player turn options displayed...');
    }

    enemyTurn() {
        log('Enemy turn started...');
        if (game.gameState !== "battle" || !game.enemy || game.enemy.hp <= 0) return;
        let skill = game.enemy.skills[Math.floor(Math.random() * game.enemy.skills.length)];
        if (skill) skill.skillFunction(game.enemy, game.player, this);
        this.applyStatusEffects(game.player, this);
        this.applyStatusEffects(game.enemy, this);
        if (game.player.hp <= 0) {
            this.queueOutput(`<span class="output-text-enemy">${game.enemy.name}</span> wins! Game Over!`);
            game.gameState = "end";
        } else if (game.enemy.hp <= 0) {
            this.endBattle();
        } else {
            this.playerTurn();
        }
        log('Enemy turn completed...');
    }

    endBattle() {
        log('Ending battle...');
        game.battleNum++;
        game.enemy = null;
        this.queueOutput(`<span class="output-text-player">Shinobi</span> wins! Battle ${game.battleNum - 1} ended.`);
        game.gameState = "chooseSkillCard";
        setTimeout(() => this.chooseSkillCard(), 1000);
        log('Battle ended, awaiting skill card choice...');
    }

    showOptions() {
        log('Showing options...');
        if (game.gameState !== "battle") return;
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        game.player.skills.forEach(skill => {
            let button = document.createElement("button");
            button.innerText = skill.name;
            button.className = skill.style;
            button.setAttribute("onclick", `game.battleScene.chooseSkillCard('${skill.name}')`);
            controls.appendChild(button);
        });
        this.updateStatus();
        log('Options displayed...');
    }

    chooseSkillCard() {
        log('Entering chooseSkillCard...');
        if (game.gameState !== "chooseSkillCard") return;
        let availableSkills = this.skills.skills.filter(s => !game.player.skillInventory.some(si => si.name === s.name));
        log(`Available skills count: ${availableSkills.length}`);
        this.queueOutput("Choose a skill card to add to your inventory:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        if (availableSkills.length === 0 || game.player.skillInventory.length >= 10) {
            log('No skills available or inventory full, moving to rank up...');
            game.gameState = "chooseRankUpStyle";
            setTimeout(() => this.chooseRankUpStyle(), 1000);
            return;
        }
        availableSkills.forEach((skill) => {
            let button = document.createElement("button");
            button.innerText = `${skill.name} (${skill.rank})`;
            button.className = skill.style;
            button.setAttribute("onclick", `selectSkillCard('${skill.name}')`);
            controls.appendChild(button);
            log(`Added button for ${skill.name}`);
        });
        this.updateStatus();
        log('chooseSkillCard completed, waiting for user input...');
    }
}

function log(msg) {
    const el = document.getElementById('log');
    el.innerHTML += '<br>' + msg;
}

function startGame() {
    log('Attempting to start game at ' + new Date().toLocaleTimeString() + '...');
    let now = Date.now();
    if (now - (window.lastClickTime || 0) < 1500) {
        log('Click too fast, ignoring...');
        return;
    }
    window.lastClickTime = now;

    // Check DOM elements
    const requiredElements = {
        output: document.getElementById("output"),
        controls: document.getElementById("controls"),
        playerStatus: document.getElementById("player-status"),
        enemyStatus: document.getElementById("enemy-status"),
        skillCount: document.getElementById("skill-count")
    };
    log('Checking DOM elements: ' + JSON.stringify(Object.fromEntries(Object.entries(requiredElements).map([k, v]) => [k, !!v]))));
    if (!requiredElements.output || !requiredElements.controls || !requiredElements.playerStatus || !requiredElements.enemyStatus || !requiredElements.skillCount) {
        log('Error: Missing required DOM elements!');
        requiredElements.output.innerHTML = "Error: Missing game elements. Check index.html!";
        return;
    }

    // Initialize game
    game.output = ["Train to become a Genin Shinobi! Collect 10 skill cards!"];
    game.player = new Mob("Shinobi", 10, 10, "Student", { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" }, [], [], "/Shinobi.png");
    game.player.skillInventory = [];
    game.battleNum = 1;
    game.enemy = null;
    game.gameState = "start";
    game.outputQueue = [];
    game.isOutputting = false;
    requiredElements.output.innerHTML = game.output.join("<br>");
    log('Game initialized with state: ' + JSON.stringify({ hp: game.player.hp, Rank: game.player.Rank, gameState: game.gameState }));

    // Create BattleScene
    log('Creating BattleScene...');
    game.battleScene = new BattleScene();
    let barrageSkill = game.battleScene.skills.findSkill("Barrage");
    if (barrageSkill) {
        log('Found Barrage skill, adding to inventory and skills...');
        game.player.skillInventory.push(barrageSkill);
        game.player.skills.push(barrageSkill);
    } else {
        log('Error: Barrage skill not found in Skills class!');
        game.output.push("Error: Barrage skill not found!");
        requiredElements.output.innerHTML = game.output.join("<br>");
        return;
    }

    // Start style selection
    log('Scheduling chooseNinjaStyles...');
    setTimeout(() => {
        log('Executing chooseNinjaStyles...');
        game.battleScene.chooseNinjaStyles();
    }, 1000);
}

let lastClickTime = 0;

function selectStyle(style) {
    let now = Date.now();
    if (now - lastClickTime < 1500) return;
    lastClickTime = now;
    if (game.battleScene.chosenStyles.length < 2) {
        game.battleScene.chosenStyles.push(style);
        game.player.ninjaStyles[style] = "C-Rank";
        game.battleScene.queueOutput(`<span class="output-text-${style.toLowerCase()}">${style}</span> trained to C-Rank!`);
        document.getElementById("controls").innerHTML = "";
        if (game.battleScene.chosenStyles.length === 2) {
            game.gameState = "chooseSkills";
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
        game.battleScene.queueOutput(`<span class="output-text-${skill.style}">${skillName}</span> learned!`);
        document.getElementById("controls").innerHTML = "";
        if (game.battleScene.chosenSkills.length === 4) {
            game.gameState = "battle";
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
    game.battleScene.queueOutput(`<span class="output-text-${style.toLowerCase()}">${style}</span> ranked up to ${game.player.ninjaStyles[style]}, <span class="output-text-player">Shinobi</span> is now a Genin!`);
    document.getElementById("controls").innerHTML = "";
    game.battleScene.showOptions();
}

function selectSkillCard(skillName) {
    let now = Date.now();
    if (now - lastClickTime < 1500) return;
    lastClickTime = now;
    let skill = game.battleScene.skills.findSkill(skillName);
    if (skill && game.player.skillInventory.length < 10) {
        game.player.skillInventory.push(skill);
        game.battleScene.queueOutput(`<span class="output-text-${skill.style}">${skillName}</span> learned!`);
        document.getElementById("controls").innerHTML = "";
        if (game.player.skillInventory.length === 10) {
            game.gameState = "chooseRankUpStyle";
            setTimeout(() => game.battleScene.chooseRankUpStyle(), 1000);
        } else {
            game.battleScene.showOptions();
        }
    }
}

function addSkillToActive(skillName) {
    let skill = game.battleScene.skills.findSkill(skillName);
    if (!skill) return;
    let inventoryCounts = {};
    game.player.skillInventory.forEach(s => inventoryCounts[s.name] = (inventoryCounts[s.name] || 0) + 1);
    let activeCount = game.player.skills.filter(s => s.name === skillName).length;
    if (inventoryCounts[skillName] > activeCount) {
        let limits = game.player.Rank === "Student" ? { "C-Rank": 4, "B-Rank": 1, "A-Rank": 0, "S-Rank": 0 } : { "C-Rank": 6, "B-Rank": 2, "A-Rank": 1, "S-Rank": 0 };
        let rankCounts = {
            "C-Rank": game.player.skills.filter(s => s.rank === "C-Rank").length,
            "B-Rank": game.player.skills.filter(s => s.rank === "B-Rank").length,
            "A-Rank": game.player.skills.filter(s => s.rank === "A-Rank").length,
            "S-Rank": game.player.skills.filter(s => s.rank === "S-Rank").length
        };
        if (rankCounts[skill.rank] < limits[skill.rank]) {
            game.player.skills.push(skill);
            game.battleScene.queueOutput(`Added <span class="output-text-${skill.style}">${skillName}</span> to active skills!`);
        } else {
            game.battleScene.queueOutput(`Cannot add <span class="output-text-${skill.style}">${skillName}</span>: Reached ${skill.rank} limit!`);
        }
    }
    game.battleScene.showSkillsPopup();
}

function removeSkillFromActive(skillName) {
    let index = game.player.skills.findIndex(s => s.name === skillName);
    if (index !== -1) {
        game.player.skills.splice(index, 1);
        game.battleScene.queueOutput(`Removed <span class="output-text-${game.battleScene.skills.findSkill(skillName).style}">${skillName}</span> from active skills!`);
    }
    game.battleScene.showSkillsPopup();
}

log('Script loaded at ' + new Date().toLocaleTimeString());
