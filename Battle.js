// Battle.js
function startBattle(player, enemy) {
    if (game.gameState !== "battle") {
        game.gameState = "battle";
        document.getElementById("skill-controls").innerHTML = "";
        var controls = document.getElementById("main-controls");
        if (controls) controls.style.display = "none";
        while (player.skills.length < 10 && player.skillInventory.length > 0) {
            var randIndex = Math.floor(Math.random() * player.skillInventory.length);
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
        queueOutput("<span class='output-text-player'>" + player.name + "</span> vs. <span class='output-text-enemy'>" + enemy.name + "</span>");
        queueOutput("");
        setTimeout(function() { determineTurnOrder(player, enemy); }, 1000);
    } else {
        queueOutput("<span class='output-text-neutral'>Battle already in progress!</span>");
    }
}

function determineTurnOrder(player, enemy) {
    var coinFlip = Math.random() < 0.5;
    game.user = coinFlip ? player : enemy;
    game.target = coinFlip ? enemy : player;
    queueOutput("<span class='output-text-neutral'>" + game.target.name + " is off guard!</span>");
    takeTurn(game.user);
}

function takeTurn(user) {
    if (!game.user || !game.target || game.user.hp <= 0 || game.target.hp <= 0) {
        endBattle();
        return;
    }
    game.user = user;
    game.target = (user === game.user) ? game.target : game.user;
    queueOutput("<span class='output-text-" + (user === game.player ? "player" : "enemy") + "'>" + user.name + "</span>'s turn");
    startEffectCheck(user);
}

function startEffectCheck(user) {
    var allEffectsProcessed = true;
    try {
        user.statusEffects.forEach(function(effect) {
            if (effect.startOfTurn && effect.startOfTurnFunction) {
                var endTurn = effect.startOfTurnFunction(user, game.target, game.battleScene);
                if (endTurn) allEffectsProcessed = false;
            }
        });
    } catch (e) {
        queueOutput("<span class='output-text-" + (user === game.player ? "player" : "enemy") + "'>" + user.name + "</span> encountered an error with status effect!");
        allEffectsProcessed = false;
    }
    if (allEffectsProcessed && user.hp > 0) {
        skillAction(user);
    } else {
        endTurn();
    }
}

function deathCheck() {
    if (game.user.hp <= 0 || game.target.hp <= 0) {
        endBattle();
    }
}

function skillAction(user) {
    var skillSet = new Skills();
    var skill = user.skills[Math.floor(Math.random() * user.skills.length)];
    if (!skill) {
        queueOutput("<span class='output-text-" + (user === game.player ? "player" : "enemy") + "'>" + user.name + "</span> has no skills to use!");
        endTurn();
        return;
    }
    queueOutput("<span class='output-text-" + (user === game.player ? "player" : "enemy") + "'>" + user.name + "</span> uses " + skill.name + "!");
    if (skill.support || skill.name === "Lightning Edge") {
        try {
            skill.skillFunction(user, game.target, game.battleScene);
        } catch (e) {
            queueOutput("<span class='output-text-" + (user === game.player ? "player" : "enemy") + "'>" + user.name + "</span> encountered an error with " + skill.name + "!");
        }
    } else {
        try {
            var skillResult = skill.skillFunction(user, game.target, game.battleScene);
        } catch (e) {
            queueOutput("<span class='output-text-" + (user === game.player ? "player" : "enemy") + "'>" + user.name + "</span> encountered an error with " + skill.name + "!");
        }
    }
    endTurn();
    deathCheck();
}

function endTurn() {
    var temp = game.user;
    game.user = game.target;
    game.target = temp;
    updateStatus();
    setTimeout(function() { takeTurn(game.user); }, 1000);
}

function endBattle() {
    game.gameState = "postBattle";
    var controls = document.getElementById("main-controls");
    if (controls) controls.style.display = "block";
    document.getElementById("skill-controls").innerHTML = "";
    queueOutput("<span class='battle-ready'>Battle ended!</span>");
    if (game.battleType === "tutorial") {
        if (game.user.hp > 0) { // Win condition
            alert("What fighting styles have you been training?");
            initiateStyleSelection(); // Trigger style selection only after battle win
        }
    } else if (game.battleType === "travel") {
        game.player.travelFightsCompleted = (game.player.travelFightsCompleted || 0) + 1;
        queueOutput("<span class='output-text-neutral'>Travel fight completed! " + game.player.travelFightsCompleted + "/4 fights done.</span>");
        if (game.player.travelFightsCompleted >= 4) {
            var targetIsVillage = MapData[game.player.lastVillage].areas.indexOf(game.target.lastVillage) === -1;
            if (targetIsVillage) {
                game.player.lastVillage = game.target.lastVillage;
                ArriveVillage(game.player.lastVillage);
            } else {
                game.gameState = "inArea";
                queueOutput("<span class='output-text-neutral'>Arrived at " + game.target.lastVillage + "! State set to inArea.</span>");
                var eventControls = document.getElementById("travel-controls");
                eventControls.style.display = "flex";
                eventControls.innerHTML = "<button onclick='startEventFight()'>Start Event Fight</button><button onclick='talkToNPC()'>Talk to NPC</button><button onclick='returnToVillage()'>Return to " + game.player.lastVillage + "</button>";
            }
        } else {
            startTravelFight();
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
    return generateEnemy("Rabid Dog");
}

function startTrainingFight() {
    game.battleType = "training";
    var trainingMobs = ["Training Dummy", "Thief", "Rabid Dog"];
    var randomMob = trainingMobs[Math.floor(Math.random() * trainingMobs.length)];
    startBattle(game.player, generateEnemy(randomMob));
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
    var log = document.getElementById("battle-log");
    if (log) log.innerHTML += "<p>" + text + "</p>";
}

function updateStatus() {
    var playerHp = document.getElementById("player-hp");
    var enemyHp = document.getElementById("enemy-hp");
    var log = document.getElementById("battle-log");
    if (playerHp && enemyHp && game.user && game.target) {
        playerHp.textContent = game.user.name + " [HP: " + game.user.hp + "/" + game.user.maxHp + "]";
        enemyHp.textContent = game.target.name + " [HP: " + game.target.hp + "/" + game.target.maxHp + "]";
        if (log) {
            log.innerHTML += "<p>Status - " + game.user.name + ": HP " + game.user.hp + "/" + game.user.maxHp + ", Effects: " + (game.user.statusEffects.map(function(e) { return e.name; }).join(", ") || "None") + "</p>";
            log.innerHTML += "<p>Status - " + game.target.name + ": HP " + game.target.hp + "/" + game.target.maxHp + ", Effects: " + (game.target.statusEffects.map(function(e) { return e.name; }).join(", ") || "None") + "</p>";
        }
    }
}

function ArriveVillage(village) {
    game.gameState = "In Village";
    game.player.hp = game.player.maxHp;
    game.player.statusEffects = [];
    game.player.lastVillage = village;
    var controls = document.getElementById("main-controls");
    if (controls) controls.style.display = "block";
    queueOutput("Arrived at " + village + "! HP restored, status effects cleared.");
}
