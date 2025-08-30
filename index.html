<!DOCTYPE html>
<html>
<head>
    <title>ShinobiWay</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            background-image: url('https://mikiiill.github.io/ShinobiWay/Assets/Back.png');
            background-repeat: no-repeat;
            background-size: cover;
            background-color: #000;
            color: #fff;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100vh;
            overflow: hidden;
        }
        .output {
            width: 85%;
            height: 40vh;
            background-color: #333;
            overflow-y: auto;
            padding: 10px;
            margin: 10px;
            border: 2px solid #fff;
        }
        .controls {
            width: 80%;
            margin: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
        }
        .status {
            width: 80%;
            margin: 10px;
            padding: 10px;
            border: 2px solid #fff;
            background-color: #333;
        }
        button {
            background-color: #555;
            color: #fff;
            border: 2px solid #fff;
            padding: 15px 30px;
            font-size: 1.5rem;
            cursor: pointer;
            transition: background-color 0.3s;
            min-width: 150px;
            touch-action: manipulation;
        }
        button:hover {
            background-color: #777;
        }
        .name-input {
            width: 80%;
            padding: 10px;
            font-size: 1.2rem;
            margin-bottom: 10px;
            border: 2px solid #fff;
            background-color: #333;
            color: #fff;
        }
        .output-text-player { color: #00ff00; }
        .output-text-enemy { color: #ff00ff; }
        .output-text-neutral { color: #ccc; }
    </style>
</head>
<body>
    <div class="status" id="player-status">Shinobi [HP: <span class="player-hp">10/10</span>]</div>
    <div class="status" id="enemy-status">Enemy [HP: <span class="enemy-hp">0/0</span>]</div>
    <div class="output" id="output">Welcome to ShinobiWay!</div>
    <div class="controls" id="start-controls">
        <input type="text" id="name-input" class="name-input" placeholder="Enter your name, future shinobi">
        <button id="start-button" class="start-button" onclick="startTutorial()">Start Game</button>
    </div>
    <div class="controls" id="style-controls"></div>
    <div class="controls" id="jutsu-controls"></div>
    <div class="controls" id="skill-controls"></div>
    <div class="controls" id="main-controls"></div>
    <div class="controls" id="travel-controls" style="display:none;"></div>

    <script src="RANKUP.js"></script>
    <script src="Jutsu.js"></script>
    <script src="Characters.js"></script>
    <script src="Battle.js"></script>
    <script src="Log.js"></script>
    <script src="Map.js"></script>

    <script>
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
            let startControls = document.getElementById("start-controls");
            if (startControls) {
                let nameInput = startControls.querySelector("#name-input");
                let startButton = startControls.querySelector("#start-button");
                if (!nameInput || !startButton) {
                    startControls.innerHTML = '<input type="text" id="name-input" class="name-input" placeholder="Enter your name, future shinobi"><button id="start-button" class="start-button" onclick="startTutorial()">Start Game</button>';
                }
            }
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
            let outputDiv = document.getElementById("output");
            if (outputDiv) {
                outputDiv.innerHTML = game.output.join("<br>");
                outputDiv.scrollTop = outputDiv.scrollHeight;
            }
            setTimeout(processOutputQueue, 1000);
        }

        function updateStatus() {
            let playerEffects = [...new Set(game.player.statusEffects.map(e => `<span class="status-${e.name.toLowerCase().replace(" ", "")}">${game.asciiMap[e.name] || ""}</span>`))].join("");
            document.getElementById("player-status").innerHTML = `${game.player.name} [HP: <span class="player-hp">${game.player.hp}/${game.player.maxHp}</span>] ${playerEffects}`;
            let enemyEffects = game.enemy ? [...new Set(game.enemy.statusEffects.map(e => `<span class="status-${e.name.toLowerCase().replace(" ", "")}">${game.asciiMap[e.name] || ""}</span>`))].join("") : "";
            document.getElementById("enemy-status").innerHTML = game.enemy ? `${game.enemy.name} [HP: <span class="enemy-hp">${game.enemy.hp}/${game.player.maxHp}</span>] ${enemyEffects}` : "Enemy [HP: <span class='enemy-hp'>0/0</span>]";
        }

        function updateSkillCount() {
            let totalCards = game.player.skills.length + game.player.skillInventory.length;
            if (totalCards >= 10 && game.player.Rank === "Student") {
                game.player.Rank = "Genin";
                queueOutput("<span class='battle-ready'>Promoted to Genin!</span>");
            }
        }

        function startTutorialFight() {
            game.battleType = "event";
            game.enemy = {
                name: "Training Dummy",
                hp: 6,
                maxHp: 6,
                skills: [new Skills().findSkill("Healing Stance")],
                skillInventory: [],
                statusEffects: [],
                lastVillage: "Newb Village"
            };
            if (typeof startBattle === 'function') {
                startBattle(game.player, game.enemy);
            } else {
                console.error("startBattle not found");
            }
        }

        function startTutorial() {
            let nameInput = document.getElementById("name-input");
            if (nameInput) {
                game.player.name = nameInput.value.trim() || "Shinobi";
                let outputDiv = document.getElementById("output");
                if (outputDiv) {
                    outputDiv.innerHTML += `<br><span class='output-text-player'>${game.player.name}</span><span class='output-text-neutral'>! Graduation is soon, demonstrate your abilities to your Teacher.</span>`;
                    outputDiv.scrollTop = outputDiv.scrollHeight;
                }
                nameInput.value = ""; // Clear input
                startTutorialFight(); // Start event fight after graduation message
            } else {
                console.error("Name input not found");
            }
        }

        function initializeGame() {
            resetGameState();
        }

        document.addEventListener('DOMContentLoaded', initializeGame);
    </script>
</body>
</html>
