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
    constructor(name, duration) {
        this.name = name;
        this.duration = duration;
    }
}

class BattleSkill {
    constructor(name, attributes, requirements, skillFunction, style) {
        this.name = name;
        this.attributes = attributes;
        this.requirements = requirements;
        this.skillFunction = skillFunction;
        this.style = style;
    }
}

class Mob {
    constructor(name, hp, maxHp, ninjaStyles, skills, statusEffects) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.ninjaStyles = ninjaStyles;
        this.skills = skills;
        this.statusEffects = statusEffects;
    }
}

class Skills {
    constructor() {
        this.skills = [];
        this.initializeSkills();
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

    canUseSkill(mob, skill) {
        return Object.keys(skill.requirements).every(key => mob.ninjaStyles[key] === skill.requirements[key]);
    }

    findSkill(name) {
        return this.skills.find(skill => skill.name === name);
    }

    barrage(user, target, scene) {
        let damage = Math.round(Math.random() * 3) + 2;
        damage *= user.shadowCloneMultiplier;
        target.hp = Math.max(0, target.hp - damage);
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> attacks <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> with <span class="output-text-neutral">Barrage</span> for ${damage} damage!`);
    }

    demonMindJutsu(user, target, scene) {
        target.statusEffects.push(new StatusEffect("Trauma", 2));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-illusion">Demon Mind Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>, inflicting <span class="status-trauma">Trauma 💀</span>!`);
    }

    fireballJutsu(user, target, scene) {
        let damage = Math.round(Math.random() * 4) + 3;
        damage *= user.shadowCloneMultiplier;
        target.hp = Math.max(0, target.hp - damage);
        target.statusEffects.push(new StatusEffect("Burned", 3));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Fireball Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burned">Burned 🔥</span>!`);
    }

    flameThrowJutsu(user, target, scene) {
        let damage = Math.round(Math.random() * 5) + 5;
        damage *= user.shadowCloneMultiplier;
        target.hp = Math.max(0, target.hp - damage);
        target.statusEffects.push(new StatusEffect("Burned", 3));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-fire">Flame Throw Jutsu</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-burned">Burned 🔥</span>!`);
    }

    healingStance(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Healing", 3));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> enters <span class="output-text-neutral">Healing Stance</span> <span class="status-healing">🌿</span>!`);
    }

    raikiri(user, target, scene) {
        let damage = Math.round(Math.random() * 4) + 4;
        damage *= user.shadowCloneMultiplier;
        target.hp = Math.max(0, target.hp - damage);
        target.statusEffects.push(new StatusEffect("Stunned", 1));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-lightning">Raikiri</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage, inflicting <span class="status-stunned">Stunned ⚡️</span>!`);
    }

    shadowCloneJutsu(user, target, scene) {
        user.statusEffects.push(new StatusEffect("ShadowCloneEffect", 3));
        user.shadowCloneMultiplier = 2;
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-illusion">Shadow Clone Jutsu</span>, creating clones <span class="status-shadowcloneeffect">👥</span>!`);
    }

    bite(user, target, scene) {
        let damage = 5;
        damage *= user.shadowCloneMultiplier;
        target.hp = Math.max(0, target.hp - damage);
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> uses <span class="output-text-feral">Wild Dog Bite</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage!`);
    }

    kawarami(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Kawarami", 2));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> prepares <span class="output-text-neutral">Kawarami</span> <span class="status-kawarami">🪵</span>!`);
    }

    rockBarrierJutsu(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Rock Barrier", 3));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-earth">Rock Barrier Jutsu</span> <span class="status-rockbarrier">🪨</span>!`);
    }

    impendingDoom(user, target, scene) {
        target.statusEffects.push(new StatusEffect("Trauma", 3));
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-illusion">Impending Doom</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span>, inflicting <span class="status-trauma">Trauma 💀</span>!`);
    }

    boulderCrush(user, target, scene) {
        let damage = Math.round(Math.random() * 5) + 5;
        damage *= user.shadowCloneMultiplier;
        target.hp = Math.max(0, target.hp - damage);
        scene.updateOutput(`<span class="output-text-${user === game.player ? 'player' : 'enemy'}">${user.name}</span> casts <span class="output-text-earth">Boulder Crush</span> on <span class="output-text-${target === game.player ? 'player' : 'enemy'}">${target.name}</span> for ${damage} damage!`);
    }
}

