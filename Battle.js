let game = window.game; // Reference the global game object from index.html

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
        game.enemy = new Proxy(enemy, {
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
            queueOutput(`<span class='output-text-neutral'>Travel fight completed! ${game.player.travelFightsCompleted}/4 fights done.</
