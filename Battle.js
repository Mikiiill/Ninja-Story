function startBattle(player, enemy) {
    try {
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
            console.log("[DEBUG]: startBattle enemy set to:", game.enemy);
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
    } catch (e) {
        console.error("[ERROR]: startBattle failed:", e);
    }
}

function determineTurnOrder(player, enemy) {
    try {
        let coinFlip = Math.random() < 0.5;
        game.user = coinFlip ? player : enemy;
        game.target = coinFlip ? enemy : player;
        queueOutput(`<span class='output-text-neutral'>${game.target.name} is off guard!</span>`);
        console.log("[DEBUG]: Turn order determined:", { user: game.user.name, target: game.target.name });
        takeTurn(game.user);
    } catch (e) {
        console.error("[ERROR]: determineTurnOrder failed:", e);
    }
}

function takeTurn(user) {
    try {
        console.log("[DEBUG]: Entering takeTurn for", user.name, { user: game.user, target: game.target, gameState: game.gameState });
        if (!game.user || !game.target || game.user.hp <= 0 || game.target.hp <= 0) {
            console.log("[DEBUG]: Battle end condition met, exiting takeTurn");
            endBattle();
            return;
        }
        game.user = user;
        game.target = (user === game.user) ? game.target : game.user;
        queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span>'s turn`);
        startEffectCheck(user);
    } catch (e) {
        console.error("[ERROR]: takeTurn failed:", e);
    }
}

function startEffectCheck(user) {
    try {
        console.log(`[DEBUG]: Checking startOfTurn effects for ${user.name}`, user.statusEffects);
        let allEffectsProcessed = true;
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
        if (allEffectsProcessed && user.hp > 0) {
            skillAction(user);
        } else {
            endTurn();
        }
    } catch (e) {
        console.error("[ERROR]: startEffectCheck failed:", e);
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
        console.error("[ERROR]: deathCheck failed:", e);
    }
}

function skillAction(user) {
    try {
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
            skill.skillFunction(user, game.target, game.battleScene);
        } else {
            activeEffectCheck(user);
            triggeredEffectCheck(user, game.target, skill.style);
            let skillResult = skill.skillFunction(user, game.target, game.battleScene);
            console.log("[DEBUG]: Skill", skill.name, "executed with result:", skillResult, "Status Effects:", user.statusEffects, game.target.statusEffects);
            updateStatus();
        }
        endTurn();
        deathCheck();
    } catch (e) {
        console.error("[ERROR]: skillAction failed:", e);
    }
}

function activeEffectCheck(user) {
    try {
        user.statusEffects.forEach(effect => {
            if (effect.active && effect.activeFunction) {
                effect.activeFunction(user, game.target, game.battleScene);
            }
        });
    } catch (e) {
        console.error("[ERROR]: activeEffectCheck failed:", e);
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
        console.error("[ERROR]: triggeredEffectCheck failed:", e);
    }
}

function endTurn() {
    try {
        console.log("[DEBUG]: Ending turn, scheduling next turn", { user: game.user, target: game.target, gameState: game.gameState });
        let temp = game.user;
        game.user = game.target;
        game.target = temp;
        updateStatus();
        setTimeout(() => takeTurn(game.user), 1000);
    } catch (e) {
        console.error("[ERROR]: endTurn failed:", e);
    }
}

function endBattle() {
    try {
        console.log("[DEBUG]: endBattle - gameState:", game.gameState, "target.hp:", game.target.hp, "target.name:", game.target.name, "battleType:", game.battleType);
        game.gameState = "postBattle";
        let controls = document.getElementById("main-controls");
        if (controls) controls.style.display = "block";
        document.getElementById("skill-controls").innerHTML = "";
        queueOutput("<span class='battle-ready'>Battle ended!</span>");
        if (game.target.hp <= 0) {
            if (game.battleType === "training") {
                performJutsuSelection(1, false, () => ArriveVillage(game.user.lastVillage));
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
            } else if (game.battleType === "eventFight" && game.target.name === "SparringDummy") {
                console.log("[DEBUG]: Event fight win, gameState:", game.gameState);
                applyEventReward(game.target.name);
            }
        } else if (game.user.hp <= 0) {
            ArriveVillage(game.user.lastVillage);
        }
        game.user = null;
        game.target = null;
    } catch (e) {
        console.error("[ERROR]: endBattle failed:", e);
    }
}

function startTravelFight() {
    try {
        game.battleType = "travel";
        startBattle(game.player, generateTravelEnemy());
    } catch (e) {
        console.error("[ERROR]: startTravelFight failed:", e);
    }
}

function generateTravelEnemy() {
    return {
        name: "Rabid Dog",
        hp: 8,
        maxHp: 8,
        skills: [new Skills().findSkill("Barrage")],
        skillInventory: [],
        statusEffects: [],
        lastVillage: game.player.lastVillage
    };
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
        console.log("[DEBUG]: Updating status", { user: game.user ? game.user.name : "null", target: game.target ? game.target.name : "null", userEffects: game.user ? game.user.statusEffects : [], targetEffects: game.target ? game.target.statusEffects : [], gameState: game.gameState });
        let playerStatus = document.getElementById("player-status");
        let enemyStatus = document.getElementById("enemy-status");
        if (playerStatus && enemyStatus && game.user && game.target) {
            playerStatus.innerHTML = `${game.user.name} [HP: <span class="player-hp">${game.user.hp}/${game.user.maxHp}</span>]`;
            enemyStatus.innerHTML = `${game.target.name} [HP: <span class="enemy-hp">${game.target.hp}/${game.target.maxHp}</span>]`;
        }
    } catch (e) {
        console.error("[ERROR]: Update status failed:", e);
    }
}

const EventRewards = {
    "SparringDummy": {
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
