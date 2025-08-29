// startup.js
let game = {
    player: {
        name: "Shinobi",
        hp: 10,
        maxHp: 10,
        Rank: "Student",
        ninjaStyles: { Ninjutsu: "D-Rank", Taijutsu: "D-Rank", Genjutsu: "D-Rank", Fire: "D-Rank", Lightning: "D-Rank", Earth: "D-Rank", Water: "D-Rank", Wind: "D-Rank", Feral: "D-Rank" },
        skills: [],
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
            ninjaStyles: { Ninjutsu: "D-Rank", Taijutsu: "D-Rank", Genjutsu: "D-Rank", Fire: "D-Rank", Lightning: "D-Rank", Earth: "D-Rank", Water: "D-Rank", Wind: "D-Rank", Feral: "D-Rank" },
            skills: [],
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
    document.getElementById("start-controls").innerHTML = ""; // Clear initially
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
    document.getElementById("player-status").innerHTML = `Shinobi [HP: <span class="player-hp">${game.player.hp}/${game.player.maxHp}</span>] ${playerEffects}`;
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

function startGame() {
    if (typeof initiateStyleSelection === 'function') {
        game.output = ["<span class='output-text-neutral'>Welcome to ShinobiWay, <span class='output-text-player'>Shinobi</span>! You can Rank Up 2 available Fighting Styles during Rank Up to unlock new Jutsu.</span>"];
        document.getElementById("output").innerHTML = game.output.join("<br>");
        game.gameState = "chooseStyles";
        initiateStyleSelection();
        updateSkillCount();
        let skillSet = new Skills();
        let barrageSkill = skillSet.findSkill("Barrage");
        if (barrageSkill) {
            game.player.skillInventory.push(barrageSkill);
            game.player.skillInventory.push(barrageSkill);
        }
        document.getElementById("start-controls").innerHTML = "";
    } else {
        queueOutput("<span class='error-log'>Error: initiateStyleSelection is not defined. Check console for details.</span>");
        console.error("initiateStyleSelection is not a function. Ensure RANKUP.js loaded correctly.");
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

// Wait for RANKUP.js to load
function initializeGame() {
    if (typeof initiateStyleSelection === 'function') {
        resetGameState();
        document.getElementById("start-controls").innerHTML = '<button class="start-button" id="start-button" onclick="startGame()">Start Game</button>';
    } else {
        setTimeout(initializeGame, 100); // Retry every 100ms
        console.log("Waiting for initiateStyleSelection... Check RANKUP.js loading.");
    }
}

initializeGame(); // Start the initialization loop
