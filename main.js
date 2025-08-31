let game = { gameState: "start", player: null, target: null, battleType: null };
let player;
let currentEnemy;

// Startup Functions
document.addEventListener("DOMContentLoaded", () => {
    startGame();
});

function startGame() {
    if (game.gameState === "tutorialComplete") {
        ArriveVillage(game.player.lastVillage || "Konoha");
        return;
    }
    let startScreen = document.getElementById("start-screen");
    startScreen.style.display = "block";
    startScreen.innerHTML = `
        <h1>Shinobi Way</h1>
        <button onclick="startTutorial()">Start Game</button>
    `;
}

function startTutorial() {
    let startScreen = document.getElementById("start-screen");
    startScreen.style.display = "none";
    let nameScreen = document.getElementById("name-selection");
    nameScreen.style.display = "block";
    nameScreen.innerHTML = `
        <h2>Enter Your Ninja Name:</h2>
        <input type="text" id="player-name">
        <button onclick="setPlayerName()">Submit</button>
    `;
}

function setPlayerName() {
    let name = document.getElementById("player-name").value;
    if (name) {
        player = new Character(name, 100);
        player.jutsu = [new Jutsu("Basic Punch", 10, 5, "None")]; // Default jutsu
        game.player = player;
        document.getElementById("name-selection").style.display = "none";
        document.getElementById("game-screen").style.display = "block";
        startTutorialFight();
    } else {
        alert("Please enter a name!");
    }
}

function startTutorialFight() {
    queueOutput("Welcome to the Shinobi Way! Let's begin your training.");
    const sparringDummy = new Character("Sparring Dummy", 50);
    game.battleType = "eventFight";
    game.user = player;
    game.target = sparringDummy;
    game.gameState = "inBattle";
    startBattle(sparringDummy);
}

// Battle Functions
function startBattle(enemy) {
    currentEnemy = enemy;
    game.target = enemy;
    const battleScreen = document.getElementById("battle-screen");
    const gameScreen = document.getElementById("game-screen");
    if (battleScreen && gameScreen) {
        battleScreen.style.display = "block";
        gameScreen.style.display = "none";
        displayJutsuOptions();
        updateBattleUI();
    } else {
        console.error("Missing UI elements: battle-screen or game-screen not found");
        queueOutput("Error: Game UI is missing. Please check setup.");
    }
}

function displayJutsuOptions() {
    const jutsuControls = document.getElementById("jutsu-controls");
    if (jutsuControls) {
        jutsuControls.innerHTML = "<h3>Select Jutsu</h3>";
        player.jutsu.forEach(jutsu => {
            jutsuControls.innerHTML += `<button onclick="selectJutsu('${jutsu.name}')">${jutsu.name}</button>`;
        });
    }
}

function selectJutsu(jutsuName) {
    const jutsu = player.jutsu.find(j => j.name === jutsuName);
    if (jutsu) {
        playerUseJutsu(jutsu);
    }
}

function playerUseJutsu(jutsu) {
    const damage = jutsu.power;
    game.target.hp -= damage;
    queueOutput(`${player.name} uses ${jutsu.name} for ${damage} damage!`);
    if (game.target.hp <= 0) {
        endBattle();
    } else {
        enemyUseJutsu();
    }
    updateBattleUI();
}

function enemyUseJutsu() {
    const damage = 10; // Enemy has no jutsu, fixed damage for tutorial
    game.user.hp -= damage;
    queueOutput(`${game.target.name} attacks for ${damage} damage!`);
    if (game.user.hp <= 0) {
        endBattle();
    }
    updateBattleUI();
}

function updateBattleUI() {
    const output = document.getElementById("battle-output");
    if (output) {
        output.innerHTML = `Player HP: ${game.user.hp} | Enemy HP: ${game.target.hp}`;
    }
}

function endBattle() {
    game.gameState = "postBattle";
    const battleScreen = document.getElementById("battle-screen");
    const gameScreen = document.getElementById("game-screen");
    const jutsuControls = document.getElementById("jutsu-controls");
    if (battleScreen && gameScreen) {
        battleScreen.style.display = "none";
        gameScreen.style.display = "block";
    }
    if (jutsuControls) jutsuControls.innerHTML = "";
    queueOutput("<span class='battle-ready'>Battle ended!</span>");
    if (game.target && game.target.hp <= 0) {
        queueOutput(`You defeated ${game.target.name}!`);
        if (game.battleType === "eventFight") {
            applyEventReward(game.target.name);
        } else {
            ArriveVillage(game.player.lastVillage || "Konoha");
        }
    } else if (game.user && game.user.hp <= 0) {
        queueOutput(`You were defeated by ${game.target.name}...`);
        ArriveVillage(game.player.lastVillage || "Konoha");
    }
    game.user = null;
    game.target = null;
}

