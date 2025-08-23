// Debug: Log when script loads
console.log("script.js loaded");

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

// ... (keep StatusEffect, Mob, Skills unchanged) ...

class BattleSkill {
    constructor(name, attributes, requirements, skillFunction, style) {
        this.name = name;
        this.attributes = attributes;
        this.requirements = requirements;
        this.skillFunction = skillFunction;
        this.style = style;
    }
}

// ... (keep Skills class unchanged, but update initializeSkills) ...

class Skills {
    // ... (keep all methods except initializeSkills) ...
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
        console.log("chooseNinjaStyles called");
        game.gameState = "chooseStyles";
        let styles = ["Fire", "Lightning", "Illusion", "Earth", "Feral"].filter(s => !this.chosenStyles.includes(s));
        this.updateOutput("Choose two Ninja Styles to rank up to C-Rank:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        styles.forEach((style) => {
            let button = document.createElement("button");
            button.innerText = style;
            button.className = style.toLowerCase();
            button.addEventListener("click", () => {
                alert(`Clicked ${style} button!`);
                console.log(`Button clicked: ${style}`);
                this.selectStyle(style);
            });
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    selectStyle(style) {
        console.log(`selectStyle called with ${style}`);
        if (window.confirm(`Train ${style} to C-Rank?`)) {
            console.log(`Style ${style} confirmed`);
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
        } else {
            console.log(`Style ${style} cancelled`);
        }
    }

    chooseStartingSkills() {
        console.log("chooseStartingSkills called");
        game.gameState = "chooseSkills";
        let availableSkills = this.skills.skills.filter(s => this.skills.canUseSkill(game.player, s) && !this.chosenSkills.includes(s));
        this.updateOutput("\nChoose three starting skill cards:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        availableSkills.forEach((skill) => {
            let button = document.createElement("button");
            button.innerText = skill.name;
            button.className = skill.style;
            button.addEventListener("click", () => {
                alert(`Clicked ${skill.name} button!`);
                console.log(`Button clicked: ${skill.name}`);
                this.selectSkill(skill.name);
            });
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    selectSkill(skillName) {
        console.log(`selectSkill called with ${skillName}`);
        let skill = this.skills.findSkill(skillName);
        if (!skill) {
            console.error(`Skill ${skillName} not found`);
            return;
        }
        if (window.confirm(`Choose ${skill.name} as a starting skill?`)) {
            console.log(`Skill ${skill.name} confirmed`);
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
        } else {
            console.log(`Skill ${skillName} cancelled`);
        }
    }

    chooseSkillCard() {
        console.log("chooseSkillCard called");
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
            button.addEventListener("click", () => {
                alert(`Clicked ${skill.name} button!`);
                console.log(`Button clicked: ${skill.name}`);
                this.selectSkillCard(skill.name);
            });
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    selectSkillCard(skillName) {
        console.log(`selectSkillCard called with ${skillName}`);
        let skill = this.skills.findSkill(skillName);
        if (!skill) {
            console.error(`Skill card ${skillName} not found`);
            return;
        }
        if (window.confirm(`Add ${skill.name} to your skills?`)) {
            console.log(`Skill card ${skill.name} confirmed`);
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
            console.log(`Skill card ${skillName} cancelled`);
        }
    }

    // ... (keep all other BattleScene methods unchanged) ...
}

function startGame() {
    console.log("startGame called");
    if (window.confirm("Start ShinobiWay?")) {
        console.log("Start Game confirmed");
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
