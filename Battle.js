let game = {
    gameState: "initial",
    player: null,
    enemy: null,
    user: null,
    target: null,
    battleScene: null,
    battleType: null
};

function initializeGame() {
    game.player = {
        name: "Shinobi",
        hp: 10,
        maxHp: 10,
        skills: [],
        skillInventory: [],
        statusEffects: [],
        ninjaStyles: {},
        lastVillage: "Newb Village",
        exp: 0,
        maxExp: 10
    };
    // Wrap hp in Proxy for real-time updates
    game.player = new Proxy(game.player, {
        set(target, property, value) {
            if (property === "hp" && target[property] !== value) {
                target[property] = value;
                updateStatus();
            } else {
                target[property] = value;
            }
            return true;
        }
    });
    game.enemy = null;
    addInitialBarrageCards();
}

function addInitialBarrageCards() {
    let skillSet = new Skills();
    game.player.skillInventory = [skillSet.findSkill("Barrage"), skillSet.findSkill("Barrage")]; // Exactly 2 Barrage cards
}

function startBattle(player, enemy) {
    if (game.gameState !== "battle") {
        game.gameState = "battle";
        document.getElementById("skill-controls").innerHTML = "";
        let controls = document.getElementById("main-controls");
        if (controls) controls.style.display = "none";
        while (player.skills.length < 10 && player.skillInventory.length > 0) {
            let randIndex = Math.floor(Math.random() * player.skillInventory.length);
            player.skills.push(player.skillInventory.splice(randIndex, 1)[0]);
        }
        game.enemy = enemy;
        updateStatus();
        game.battleScene = { queueOutput: queueOutput };
        queueOutput("");
        queueOutput("<span class='battle-ready'>BATTLE BEGINS!</span>");
        queueOutput(`<span class='output-text-player'>${player.name}</span> vs. <span class='output-text-enemy'>${enemy.name}</span>`);
        queueOutput("");
        console.log("Starting battle with:", { player: player.name, enemy: enemy.name });
        setTimeout(() => determineTurnOrder(player, enemy), 1000);
    } else {
        queueOutput("<span class='output-text-neutral'>Battle already in progress!</span>");
    }
}

function determineTurnOrder(player, enemy) {
    let coinFlip = Math.random() < 0.5;
    game.user = coinFlip ? player : enemy;
    game.target = coinFlip ? enemy : player;
    queueOutput(`<span class='output-text-neutral'>${game.target.name} is off guard!</span>`);
    console.log("[DEBUG]: Turn order determined:", { user: game.user.name, target: game.target.name });
    takeTurn(game.user);
}

function takeTurn(user) {
    console.log("[DEBUG]: Entering takeTurn for", user.name, { user: game.user, target: game.target });
    if (!game.user || !game.target || game.user.hp <= 0 || game.target.hp <= 0) {
        console.log("[DEBUG]: Battle end condition met, exiting takeTurn");
        endBattle();
        return;
    }
    game.user = user;
    game.target = (user === game.user) ? game.target : game.user;
    queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span>'s turn`);
    startEffectCheck(user);
}

function startEffectCheck(user) {
    console.log(`[DEBUG]: Checking startOfTurn effects for ${user.name}`, user.statusEffects);
    let allEffectsProcessed = true;
    try {
        user.statusEffects.forEach(effect => {
            if (effect.startOfTurn && effect.startOfTurnFunction) {
                console.log(`[DEBUG]: Processing ${effect.name} for ${user.name}`);
                let endTurn = effect.startOfTurnFunction(user, game.target, game.battleScene);
                if (endTurn) allEffectsProcessed = false;
            }
        });
        if (user.statusEffects.some(e => e.name === "Numb" && e.startOfTurnFunction)) {
            console.log("[DEBUG]: Processing Numb for", user.name);
            user.statusEffects.find(e => e.name === "Numb").startOfTurnFunction(user, game.target, game.battleScene);
            user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb");
            allEffectsProcessed = false;
        }
    } catch (e) {
        console.error("[ERROR]: Start effect check failed:", e);
        allEffectsProcessed = false;
    }
    if (allEffectsProcessed && user.hp > 0) {
        skillAction(user);
    } else {
        endTurn();
    }
}

