let battleQueue = [];

function startBattle(user, target) {
    if (game.gameState !== "battle") {
        game.user = user || game.player;
        game.target = target || generateTrainingEnemy();
        game.gameState = "battle";
        document.getElementById("skill-controls").innerHTML = "";
        let controls = document.getElementById("main-controls");
        if (controls) controls.style.display = "none";
        while (game.user.skills.length < 10 && game.user.skillInventory.length > 0) {
            let randIndex = Math.floor(Math.random() * game.user.skillInventory.length);
            game.user.skills.push(game.user.skillInventory.splice(randIndex, 1)[0]);
        }
        updateStatus();
        game.battleScene = { queueOutput: queueOutput };
        queueOutput("");
        queueOutput("<span class='battle-ready'>BATTLE BEGINS!</span>");
        queueOutput(`<span class='output-text-player'>${game.user.name}</span> vs. <span class='output-text-enemy'>${game.target.name}</span>`);
        queueOutput("");
        console.log("Starting battle with:", { user: game.user.name, target: game.target.name });
        setTimeout(() => determineTurnOrder(), 1000);
    } else {
        queueOutput("<span class='output-text-neutral'>Battle already in progress!</span>");
    }
}

function determineTurnOrder() {
    let coinFlip = Math.random() < 0.5;
    let first = coinFlip ? game.user : game.target;
    let second = coinFlip ? game.target : game.user;
    queueOutput(`<span class='output-text-neutral'>${second.name} is off guard!</span>`);
    battleQueue = [first, second];
    console.log("Turn order determined:", { first: first.name, second: second.name });
    processBattleQueue();
}

function processBattleQueue() {
    if (battleQueue.length > 0) {
        let currentUser = battleQueue.shift();
        takeTurn(currentUser);
    } else if (game.user.hp > 0 && game.target.hp > 0) {
        battleQueue = [game.target, game.user];
        processBattleQueue();
    } else {
        endBattle();
    }
}

function takeTurn(user) {
    game.user = user;
    game.target = (user === game.user) ? game.target : game.user;
    queueOutput(`<span class='output-text-${user === game.user ? 'player' : 'enemy'}'>${user.name}</span>'s turn`);
    setTimeout(() => {
        startEffectCheck(user);
        if (user.hp > 0) {
            skillAction(user);
        }
    }, 2000);
}

function startEffectCheck(user) {
    let skillSet = new Skills();
    user.statusEffects = user.statusEffects.map(effect => {
        if (effect.startOfTurn && (effect.name === "Burn" || effect.name === "Doom" || effect.name === "Bleed" || effect.name === "Poison")) {
            user.hp -= effect.damage;
            queueOutput(`<span class='output-text-${user === game.user ? 'player' : 'enemy'}'>${user.name}</span> takes ${effect.damage} damage from <span class='status-${effect.name.toLowerCase().replace(" ", "")}'>${effect.name}</span>!`);
            updateStatus();
            deathCheck(user);
        } else if (effect.startOfTurn && effect.name === "Regen") {
            let heal = user.hp < user.maxHp ? effect.damage : 0;
            user.hp = Math.min(user.maxHp, user.hp + heal);
            if (heal > 0) queueOutput(`<span class='output-text-${user === game.user ? 'player' : 'enemy'}'>${user.name}</span> heals ${heal} HP from <span class='status-${effect.name.toLowerCase().replace(" ", "")}'>${effect.name}</span>!`);
            updateStatus();
        }
        effect.duration--;
        return effect;
    }).filter(effect => effect.duration > 0);

    if (user.statusEffects.some(e => e.name === "Numb")) {
        queueOutput(`<span class='output-text-${user === game.user ? 'player' : 'enemy'}'>${user.name}</span> is stunned by <span class='status-numb'>Numb ⚡️</span> and skips their skill phase!`);
        user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb");
        endTurn();
    }
}

function deathCheck(user) {
    if (user.hp <= 0) {
        queueOutput(`<span class='output-text-${user === game.user ? 'player' : 'enemy'}'>${user.name}</span> has been defeated!`);
        endBattle();
    }
}