class BattleScene {
    constructor() {
        this.skills = new Skills();
        this.asciiMap = {
            Trauma: "💀",
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
        document.getElementById("output").innerHTML = game.output.join("<br>");
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
        let cRankStyles = Object.keys(game.player.ninjaStyles).filter(style => game.player.ninjaStyles[style] === "C-Rank");
        if (cRankStyles.length > 0) {
            this.updateOutput("You are a Genin Shinobi! Choose one Ninja Style to rank up to B-Rank:");
            let controls = document.getElementById("controls");
            controls.innerHTML = "";
            cRankStyles.forEach((style) => {
                let button = document.createElement("button");
                button.innerText = style;
                button.className = style.toLowerCase();
                button.setAttribute("onclick", `selectRankUpStyle('${style}')`);
                controls.appendChild(button);
            });
            this.updateStatus();
        } else {
            this.updateOutput("No C-Rank styles to rank up!");
            setTimeout(() => this.continueGame(), 1000);
        }
    }

    startBattle() {
        game.enemy = this.generateEnemy();
        game.enemy.hp = Math.round(Math.random() * 5) + 15;
        game.enemy.maxHp = game.enemy.hp;
        game.enemy.ninjaStyles = { Fire: "C-Rank", Lightning: "C-Rank", Illusion: "C-Rank", Earth: "C-Rank", Feral: "C-Rank" };
        game.enemy.skills = this.generateEnemySkills(game.enemy);
        this.updateOutput(`\nBattle ${game.battleNum}: <span class="output-text-player">${game.player.name}</span> vs. <span class="output-text-enemy">${game.enemy.name}</span>!`);
        setTimeout(() => this.playerTurn(), 1000);
    }

    generateEnemy() {
        let names = game.player.skills.length < 10 ? ["Wild Dog", "Training Dummy"] : ["Illusionist Genin", "Fire Genin", "Lightning Genin", "Earth Genin", "Feral Genin"];
        let name = names[Math.floor(Math.random() * names.length)];
        return new Mob(name, 0, 0, {}, [], []);
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
        mob.statusEffects.forEach(effect => {
            if (effect.name === "Burned") {
                mob.hp = Math.max(0, mob.hp - 2);
                scene.updateOutput(`<span class="output-text-${mob === game.player ? 'player' : 'enemy'}">${mob.name}</span> takes 2 damage from <span class="status-burned">Burned 🔥</span>!`);
            } else if (effect.name === "Healing") {
                mob.hp = Math.min(10, mob.hp + 2);
                scene.updateOutput(`<span class="output-text-${mob === game.player ? 'player' : 'enemy'}">${mob.name}</span> heals 2 HP from <span class="status-healing">Healing 🌿</span>!`);
            }
            effect.duration--;
            if (effect.duration > 0) newEffects.push(effect);
            else if (effect.name === "ShadowCloneEffect") mob.shadowCloneMultiplier = 1;
        });
        mob.statusEffects = newEffects;
    }

    playerTurn() {
        this.applyStatusEffects(game.player, this);
        if (game.player.hp <= 0) {
            this.updateOutput("Shinobi has been defeated! Game Over!");
            document.getElementById("controls").innerHTML = `<button onclick="startGame()">Restart Game</button>`;
            return;
        }
        if (game.enemy && game.enemy.hp > 0) {
            let stunned = game.player.statusEffects.some(e => e.name === "Stunned");
            if (!stunned) {
                let skill = game.player.skills[Math.floor(Math.random() * game.player.skills.length)];
                setTimeout(() => {
                    skill.skillFunction(game.player, game.enemy, this);
                    setTimeout(() => this.enemyTurn(), 1000);
                }, 1000);
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
        this.applyStatusEffects(game.enemy, this);
        if (game.enemy.hp <= 0) {
            setTimeout(() => this.endBattle(), 1000);
            return;
        }
        let kawarami = game.player.statusEffects.some(e => e.name === "Kawarami");
        if (kawarami) {
            this.updateOutput(`<span class="output-text-player">${game.player.name}</span> uses <span class="status-kawarami">Kawarami 🪵</span> to evade!`);
            game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "Kawarami");
            setTimeout(() => this.playerTurn(), 1000);
        } else {
            let stunned = game.enemy.statusEffects.some(e => e.name === "Stunned");
            if (!stunned) {
                let skill = game.enemy.skills[Math.floor(Math.random() * game.enemy.skills.length)];
                setTimeout(() => {
                    skill.skillFunction(game.enemy, game.player, this);
                    setTimeout(() => this.playerTurn(), 1000);
                }, 1000);
            } else {
                this.updateOutput(`<span class="output-text-enemy">${game.enemy.name}</span> is <span class="status-stunned">Stunned ⚡️</span> and cannot act!`);
                game.enemy.statusEffects = game.enemy.statusEffects.filter(e => e.name !== "Stunned");
                setTimeout(() => this.playerTurn(), 1000);
            }
        }
        this.updateStatus();
    }

    endBattle() {
        if (game.player.hp <= 0) {
            this.updateOutput("Shinobi has been defeated! Game Over!");
            document.getElementById("controls").innerHTML = `<button onclick="startGame()">Restart Game</button>`;
            return;
        }
        this.updateOutput(`<span class="output-text-enemy">${game.enemy.name}</span> has been defeated!`);
        game.battleNum++;
        game.enemy = null;
        if (game.player.skills.length >= 10) {
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
            button.setAttribute("onclick", `selectSkillCard('${skill.name}')`);
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    continueGame() {
        game.enemy = this.generateEnemy();
        game.enemy.hp = Math.round(Math.random() * 5) + 15;
        game.enemy.maxHp = game.enemy.hp;
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
    if (game.player.skills.length >= 10) {
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
    setTimeout(() => game.battleScene.continueGame(), 1000);
    }