function deathCheck() {
    try {
        updateStatus();
        if (game.user.hp <= 0) {
            queueOutput(`<span class='output-text-${game.user === game.player ? 'player' : 'enemy'}'>${game.user.name}</span> has been defeated! <span class='output-text-${game.target === game.player ? 'player' : 'enemy'}'>${game.target.name}</span> wins!`);
            endBattle();
        } else if (game.target.hp <= 0) {
            queueOutput(`<span class='output-text-${game.target === game.player ? 'player' : 'enemy'}'>${game.target.name}</span> has been defeated! <span class='output-text-${game.user === game.player ? 'player' : 'enemy'}'>${game.user.name}</span> wins!`);
            endBattle();
        }
    } catch (e) {
        console.error("[ERROR]: Death check failed:", e);
    }
}

function skillAction(user) {
    let skillSet = new Skills();
    let skill = user.skills[Math.floor(Math.random() * user.skills.length)];
    if (!skill) {
        queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> has no skills to use!`);
        endTurn();
        return;
    }
    let isSupportSkill = skillSet.findSkill(skill.name)?.support || false;
    queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses ${skill.name}!`);
    if (isSupportSkill || skill.name === "Lightning Edge") {
        try {
            skill.skillFunction(user, game.target, game.battleScene);
        } catch (e) {
            console.error("[ERROR]: Support skill execution failed:", e);
            queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> encountered an error with ${skill.name}!`);
        }
    } else {
        activeEffectCheck(user);
        triggeredEffectCheck(user, game.target, skill.style);
        try {
            let skillResult = skill.skillFunction(user, game.target, game.battleScene);
            console.log("[DEBUG]: Skill", skill.name, "executed with result:", skillResult, "Status Effects:", user.statusEffects, game.target.statusEffects);
        } catch (e) {
            console.error("[ERROR]: Skill execution failed:", e);
            queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> encountered an error with ${skill.name}!`);
        }
    }
    endTurn();
    deathCheck();
}

function activeEffectCheck(user) {
    try {
        user.statusEffects.forEach(effect => {
            if (effect.active && effect.activeFunction) {
                effect.activeFunction(user, game.target, game.battleScene);
            }
        });
    } catch (e) {
        console.error("[ERROR]: Active effect check failed:", e);
    }
}

function triggeredEffectCheck(user, target, skillStyle) {
    try {
        target.statusEffects.forEach(effect => {
            if (effect.triggered && effect.triggeredFunction) {
                let endSkill = effect.triggeredFunction(user, target, game.battleScene, skillStyle);
                if (endSkill) return;
            }
        });
    } catch (e) {
        console.error("[ERROR]: Triggered effect check failed:", e);
    }
}

function endTurn() {
    console.log("[DEBUG]: Ending turn, scheduling next turn", { user: game.user, target: game.target });
    let temp = game.user;
    game.user = game.target;
    game.target = temp;
    try {
        updateStatus();
    } catch (e) {
        console.error("[ERROR]: Update status failed:", e);
    }
    setTimeout(() => takeTurn(game.user), 1000);
}

function endBattle() {
    game.gameState = "postBattle";
    let controls = document.getElementById("main-controls");
    if (controls) controls.style.display = "block";
    document.getElementById("skill-controls").innerHTML = "";
    queueOutput("<span class='battle-ready'>Battle ended!</span>");
    if (game.target.hp <= 0) {
        if (game.battleType === "training") {
            game.player.exp = Math.min(game.player.maxExp, game.player.exp + 1);
            queueOutput(`<span class='output-text-neutral'>Training fight completed! EXP: ${game.player.exp}/${game.player.maxExp}</span>`);
            if (game.player.exp === game.player.maxExp) {
                performJutsuSelection(1, false, () => ArriveVillage(game.player.lastVillage));
            } else {
                ArriveVillage(game.player.lastVillage);
            }
        } else if (game.battleType === "travel") {
            game.player.travelFightsCompleted = (game.player.travelFightsCompleted || 0) + 1;
            queueOutput(`<span class='output-text-neutral'>Travel fight completed! ${game.player.travelFightsCompleted}/4 fights done.</span>`);
            if (game.player.travelFightsCompleted < 4) {
                startTravelFight();
            } else {
                let targetIsVillage = MapData[game.player.lastVillage]?.areas.includes(game.target.lastVillage) ? false : true;
                if (targetIsVillage) {
                    game.player.lastVillage = game.target.lastVillage;
                    ArriveVillage(game.player.lastVillage);
                } else {
                    game.gameState = "inArea";
                    queueOutput(`<span class='output-text-neutral'>Arrived at ${game.target.lastVillage}! State set to inArea.</span>`);
                    let eventControls = document.getElementById("travel-controls");
                    eventControls.style.display = "flex";
                    eventControls.innerHTML = `<button onclick="startEventFight()">Start Event Fight</button><button onclick="talkToNPC()">Talk to NPC</button><button onclick="returnToVillage()">Return to ${game.player.lastVillage}</button>`;
                }
            }
        }
    } else if (game.user.hp <= 0) {
        ArriveVillage(game.user.lastVillage);
    }
    game.user = null;
    game.target = null;
}

