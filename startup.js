// startup.js
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

// Clean reset function
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
    document.getElementById("start-controls").innerHTML = '<button class="start-button" id="start-button" onclick="startTutorial()">Start Game</button>';
    document.getElementById("style-controls").innerHTML = "";
    document.getElementById("jutsu-controls").innerHTML = "";
    document.getElementById("skill-controls").innerHTML = "";
    document.getElementById("main-controls").innerHTML = "";
    document.getElementById("travel-controls").innerHTML = "";
    updateStatus();
}

// Simplified output queue
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
    let outputDiv = document.getElementById("output");
    if (outputDiv) {
        outputDiv.innerHTML = game.output.join("<br>");
        outputDiv.scrollTop = outputDiv.scrollHeight;
    }
    setTimeout(processOutputQueue, 1000); // Maintain paced output
}

// Status update
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
    startBattle(game.player, game.enemy);
}

function startTutorial() {
    // Step 1: Get player name directly
    game.player.name = prompt("Enter your name, future shinobi:") || "Shinobi";

    // Step 2: Display graduation message immediately
    let outputDiv = document.getElementById("output");
    if (outputDiv) {
        outputDiv.innerHTML += `<br><span class='output-text-neutral'>${game.player.name}! Graduation is soon, demonstrate your abilities to your Teacher.</span>`;
        outputDiv.scrollTop = outputDiv.scrollHeight;
    } else {
        console.error("Output div not found");
    }
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

function initializeGame() {
    resetGameState();
}

initializeGame();
