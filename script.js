let game = {
    player: { name: "Shinobi", hp: 10, maxHp: 10, Rank: "Student", ninjaStyles: { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" }, skills: [], skillInventory: [], statusEffects: [] },
    enemy: null,
    battleNum: 1,
    output: [],
    gameState: "start",
    battleScene: null,
    outputQueue: [],
    isOutputting: false
};

function log(msg) {
    const el = document.getElementById('log');
    el.innerHTML += '<br>' + msg;
}

class BattleScene {
    constructor() {
        this.chosenStyles = [];
        this.asciiMap = { Doom: "💀", Burn: "🔥", Bleed: "🩸", Healing: "🌿", Numb: "⚡️", ShadowCloneEffect: "👥", Substitution: "🪵", "Rock Barrier": "🪨" };
    }

    queueOutput(text) {
        game.outputQueue.push(text);
        if (!game.isOutputting) this.processOutputQueue();
    }

    processOutputQueue() {
        if (game.outputQueue.length === 0) {
            game.isOutputting = false;
            return;
        }
        game.isOutputting = true;
        let text = game.outputQueue.shift();
        game.output.push(text);
        document.getElementById("output").innerHTML = game.output.join("<br>");
        document.getElementById("output").scrollTop = document.getElementById("output").scrollHeight;
        setTimeout(() => this.processOutputQueue(), 1000);
    }

    chooseNinjaStyles() {
        log('Entering chooseNinjaStyles...');
        if (game.gameState !== "start" || this.chosenStyles.length >= 2) {
            log(`Exiting chooseNinjaStyles: gameState=${game.gameState}, chosenStyles.length=${this.chosenStyles.length}`);
            if (this.chosenStyles.length >= 2) {
                game.gameState = "chooseSkills";
                this.chooseStartingSkills();
            }
            return;
        }
        game.gameState = "chooseStyles";
        let styles = ["Fire", "Lightning", "Illusion", "Earth", "Feral"].filter(s => !this.chosenStyles.includes(s));
        log(`Available styles: ${styles.join(', ')}`);
        this.queueOutput("Choose two Ninja Styles to rank up to C-Rank:");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        if (styles.length === 0) {
            log('No styles left to choose, forcing next step...');
            game.gameState = "chooseSkills";
            this.chooseStartingSkills();
            return;
        }
        styles.forEach((style) => {
            let button = document.createElement("button");
            button.innerText = style;
            button.className = style.toLowerCase();
            button.onclick = () => selectStyle(style);
            controls.appendChild(button);
            log(`Added button for ${style}`);
        });
        this.updateStatus();
        log('chooseNinjaStyles completed, waiting for user input...');
    }

    chooseStartingSkills() {
        log('Entering chooseStartingSkills...');
        if (game.gameState !== "chooseSkills" || this.chosenSkills.length >= 4) {
            log(`Exiting chooseStartingSkills: gameState=${game.gameState}, chosenSkills.length=${this.chosenSkills.length}`);
            if (this.chosenSkills.length >= 4) {
                game.gameState = "battle";
                this.startBattle();
            }
            return;
        }
        this.queueOutput("Choose four starting skills (placeholder):");
        let controls = document.getElementById("controls");
        controls.innerHTML = "";
        log('chooseStartingSkills completed, waiting for user input...');
    }

    startBattle() {
        log('Starting battle...');
        if (game.gameState !== "battle") return;
        this.queueOutput("Battle begins! (Placeholder)");
        log('Battle started, awaiting player turn...');
    }

    updateStatus() {
        let playerEffects = game.player.statusEffects.map(e => `<span class="status-${e.name.toLowerCase().replace(" ", "")}">${this.asciiMap[e.name] || ""}</span>`).join("");
        document.getElementById("player-status").innerHTML = `Shinobi [HP: <span class="player-hp">${game.player.hp}/${game.player.maxHp}</span>] ${playerEffects}`;
        document.getElementById("enemy-status").innerHTML = game.enemy ? `${game.enemy.name} [HP: <span class="enemy-hp">${game.enemy.hp}/${game.enemy.maxHp}</span>]` : "Enemy [HP: <span class='enemy-hp'>0/0</span>]";
        document.getElementById("skill-count").innerText = `Skill cards: ${game.player.skills.length}`;
    }
}

function startGame() {
    log('Attempting to start game at ' + new Date().toLocaleTimeString() + '...');
    let now = Date.now();
    if (now - (window.lastClickTime || 0) < 1500) {
        log('Click too fast, ignoring...');
        return;
    }
    window.lastClickTime = now;

    const requiredElements = {
        output: document.getElementById("output"),
        controls: document.getElementById("controls"),
        playerStatus: document.getElementById("player-status"),
        enemyStatus: document.getElementById("enemy-status"),
        skillCount: document.getElementById("skill-count")
    };
    log('Checking DOM elements: ' + JSON.stringify(Object.fromEntries(Object.entries(requiredElements).map([k, v]) => [k, !!v]))));
    if (!requiredElements.output || !requiredElements.controls || !requiredElements.playerStatus || !requiredElements.enemyStatus || !requiredElements.skillCount) {
        log('Error: Missing required DOM elements!');
        requiredElements.output.innerHTML = "Error: Missing game elements. Check index.html!";
        return;
    }

    game.output = ["Train to become a Genin Shinobi! Collect 10 skill cards!"];
    game.player = { name: "Shinobi", hp: 10, maxHp: 10, Rank: "Student", ninjaStyles: { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" }, skills: [], skillInventory: [], statusEffects: [] };
    game.battleNum = 1;
    game.enemy = null;
    game.gameState = "start";
    game.outputQueue = [];
    game.isOutputting = false;
    requiredElements.output.innerHTML = game.output.join("<br>");
    log('Game initialized with state: ' + JSON.stringify({ hp: game.player.hp, Rank: game.player.Rank, gameState: game.gameState }));

    log('Creating BattleScene...');
    game.battleScene = new BattleScene();

    log('Scheduling chooseNinjaStyles...');
    game.battleScene.chooseNinjaStyles(); // Immediate call instead of setTimeout
}

function selectStyle(style) {
    let now = Date.now();
    if (now - (window.lastClickTime || 0) < 1500) return;
    window.lastClickTime = now;
    if (game.battleScene.chosenStyles.length < 2) {
        game.battleScene.chosenStyles.push(style);
        game.player.ninjaStyles[style] = "C-Rank";
        game.battleScene.queueOutput(`<span class="output-text-${style.toLowerCase()}">${style}</span> trained to C-Rank!`);
        document.getElementById("controls").innerHTML = "";
        if (game.battleScene.chosenStyles.length === 2) {
            game.gameState = "chooseSkills";
            game.battleScene.chooseStartingSkills();
        } else {
            game.battleScene.chooseNinjaStyles();
        }
    }
}