function startTravelFight() {
    game.battleType = "travel";
    startBattle(game.player, generateTravelEnemy());
}

function generateTravelEnemy() {
    return {
        name: "Rabid Dog",
        hp: 8,
        maxHp: 8,
        skills: [new Skills().findSkill("Bite")],
        skillInventory: [],
        statusEffects: [],
        lastVillage: game.player.lastVillage,
        ninjaStyles: { Feral: "C-Rank" }
    };
}

function startTrainingFight() {
    game.battleType = "training";
    const trainingMobs = [
        { name: "Training Dummy", hp: 6, maxHp: 6, skills: [new Skills().findSkill("Healing Stance")], skillInventory: [], statusEffects: [], lastVillage: game.player.lastVillage },
        { name: "Thief", hp: 10, maxHp: 10, skills: [new Skills().findSkill("Barrage"), new Skills().findSkill("Barrage"), new Skills().findSkill("Substitution Jutsu")], skillInventory: [], statusEffects: [], lastVillage: game.player.lastVillage },
        { name: "Rabid Dog", hp: 8, maxHp: 8, skills: [new Skills().findSkill("Bite")], skillInventory: [], statusEffects: [], lastVillage: game.player.lastVillage, ninjaStyles: { Feral: "C-Rank" } }
    ];
    let randomMob = trainingMobs[Math.floor(Math.random() * trainingMobs.length)];
    startBattle(game.player, randomMob);
}

function startEventFight() {
    queueOutput("<span class='output-text-neutral'>Event fight started! (Placeholder)</span>");
}

function talkToNPC() {
    queueOutput("<span class='output-text-neutral'>Talking to NPC! (Placeholder)</span>");
}

function returnToVillage() {
    game.gameState = "In Village";
    ArriveVillage(game.player.lastVillage);
}

function queueOutput(text) {
    try {
        let log = document.getElementById("battle-log");
        if (log) log.innerHTML += `<p>${text}</p>`;
    } catch (e) {
        console.error("[ERROR]: Queue output failed:", e);
    }
}

function updateStatus() {
    try {
        console.log("[DEBUG]: Updating status", { user: game.user ? game.user.name : "null", target: game.target ? game.target.name : "null", userEffects: game.user ? game.user.statusEffects : [], targetEffects: game.target ? game.target.statusEffects : [] });
        let playerHp = document.getElementById("player-hp");
        let enemyHp = document.getElementById("enemy-hp");
        let log = document.getElementById("battle-log");
        if (playerHp && enemyHp && game.user && game.target) {
            playerHp.textContent = `${game.user.name} [HP: ${game.user.hp}/${game.user.maxHp}]`;
            enemyHp.textContent = `${game.target.name} [HP: ${game.target.hp}/${game.target.maxHp}]`;
            if (log) {
                log.innerHTML += `<p>Status - ${game.user.name}: HP ${game.user.hp}/${game.user.maxHp}, Effects: ${game.user.statusEffects.map(e => e.name).join(", ")}</p>`;
                log.innerHTML += `<p>Status - ${game.target.name}: HP ${game.target.hp}/${game.target.maxHp}, Effects: ${game.target.statusEffects.map(e => e.name).join(", ")}</p>`;
            }
        }
    } catch (e) {
        console.error("[ERROR]: Update status failed:", e);
    }
}

function ArriveVillage(village) {
    game.gameState = "In Village";
    game.player.hp = game.player.maxHp;
    game.player.statusEffects = [];
    game.player.lastVillage = village;
    let controls = document.getElementById("main-controls");
    if (controls) controls.style.display = "block";
    queueOutput(`Arrived at ${village}! HP restored, status effects cleared.`);
    console.log("[DEBUG]: Arrived at", village, "controls set up, gameState:", game.gameState);
                }
