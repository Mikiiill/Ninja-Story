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

// [StatusEffect, BattleSkill, Mob, and Skills classes remain unchanged...]

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
        let playerEffects = [...new Set(game.player.statusEffects.map(e => e.name))].map(name => `<span class="status-${name.toLowerCase().replace(" ", "")}">${this.asciiMap[name] || ""}</span>`).join("");
        let enemyEffects = game.enemy ? [...new Set(game.enemy.statusEffects.map(e => e.name))].map(name => `<span class="status-${name.toLowerCase().replace(" ", "")}">${this.asciiMap[name] || ""}</span>`).join("") : "";
        let playerSprite = game.player.sprite ? `<img src="${game.player.sprite}" class="sprite" alt="Shinobi Sprite">` : "";
        let enemySprite = game.enemy && game.enemy.sprite ? `<img src="${game.enemy.sprite}" class="sprite" alt="${game.enemy.name} Sprite">` : "";
        document.getElementById("player-status").innerHTML = `${playerSprite} Shinobi [HP: <span class="player-hp">${game.player.hp}/${game.player.maxHp}</span>] ${playerEffects}`;
        document.getElementById("enemy-status").innerHTML = game.enemy ? `${enemySprite} ${game.enemy.name} [HP: <span class="enemy-hp">${game.enemy.hp}/${game.enemy.maxHp}</span>] ${enemyEffects}` : "Enemy [HP: <span class='enemy-hp'>0/0</span>]";
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

    // [Remaining methods (chooseRankUpStyle, rankUpStages, startBattle, etc.) remain unchanged...]
}

function log(msg) {
    const el = document.getElementById('log');
    el.innerHTML += '<br>' + msg;
}

// [startGame, selectStyle, selectSkill, selectRankUpStyle, selectSkillCard, addSkillToActive, removeSkillFromActive remain unchanged...]
