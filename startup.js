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

// Overkill reset with retries
function resetGameState() {
    try {
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
        let outputDiv = document.getElementById("output");
        if (outputDiv) {
            outputDiv.innerHTML = "Welcome to ShinobiWay!";
        } else {
            console.error("Output div not found, creating it");
            document.body.innerHTML += '<div class="output" id="output">Welcome to ShinobiWay!</div>';
        }
        document.getElementById("start-controls").innerHTML = '<button class="start-button" id="start-button" onclick="startTutorial()">Start Game</button>';
        ["style-controls", "jutsu-controls", "skill-controls", "main-controls", "travel-controls"].forEach(id => {
            let elem = document.getElementById(id);
            if (elem) {
                elem.innerHTML = "";
                if (id === "travel-controls") elem.style.display = "none";
            } else {
                console.warn(`Element ${id} missing, skipping`);
            }
        });
        updateStatus();
    } catch (e) {
        console.error("Reset failed:", e);
        setTimeout(resetGameState, 1000);
    }
}

// Insane output system with multiple methods
function queueOutput(text) {
    try {
        game.outputQueue.push(text);
        if (!game.isOutputting) processOutputQueue();
    } catch (e) {
        console.error("QueueOutput failed:", e);
        forceOutput(text);
    }
}

function processOutputQueue() {
    try {
        if (game.outputQueue.length === 0) {
            game.isOutputting = false;
            return;
        }
        game.isOutputting = true;
        let text = game.outputQueue.shift();
        let outputDiv = document.getElementById("output");
        if (outputDiv) {
            game.output.push(text);
            outputDiv.innerHTML = game.output.join("<br>");
            outputDiv.scrollTop = outputDiv.scrollHeight;
        } else {
            console.error("Output div missing, forcing alert");
            alert(text);
        }
        setTimeout(processOutputQueue, 500);
    } catch (e) {
        console.error("ProcessOutputQueue failed:", e);
        setTimeout(processOutputQueue, 1000);
    }
}

function forceOutput(text) {
    try {
        let outputDiv = document.getElementById("output");
        if (outputDiv) {
            outputDiv.innerHTML += "<br>" + text;
            outputDiv.scrollTop = outputDiv.scrollHeight;
        } else {
            document.body.innerHTML += `<div class="output" id="output">${text}</div>`;
        }
        alert(text); // Backup alert
    } catch (e) {
        console.error("forceOutput failed:", e);
        setTimeout(() => forceOutput(text), 1000);
    }
}

function updateStatus() {
    try {
        let playerEffects = [...new Set(game.player.statusEffects.map(e => `<span class="status-${e.name.toLowerCase().replace(" ", "")}">${game.asciiMap[e.name] || ""}</span>`))].join("");
        document.getElementById("player-status").innerHTML = `${game.player.name} [HP: <span class="player-hp">${game.player.hp}/${game.player.maxHp}</span>] ${playerEffects}`;
        let enemyEffects = game.enemy ? [...new Set(game.enemy.statusEffects.map(e => `<span class="status-${e.name.toLowerCase().replace(" ", "")}">${game.asciiMap[e.name] || ""}</span>`))].join("") : "";
        document.getElementById("enemy-status").innerHTML = game.enemy ? `${game.enemy.name} [HP: <span class="enemy-hp">${game.enemy.hp}/${game.enemy.maxHp}</span>] ${enemyEffects}` : "Enemy [HP: <span class='enemy-hp'>0/0</span>]";
    } catch (e) {
        console.error("UpdateStatus failed:", e);
        setTimeout(updateStatus, 500);
    }
}

function updateSkillCount() {
    try {
        let totalCards = game.player.skills.length + game.player.skillInventory.length;
        if (totalCards >= 10 && game.player.Rank === "Student") {
            game.player.Rank = "Genin";
            queueOutput("<span class='battle-ready'>Promoted to Genin!</span>");
        }
    } catch (e) {
        console.error("UpdateSkillCount failed:", e);
    }
}

function startTutorialFight() {
    try {
        game.battleType = "tutorial";
        game.enemy = generateTrainingEnemy();
        startBattle(game.player, game.enemy);
    } catch (e) {
        console.error("startTutorialFight failed:", e);
    }
}

function startTutorial() {
    try {
        // Step 1: Get player name with insane retry logic
        let playerName = null;
        let attempts = 0;
        const maxAttempts = 5;
        while (attempts < maxAttempts && !playerName) {
            playerName = prompt("Enter your name, future shinobi:");
            if (!playerName) {
                console.warn("No name entered, attempt", attempts + 1);
                attempts++;
                if (attempts === maxAttempts) {
                    playerName = "Shinobi";
                    console.log("Forced name to Shinobi after", maxAttempts, "attempts");
                } else {
                    setTimeout(() => {}, 500); // Artificial delay to prevent loop lock
                }
            }
        }
        if (playerName) {
            game.player.name = playerName;
        } else {
            game.player.name = "Shinobi";
        }
        console.log("Name set to:", game.player.name);

        // Step 2: Hardcode next step - Display graduation message with every possible method
        let outputDiv = document.getElementById("output");
        if (outputDiv) {
            outputDiv.innerHTML += "<br><span class='output-text-neutral'>" + `${game.player.name}! Graduation is soon, demonstrate your abilities to your Teacher.` + "</span>";
            outputDiv.scrollTop = outputDiv.scrollHeight;
            console.log("Message added to output div");
        } else {
            console.error("Output div not found, creating it");
            document.body.innerHTML += '<div class="output" id="output"><br><span class="output-text-neutral">' + `${game.player.name}! Graduation is soon, demonstrate your abilities to your Teacher.` + "</span></div>";
        }
        queueOutput(`${game.player.name}! Graduation is soon, demonstrate your abilities to your Teacher.`);
        forceOutput(`${game.player.name}! Graduation is soon, demonstrate your abilities to your Teacher.`);
        alert(`${game.player.name}! Graduation is soon, demonstrate your abilities to your Teacher.`); // Last resort

        // Step 3: Pause before next step (optional, can remove if unwanted)
        setTimeout(() => {
            console.log("Moving to next step after delay");
        }, 1000);
    } catch (e) {
        console.error("startTutorial failed:", e);
        alert("Tutorial failed, retrying...");
        setTimeout(startTutorial, 2000);
    }
}

function generateTrainingEnemy() {
    try {
        return {
            name: "Training Dummy",
            hp: 10,
            maxHp: 10,
            skills: [new Skills().findSkill("Healing Stance")],
            skillInventory: [],
            statusEffects: [],
            lastVillage: "Newb Village"
        };
    } catch (e) {
        console.error("generateTrainingEnemy failed:", e);
        return { name: "Training Dummy", hp: 10, maxHp: 10, skills: [], skillInventory: [], statusEffects: [], lastVillage: "Newb Village" };
    }
}

// Initialize with retries
function initializeGame() {
    try {
        resetGameState();
        console.log("Game initialized successfully");
    } catch (e) {
        console.error("Initialize failed:", e);
        setTimeout(initializeGame, 1000);
    }
}

initializeGame();