function skillAction(user) {
    let skillSet = new Skills();
    let skill = user.skills[Math.floor(Math.random() * user.skills.length)];
    if (!skill) {
        queueOutput(`<span class='output-text-${user === game.user ? 'player' : 'enemy'}'>${user.name}</span> has no skills to use!`);
        endTurn();
        return;
    }
    let isSupportSkill = skillSet.findSkill(skill.name)?.support || false;
    queueOutput(`<span class='output-text-${user === game.user ? 'player' : 'enemy'}'>${user.name}</span> uses ${skill.name}!`);

    if (isSupportSkill) {
        skill.skillFunction(user, game.target, game.battleScene);
    } else {
        activeEffectCheck(user);
        triggeredEffectCheck(user, game.target);
        try {
            skill.skillFunction(user, game.target, game.battleScene);
        } catch (e) {
            console.error("Error in skill execution:", e);
            queueOutput(`<span class='output-text-${user === game.user ? 'player' : 'enemy'}'>${user.name}</span> encountered an error with ${skill.name}!`);
        }
    }
    endTurn();
}

function activeEffectCheck(user) {
    let skillSet = new Skills();
    user.statusEffects.forEach(effect => {
        if (effect.active && (effect.name === "READY" || effect.name === "ShadowCloneEffect")) {
            if (effect.name === "READY") {
                let barrageSkill = skillSet.findSkill("Barrage");
                if (barrageSkill) barrageSkill.skillFunction(user, game.target, game.battleScene);
            } else if (effect.name === "ShadowCloneEffect") {
                let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
                for (let i = 0; i < cloneCount; i++) {
                    queueOutput(`<span class='output-text-${user === game.user ? 'player' : 'enemy'}'>Shadow Clone ${i + 1} uses Barrage on ${game.target.name}!</span>`);
                    let barrageSkill = skillSet.findSkill("Barrage");
                    if (barrageSkill) barrageSkill.skillFunction(user, game.target, game.battleScene);
                }
                user.statusEffects = user.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
            }
            deathCheck(game.target);
        }
    });
}

function triggeredEffectCheck(user, target) {
    let triggeredEffects = ["ShadowCloneEffect", "Swap", "Dome", "DoubleImage", "Release"];
    let effect = target.statusEffects.find(e => e.triggered && triggeredEffects.includes(e.name));
    if (effect) {
        switch (effect.name) {
            case "ShadowCloneEffect":
                queueOutput(`<span class='output-text-${target === game.user ? 'player' : 'enemy'}'>${target.name}</span>'s Shadow Clone absorbs the attack!`);
                target.statusEffects = target.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
                break;
            case "Swap":
                queueOutput(`<span class='output-text-${target === game.user ? 'player' : 'enemy'}'>${target.name}</span> uses Substitution to dodge the attack with a log!`);
                target.statusEffects = target.statusEffects.filter(e => e.name !== "Swap");
                return; // End skill early
            case "Dome":
            case "DoubleImage":
            case "Release":
                queueOutput(`<span class='output-text-${target === game.user ? 'player' : 'enemy'}'>${target.name}</span> uses ${effect.name} to mitigate the attack!`);
                target.statusEffects = target.statusEffects.filter(e => e.name !== effect.name);
                break;
        }
    }
}

function endTurn() {
    let temp = game.user;
    game.user = game.target;
    game.target = temp;
    processBattleQueue();
}

function endBattle() {
    game.gameState = "postBattle";
    let controls = document.getElementById("main-controls");
    if (controls) controls.style.display = "block";
    document.getElementById("skill-controls").innerHTML = "";
    queueOutput("<span class='battle-ready'>Battle ended!</span>");
    game.user.hp = game.user.maxHp;
    game.user.statusEffects = [];
    game.target.hp = game.target.maxHp;
    game.target.statusEffects = [];
    performJutsuSelection(1, false, () => ArriveVillage(game.user.lastVillage));
}

function startTravelFight() {
    startBattle(game.player, generateTravelEnemy());
        }