const EventRewards = {
    "Sparring Dummy": {
        reward: () => {
            queueOutput("good!");
            game.gameState = "chooseStyles";
            initiateStyleSelection();
        }
    },
    "Default": {
        reward: () => queueOutput("No special reward for this fight.")
    }
};

function applyEventReward(enemyName) {
    const reward = EventRewards[enemyName] || EventRewards["Default"];
    reward.reward();
}

// RANKUP Functions
function initiateStyleSelection() {
    let styleControls = document.getElementById("style-controls");
    if (styleControls) {
        styleControls.style.display = "block";
        styleControls.innerHTML = `
            <h2>Choose Your Style</h2>
            <div id="style-buttons"></div>
        `;
        let controls = document.getElementById("style-buttons");
        let styles = ["Ninjutsu", "Genjutsu", "Taijutsu", "Fire", "Lightning", "Earth"];
        styles.forEach((style) => {
            let button = document.createElement("button");
            button.innerText = style;
            button.className = style.toLowerCase();
            button.onclick = () => selectStyle(style);
            controls.appendChild(button);
        });
    } else {
        console.error("style-controls element not found");
        queueOutput("Error: Style selection UI is missing.");
    }
}

function selectStyle(style) {
    player.style = style;
    queueOutput(`You have chosen ${style} Style!`);
    document.getElementById("style-controls").style.display = "none";
    performJutsuSelection(2, false, () => {
        game.gameState = "tutorialComplete";
        queueOutput("Tutorial complete! Begin your shinobi journey.");
        ArriveVillage(game.player.lastVillage || "Konoha");
    });
}

function performJutsuSelection(count, allowCancel, callback) {
    game.gameState = "selectJutsu";
    let eventControls = document.getElementById("event-controls");
    if (eventControls) {
        eventControls.style.display = "block";
        eventControls.innerHTML = `<h2>Choose Your Jutsu</h2>`;
        let availableJutsu = getAvailableJutsu();
        availableJutsu.forEach(jutsu => {
            eventControls.innerHTML += `<button onclick="selectJutsu('${jutsu.name}')">${jutsu.name}</button>`;
        });
        if (allowCancel) {
            eventControls.innerHTML += `<button onclick="cancelJutsuSelection()">Cancel</button>`;
        }
    }
    game.jutsuSelectionCallback = callback;
}

function selectJutsu(jutsuName) {
    let jutsu = getAvailableJutsu().find(j => j.name === jutsuName);
    if (jutsu) {
        player.jutsu = player.jutsu || [];
        player.jutsu.push(jutsu);
        queueOutput(`Learned ${jutsu.name}!`);
        document.getElementById("event-controls").style.display = "none";
        if (game.jutsuSelectionCallback) {
            game.jutsuSelectionCallback();
        }
    }
    game.gameState = "inArea";
}

function cancelJutsuSelection() {
    document.getElementById("event-controls").style.display = "none";
    if (game.jutsuSelectionCallback) {
        game.jutsuSelectionCallback();
    }
    game.gameState = "inArea";
}

function getAvailableJutsu() {
    const allJutsu = [
        new Jutsu("Fireball Jutsu", 20, 10, "Fire"),
        new Jutsu("Water Bullet", 18, 8, "Water"),
        new Jutsu("Thunder Strike", 22, 12, "Lightning"),
        new Jutsu("Shadow Clone", 15, 12, "Ninjutsu"),
        new Jutsu("Illusion Mist", 10, 8, "Genjutsu"),
        new Jutsu("Iron Fist", 18, 10, "Taijutsu")
    ];
    return player.style ? allJutsu.filter(jutsu => jutsu.type === player.style) : allJutsu;
}

// Log Functions
function queueOutput(message) {
    const output = document.getElementById("output") || document.getElementById("battle-output");
    if (output) {
        output.innerHTML += `<p>${message}</p>`;
    } else {
        console.error("Output element not found");
    }
}

// Map Functions
const MapData = {
    "Konoha": { areas: ["Training Grounds", "Forest"] }
};

function ArriveVillage(village) {
    game.gameState = "inVillage";
    game.player.lastVillage = village;
    queueOutput(`Arrived at ${village}!`);
    document.getElementById("game-screen").style.display = "block";
    document.getElementById("main-controls").style.display = "block";
    const controls = document.getElementById("main-controls");
    if (controls) {
        controls.innerHTML = `<button onclick="startEventFight()">Start Event Fight</button>`;
    }
}

function startEventFight() {
    queueOutput("Starting event fight...");
}
