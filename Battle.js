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
        game.enemy = enemy; // Sync enemy for UI
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
    console.log("Turn order determined:", { user: game.user.name, target: game.target.name });
    takeTurn(game.user);
}

function takeTurn(user) {
    if (game.user.hp <= 0 || game.target.hp <= 0) {
        endBattle();
        return;
    }
    game.user = user;
    game.target = (user === game.user) ? game.target : game.user; // Ensure target is correct
    queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span>'s turn`);
    startEffectCheck(user);
    if (user.hp > 0) {
        skillAction(user);
    }
}

function startEffectCheck(user) {
    user.statusEffects.forEach(effect => {
        if (effect.startOfTurn && effect.startOfTurnFunction) {
            let endTurn = effect.startOfTurnFunction(user, game.target, game.battleScene);
            if (endTurn) {
                endTurn();
                return; // Exit early if effect ends turn
            }
        }
    });
    if (user.statusEffects.some(e => e.name === "Numb" && e.startOfTurnFunction)) {
        user.statusEffects.find(e => e.name === "Numb").startOfTurnFunction(user, game.target, game.battleScene);
        user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb");
        endTurn();
        return; // Exit early if Numbed
    }
    // Continue to skill action if not Numbed
}

function deathCheck() {
    updateStatus(); // Ensure UI reflects current HP
    if (game.user.hp <= 0) {
        queueOutput(`<span class='output-text-${game.user === game.player ? 'player' : 'enemy'}'>${game.user.name}</span> has been defeated! <span class='output-text-${game.target === game.player ? 'player' : 'enemy'}'>${game.target.name}</span> wins!`);
        endBattle();
    } else if (game.target.hp <= 0) {
        queueOutput(`<span class='output-text-${game.target === game.player ? 'player' : 'enemy'}'>${game.target.name}</span> has been defeated! <span class='output-text-${game.user === game.player ? 'player' : 'enemy'}'>${game.user.name}</span> wins!`);
        endBattle();
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
        skill.skillFunction(user, game.target, game.battleScene);
    } else {
        activeEffectCheck(user);
        triggeredEffectCheck(user, game.target, skill.style); // Pass skill style
        try {
            skill.skillFunction(user, game.target, game.battleScene);
        } catch (e) {
            console.error("Error in skill execution:", e);
            queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> encountered an error with ${skill.name}!`);
        }
    }
    deathCheck();
    endTurn();
}

function activeEffectCheck(user) {
    user.statusEffects.forEach(effect => {
        if (effect.active && effect.activeFunction) {
            effect.activeFunction(user, game.target, game.battleScene);
        }
    });
}

function triggeredEffectCheck(user, target, skillStyle) {
    target.statusEffects.forEach(effect => {
        if (effect.triggered && effect.triggeredFunction) {
            let endSkill = effect.triggeredFunction(user, target, game.battleScene, skillStyle);
            if (endSkill) return; // End skill early if function returns true
        }
    });
}

function endTurn() {
    let temp = game.user;
    game.user = game.target;
    game.target = temp;
    updateStatus(); // Sync UI after swap
    setTimeout(() => takeTurn(game.user), 2000); // Directly start next turn
}

function endBattle() {
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
        }
    } else if (game.user.hp <= 0) {
        ArriveVillage(game.user.lastVillage);
    }
    game.user = null; // Clear to prevent stale data
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
