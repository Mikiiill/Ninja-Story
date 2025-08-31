// startup.js (Using your latest version with special Dummy)
let game = {
    player: {
        name: "Shinobi",
        hp: 10,
        maxHp: 10,
        Rank: "Student",
        ninjaStyles: { Ninjutsu: "D-Rank", Taijutsu: "D-Rank", Genjutsu: "D-Rank" },
        skills: [new Skills().findSkill("Barrage"), new Skills().findSkill("Barrage")],
        skillInventory: [],
        statusEffects: [],
        lastVillage: "Newb Village"
    },
    user: null,
    target: null,
    enemy: null,
    battleNum: 1,
    output: [],
    gameState: "start",
    battleScene: null,
    outputQueue: [],
    isOutputting: false
};

game.asciiMap = {
    "Burn": "🔥",
    "Numb": "⚡️",
    "Bleed": "🩸",
    "Regen": "🌿",
    "Doom": "💀",
    "ShadowCloneEffect": "👥",
    "Substitution": "🪵",
    "DoubleImage": "🌫️",
    "Dome": "🪨",
    "READY": "",
    "Release": "🌀"
};

function resetGameState() {
    if (game.gameState === "new") {
        game = {
            player: {
                name: "Shinobi",
                hp: 10,
                maxHp: 10,
                Rank: "Student",
                ninjaStyles: { Ninjutsu: "D-Rank", Taijutsu: "D-Rank", Genjutsu: "D-Rank" },
                skills: [new Skills().findSkill("Barrage"), new Skills().findSkill("Barrage")],
                skillInventory: [],
                statusEffects: [],
                lastVillage: "Newb Village"
            },
            user: null,
            target: null,
            enemy: null,
            battleNum: 1,
            output: [],
            gameState: "start",
            battleScene: null,
            outputQueue: [],
            isOutputting: false
        };
        document.getElementById("output").innerHTML = "Welcome to ShinobiWay!";
        document.getElementById("start-controls").innerHTML = '<button class="start-button" id="start-button" onclick="startGame()">Start Game</button>';
        document.getElementById("style-controls").style.display = "none";
        document.getElementById("jutsu-controls").style.display = "none";
        document.getElementById("skill-controls").style.display = "none";
        document.getElementById("main-controls").style.display = "none";
        document.getElementById("travel-controls").style.display = "none";
        updateStatus();
    }
}

function queueOutput(text) {
    game.outputQueue.push(text);
    if (!game.isOutputting) processOutputQueue();
}

function processOutputQueue() {
    if (game.outputQueue.length === 0) {
        game.isOutputting = false;
        return;
    }
    game.isOutputting = true;
    let text = game.outputQueue.shift();
    game.output.push(text);
    document.getElementById("output").innerHTML = game.output.join("<br>");
    document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
    setTimeout(processOutputQueue, 1000);
}

function updateStatus() {
    let playerEffects = [...new Set(game.player.statusEffects.map(e => `<span class="status-${e.name.toLowerCase().replace(" ", "")}">${game.asciiMap[e.name] || ""}</span>`))].join("");
    document.getElementById("player-status").innerHTML = `${game.player.name} [HP: <span class="player-hp">${game.player.hp}/${game.player.maxHp}</span>] ${playerEffects}`;
    let enemyEffects = game.enemy ? [...new Set(game.enemy.statusEffects.map(e => `<span class="status-${e.name.toLowerCase().replace(" ", "")}">${game.asciiMap[e.name] || ""}</span>`))].join("") : "";
    document.getElementById("enemy-status").innerHTML = game.enemy ? `${game.enemy.name} [HP: <span class="enemy-hp">${game.enemy.hp}/${game.enemy.maxHp}</span>] ${enemyEffects}` : "Enemy [HP: <span class='enemy-hp'>0/0</span>]";
}

function updateSkillCount() {
    let totalCards = game.player.skills.length + game.player.skillInventory.length;
    if (totalCards >= 10 && game.player.Rank === "Student") {
        game.player.Rank = "Genin";
        queueOutput("<span class='battle-ready'>Promoted to Genin!</span>");
    }
}

function startTutorialFight() {
    game.battleType = "tutorial";
    game.enemy = generateSpecialTutorialDummy(); // Use special Dummy
    startBattle(game.player, game.enemy);
    game.battleScene.onEnd = () => endTutorial();
}

function startGame() {
    let playerName = prompt("Enter your name, future shinobi:");
    if (playerName) {
        game.player.name = playerName;
    } else {
        game.player.name = "Shinobi";
    }
    startTutorialFight();
}

function generateSpecialTutorialDummy() {
    // Special Dummy with varied stats and skills
    return {
        name: "Special Training Dummy",
        hp: 6, // Fixed to 6 HP
        maxHp: 6,
        skills: [new Skills().findSkill("Healing Stance"), new Skills().findSkill("Bite")],
        skillInventory: [],
        statusEffects: [{ name: "Burn", duration: 2, effect: (target) => target.hp = Math.max(0, target.hp - 1) }],
        lastVillage: "Newb Village"
    };
}

function endTutorial() {
    queueOutput(`${game.player.name}! Graduation is soon, demonstrate your abilities to your Teacher.`);
    showStyleSelect();
}

function showStyleSelect() {
    document.getElementById("style-controls").style.display = "flex";
    document.getElementById("style-controls").innerHTML = `
        <button class="ninjutsu" onclick="selectStyle('Ninjutsu')">Ninjutsu</button>
        <button class="taijutsu" onclick="selectStyle('Taijutsu')">Taijutsu</button>
        <button class="genjutsu" onclick="selectStyle('Genjutsu')">Genjutsu</button>
    `;
}

function selectStyle(style) {
    game.player.ninjaStyles[style] = "C-Rank";
    queueOutput(`Selected ${style} style upgraded to C-Rank!`);
    showSkillSelect();
}

function showSkillSelect() {
    document.getElementById("skill-controls").style.display = "flex";
    document.getElementById("skill-controls").innerHTML = `
        <button class="skills-button" onclick="selectSkill('Barrage')">Barrage</button>
        <button class="skills-button" onclick="selectSkill('Healing Stance')">Healing Stance</button>
        <button class="skills-button" onclick="selectSkill('Bite')">Bite</button>
        <button class="skills-button" onclick="selectSkill('Substitution Jutsu')">Substitution Jutsu</button>
    `;
    queueOutput("Train and learn 10 skills before you are ready to become a Genin.");
}

function selectSkill(skillName) {
    let skill = new Skills().findSkill(skillName);
    if (skill && game.player.skills.length < 4) {
        game.player.skills.push(skill);
        queueOutput(`Added ${skillName} to skills!`);
        if (game.player.skills.length >= 2) {
            arriveVillage();
        }
    }
}

function arriveVillage() {
    document.getElementById("style-controls").style.display = "none";
    document.getElementById("skill-controls").style.display = "none";
    document.getElementById("travel-controls").style.display = "flex";
    document.getElementById("travel-controls").innerHTML = `<button class="travel-button" onclick="startTravel()">Travel</button>`;
    queueOutput("You have arrived at Newb Village. Prepare to travel!");
}

function startTravel() {
    game.gameState = "travel";
    document.getElementById("travel-controls").style.display = "none";
    document.getElementById("main-controls").style.display = "flex";
    queueOutput("Traveling... Encountering a random Genin!");
    // Placeholder for Travel Genin battle
}

function initializeGame() {
    if (game.gameState === "new") resetGameState();
}

document.addEventListener('DOMContentLoaded', initializeGame);
