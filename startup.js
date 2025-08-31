// startup.js (full file with changes)
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
    isOutputting: false,
    tutorialDone: false, // Track tutorial completion
    isTutorialBattle: false // Flag to control state during tutorial
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
            isOutputting: false,
            tutorialDone: false,
            isTutorialBattle: false
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
    if (game.enemy) {
        document.getElementById("enemy-status").innerHTML = `${game.enemy.name} [HP: <span class="enemy-hp">${game.enemy.hp}/${game.enemy.maxHp}</span>] ${enemyEffects}`;
    } else {
        document.getElementById("enemy-status").innerHTML = "Enemy [HP: <span class='enemy-hp'>0/0</span>]";
    }
}

function startTutorialFight() {
    game.battleType = "eventFight";
    game.enemy = SparringDummy; // Use the defined Sparring Dummy
    console.log("[DEBUG]: Starting tutorial fight with enemy:", game.enemy); // Debug enemy assignment
    game.gameState = "battle";
    startBattle(game.player, game.enemy);
    game.battleScene.onEnd = () => {
        if (game.target && game.target.hp <= 0 && !game.tutorialDone) {
            game.tutorialDone = true;
            queueOutput("good!"); // Test message
            game.gameState = "chooseStyles"; // Set state for style selection
            initiateStyleSelection(); // Trigger style selection
        }
    }

function startGame() {
    let playerName = prompt("Enter your name, future shinobi:");
    if (playerName) {
        game.player.name = playerName;
    } else {
        game.player.name = "Shinobi";
    }
    document.getElementById("graduation-message").innerHTML = `${game.player.name}! Graduation is soon, demonstrate your abilities to your Teacher.`;
    startTutorialFight();
}

// startup.js (update generateSpecialTutorialDummy and startTutorialFight)
function generateSpecialTutorialDummy() {
    return {
        name: "Sparring Dummy",
        hp: 6,
        maxHp: 6,
        skills: [new Skills().findSkill("Healing Stance"), new Skills().findSkill("Bite")],
        skillInventory: [],
        statusEffects: [{ name: "Burn", duration: 2, effect: (target) => target.hp = Math.max(0, target.hp - 1) }],
        lastVillage: "Newb Village"
    };
}

function showStyleSelect() {
    // Placeholder; not used, replaced by initiateStyleSelection
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
    if (!game.isTutorialBattle && game.gameState !== "postBattle" && game.gameState !== "battle") { // Prevent during tutorial or postBattle
        document.getElementById("style-controls").style.display = "none";
        document.getElementById("skill-controls").style.display = "none";
        document.getElementById("travel-controls").style.display = "flex";
        document.getElementById("travel-controls").innerHTML = `<button class="travel-button" onclick="startTravel()">Travel</button>`;
        queueOutput("You have arrived at Newb Village. Prepare to travel!");
        game.player.hp = game.player.maxHp;
        game.player.statusEffects = [];
        updateStatus();
        game.gameState = "In Village";
        game.isTutorialBattle = false; // Reset flag
    }
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
