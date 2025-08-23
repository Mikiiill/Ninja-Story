let game = {
    player: {
        name: "Player",
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
    constructor(name, attributes, requirements, skillFunction) {
        this.name = name;
        this.attributes = attributes;
        this.requirements = requirements;
        this.skillFunction = skillFunction;
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

    canUseSkill(mob, skill) {
        return Object.keys(skill.requirements).every(key => mob.ninjaStyles[key] === skill.requirements[key]);
    }

    findSkill(name) {
        return this.skills.find(skill => skill.name === name);
    }

    barrage(user, target, scene) {
        let damage = Math.round(Math.random() * 3) + 2;
        damage *= user.shadowCloneMultiplier;
        target.hp -= damage;
        scene.updateOutput(`${user.name} attacks ${target.name} with Barrage for ${damage} damage!`);
    }

    demonMindJutsu(user, target, scene) {
        target.statusEffects.push(new StatusEffect("Trauma", 2));
        scene.updateOutput(`${user.name} casts Demon Mind Jutsu on ${target.name}, inflicting Trauma!`);
    }

    fireballJutsu(user, target, scene) {
        let damage = Math.round(Math.random() * 4) + 3;
        damage *= user.shadowCloneMultiplier;
        target.hp -= damage;
        target.statusEffects.push(new StatusEffect("Burned", 3));
        scene.updateOutput(`${user.name} casts Fireball Jutsu on ${target.name} for ${damage} damage, inflicting Burned!`);
    }

    flameThrowJutsu(user, target, scene) {
        let damage = Math.round(Math.random() * 5) + 5;
        damage *= user.shadowCloneMultiplier;
        target.hp -= damage;
        target.statusEffects.push(new StatusEffect("Burned", 3));
        scene.updateOutput(`${user.name} casts Flame Throw Jutsu on ${target.name} for ${damage} damage, inflicting Burned!`);
    }

    healingStance(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Healing", 3));
        scene.updateOutput(`${user.name} enters Healing Stance!`);
    }

    raikiri(user, target, scene) {
        let damage = Math.round(Math.random() * 4) + 4;
        damage *= user.shadowCloneMultiplier;
        target.hp -= damage;
        target.statusEffects.push(new StatusEffect("Stunned", 1));
        scene.updateOutput(`${user.name} uses Raikiri on ${target.name} for ${damage} damage, inflicting Stunned!`);
    }

    shadowCloneJutsu(user, target, scene) {
        user.statusEffects.push(new StatusEffect("ShadowCloneEffect", 3));
        user.shadowCloneMultiplier = 2;
        scene.updateOutput(`${user.name} casts Shadow Clone Jutsu, creating clones!`);
    }

    bite(user, target, scene) {
        let damage = 5;
        damage *= user.shadowCloneMultiplier;
        target.hp -= damage;
        scene.updateOutput(`${user.name} uses Wild Dog Bite on ${target.name} for ${damage} damage!`);
    }

    kawarami(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Kawarami", 2));
        scene.updateOutput(`${user.name} prepares Kawarami!`);
    }

    rockBarrierJutsu(user, target, scene) {
        user.statusEffects.push(new StatusEffect("Rock Barrier", 3));
        scene.updateOutput(`${user.name} casts Rock Barrier Jutsu!`);
    }

    impendingDoom(user, target, scene) {
        target.statusEffects.push(new StatusEffect("Trauma", 3));
        scene.updateOutput(`${user.name} casts Impending Doom on ${target.name}, inflicting Trauma!`);
    }

    boulderCrush(user, target, scene) {
        let damage = Math.round(Math.random() * 5) + 5;
        damage *= user.shadowCloneMultiplier;
        target.hp -= damage;
        scene.updateOutput(`${user.name} casts Boulder Crush on ${target.name} for ${damage} damage!`);
    }
}

class BattleScene {
    constructor() {
        this.skills = new Skills();
        this.chosenStyles = [];
        this.chosenSkills = [];
    }

    updateOutput(text) {
        game.output.push(text);
        document.getElementById("output").innerText = game.output.join("\n");
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    }

    updateStatus() {
        let playerEffects = game.player.statusEffects.map(e => e.name[0]).join("");
        let enemyEffects = game.enemy ? game.enemy.statusEffects.map(e => e.name[0]).join("") : "";
        document.getElementById("player-status").innerText = `Player: ${game.player.hp}/${game.player.maxHp}${playerEffects ? " (" + playerEffects + ")" : ""}`;
        document.getElementById("enemy-status").innerText = game.enemy ? `${game.enemy.name}: ${game.enemy.hp}/${game.enemy.maxHp}${enemyEffects ? " (" + enemyEffects + ")" : ""}` : "Enemy: 0/0";
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
            button.setAttribute("onclick", `selectSkill('${skill.name}')`);
            controls.appendChild(button);
        });
        this.updateStatus();
    }

    startBattle() {
        game.enemy = this.generateEnemy();
        game.enemy.hp = Math.round(Math.random() * 5) + 15;
        game.enemy.maxHp = game.enemy.hp;
        game.enemy.ninjaStyles = { Fire: "C-Rank", Lightning: "C-Rank", Illusion: "C-Rank", Earth: "C-Rank", Feral: "C-Rank" };
        game.enemy.skills = this.skills.skills.filter(s => this.skills.canUseSkill(game.enemy, s)).sort(() => Math.random() - 0.5).slice(0, 5);
        this.updateOutput(`\nBattle ${game.battleNum}: ${game.player.name} vs. ${game.enemy.name}!`);
        setTimeout(() => this.playerTurn(), 1000);
    }

    generateEnemy() {
        let names = ["Rogue Ninja", "Wild Dog", "Enemy Shinobi", "Bandit", "Shadow Clone"];
        let name = names[Math.floor(Math.random() * names.length)];
        return new Mob(name, 0, 0, {}, [], []);
    }

    rankUpBStyle(player) {
        let cRankStyles = Object.keys(player.ninjaStyles).filter(style => player.ninjaStyles[style] === "C-Rank");
        if (cRankStyles.length >= 2) {
            let style = cRankStyles[Math.floor(Math.random() * cRankStyles.length)];
            player.ninjaStyles[style] = "B-Rank";
            return `Player ranks up ${style} to B-Rank!`;
        }
        return null;
    }

    applyStatusEffects(mob, scene) {
        let newEffects = [];
        mob.statusEffects.forEach(effect => {
            if (effect.name === "Burned") {
                mob.hp -= 2;
                scene.updateOutput(`${mob.name} takes 2 damage from Burned!`);
            } else if (effect.name === "Healing") {
                mob.hp = Math.min(mob.hp + 2, mob.maxHp);
                scene.updateOutput(`${mob.name} heals 2 HP from Healing!`);
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
            this.updateOutput("Player has been defeated! Game Over!");
            document.getElementById("controls").innerHTML = `<button onclick="startGame()">Restart Game</button>`;
            return;
        }
        if (game.enemy && game.enemy.hp > 0) {
            let stunned = game.player.statusEffects.some(e => e.name === "Stunned");
            if (!stunned) {
                let skill = game.player.skills[Math.floor(Math.random() * game.player.skills.length)];
                skill.skillFunction(game.player, game.enemy, this);
            } else {
                this.updateOutput(`${game.player.name} is Stunned and cannot act!`);
                game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "Stunned");
            }
            setTimeout(() => this.enemyTurn(), 1000);
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
            this.updateOutput(`${game.player.name} uses Kawarami to evade!`);
            game.player.statusEffects = game.player.statusEffects.filter(e => e.name !== "Kawarami");
            setTimeout(() => this.playerTurn(), 1000);
        } else {
            let stunned = game.enemy.statusEffects.some(e => e.name === "Stunned");
            if (!stunned) {
                let skill = game.enemy.skills[Math.floor(Math.random() * game.enemy.skills.length)];
                skill.skillFunction(game.enemy, game.player, this);
            } else {
                this.updateOutput(`${game.enemy.name} is Stunned and cannot act!`);
                game.enemy.statusEffects = game.enemy.statusEffects.filter(e => e.name !== "Stunned");
            }
            setTimeout(() => this.playerTurn(), 1000);
        }
        this.updateStatus();
    }

    endBattle() {
        if (game.player.hp <= 0) {
            this.updateOutput("Player has been defeated! Game Over!");
            document.getElementById("controls").innerHTML = `<button onclick="startGame()">Restart Game</button>`;
            return;
        }
        this.updateOutput(`${game.enemy.name} has been defeated!`);
        game.battleNum++;
        game.enemy = null;
        setTimeout(() => this.chooseSkillCard(), 1000);
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
        game.enemy.skills = this.skills.skills.filter(s => this.skills.canUseSkill(game.enemy, s)).sort(() => Math.random() - 0.5).slice(0, 5);
        this.updateOutput(`\nBattle ${game.battleNum}: ${game.player.name} vs. ${game.enemy.name}!`);
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
    document.getElementById("output").innerText = game.output.join("\n");
    let barrageSkill = new Skills().findSkill("Barrage");
    if (barrageSkill) {
        game.player.skills = [barrageSkill];
    } else {
        game.output.push("Error: Barrage skill not found!");
        document.getElementById("output").innerText = game.output.join("\n");
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
        game.battleScene.updateOutput(`Player trains Ninja Style ${style} to C-Rank!`);
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
        game.battleScene.updateOutput(`Selected skill card: ${skill.name}`);
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
    game.battleScene.updateOutput(`Player gains new skill card: ${skill.name}!`);
    if (game.player.skills.length === 10) {
        game.battleScene.updateOutput("Congratulations, Player! You are a Genin Shinobi!");
        let rankUpMessage = game.battleScene.rankUpBStyle(game.player);
        if (rankUpMessage) game.battleScene.updateOutput(rankUpMessage);
        game.enemy = game.battleScene.generateEnemy();
        game.enemy.hp = 20;
        game.enemy.maxHp = 20;
        game.enemy.ninjaStyles = { Fire: "C-Rank", Lightning: "C-Rank", Illusion: "C-Rank", Earth: "C-Rank", Feral: "C-Rank" };
        game.enemy.skills = game.battleScene.skills.skills.filter(s => game.battleScene.skills.canUseSkill(game.enemy, s)).sort(() => Math.random() - 0.5).slice(0, 5);
        setTimeout(() => game.battleScene.startBattle(), 1000);
    } else {
        setTimeout(() => game.battleScene.continueGame(), 1000);
    }
                                    }
