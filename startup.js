// startup.js
let game = {
    player: {
        name: "Shinobi",
        hp: 10,
        maxHp: 10,
        Rank: "Student",
        ninjaStyles: { Ninjutsu: "D-Rank", Taijutsu: "D-Rank", Genjutsu: "D-Rank" }, // Start with only basic non-elemental styles
        skills: [new Skills().findSkill("Barrage"), new Skills().findSkill("Barrage")], // Start with 2 Barrage in active skills
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
    document.getElementById("start-controls").innerHTML = '<button class="start-button" id="start-button" onclick="startTutorial()">Start Game</button>'; // Ensure button is added
    document.getElementById("style-controls").innerHTML = "";
    document.getElementById("jutsu-controls").innerHTML = "";
    document.getElementById("skill-controls").innerHTML = "";
    document.getElementById("main-controls").innerHTML = "";
    document.getElementById("travel-controls").innerHTML = "";
    updateStatus();
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
    game.enemy = generateTrainingEnemy();
    startBattle(game.player, game.enemy); // Calls Battle.js function
}

function startTutorial() {
    // Step 1: Get player name
    let playerName = prompt("Enter your name, future shinobi:");
    if (playerName) {
        game.player.name = playerName;
    } else {
        game.player.name = "Shinobi";
    }
    // Step 2: Hardcode next step immediately after name prompt
    queueOutput(`${game.player.name}! Graduation is soon, demonstrate your abilities to your Teacher.`);
}

function generateTrainingEnemy() {
    return {
        name: "Training Dummy",
        hp: 10,
        maxHp: 10,
        skills: [new Skills().findSkill("Healing Stance")],
        skillInventory: [],
        statusEffects: [],
        lastVillage: "Newb Village"
    };
}

// Simplified initialization to ensure button presence
function initializeGame() {
    resetGameState(); // Moved button addition to resetGameState
}

initializeGame();
