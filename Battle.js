let battleQueue = [];

function startBattle(enemy, mode) {
    if (game.gameState !== "battle") {
        let enemyType = enemy || generateTrainingEnemy(); // Use provided enemy or generate one
        game.enemy = enemyType;
        game.gameState = "battle";
        // Clear skill management during battle
        document.getElementById("skill-controls").innerHTML = "";
        // Hide village controls during battle
        let controls = document.getElementById("main-controls");
        if (controls) controls.style.display = "none";
        // Fill active skills to 10 if possible
        while (game.player.skills.length < 10 && game.player.skillInventory.length > 0) {
            let randIndex = Math.floor(Math.random() * game.player.skillInventory.length);
            game.player.skills.push(game.player.skillInventory.splice(randIndex, 1)[0]);
        }
        updateStatus();
        game.battleScene = { queueOutput: queueOutput };
        queueOutput(""); // Empty line before battle start
        queueOutput("<span class='battle-ready'>BATTLE BEGINS!</span>");
        queueOutput(`<span class='output-text-player'>${game.player.name}</span> vs. <span class='output-text-enemy'>${game.enemy.name}</span>`);
        queueOutput(""); // Empty line after names
        setTimeout(() => determineTurnOrder(), 1000);
    } else {
        queueOutput("<span class='output-text-neutral'>Battle already in progress!</span>");
    }
}

function determineTurnOrder() {
    let coinFlip = Math.random() < 0.5;
    let first = coinFlip ? game.player.name : game.enemy.name;
    let second = coinFlip ? game.enemy.name : game.player.name;
    queueOutput(`<span class='output-text-neutral'>${second} is off guard!</span>`);
    battleQueue = [first, second]; // Initialize queue
    processBattleQueue();
}

function processBattleQueue() {
    if (battleQueue.length > 0) {
        let name = battleQueue.shift();
        takeTurn(name);
    } else if (game.player.hp > 0 && game.enemy.hp > 0) {
        battleQueue = [game.player.name, game.enemy.name]; // Reset queue
        processBattleQueue();
    } else {
        endBattle();
    }
}

function takeTurn(name) {
    queueOutput(`<span class='output-text-${name === game.player.name ? 'player' : 'enemy'}'>${name}</span>'s turn`);
    setTimeout(() => {
        let user = name === game.player.name ? game.player : game.enemy;
        let target = name === game.player.name ? game.enemy : game.player;
        let skillSet = new Skills();

        // Start of Turn: Apply DoT effects
        applyStatusEffects(user);

        // Numb check to skip skill phase
        if (user.statusEffects.some(e => e.name === "Numb")) {
            queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> is stunned by <span class='status-numb'>Numb ⚡️</span> and skips their skill phase!`);
            user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb");
            processBattleQueue();
            return;
        }

        let skill = user.skills[Math.floor(Math.random() * user.skills.length)]; // Draw skill
        let isSupportSkill = skillSet.findSkill(skill.name)?.support || false; // Check support status

        // Active Effects (before skill use)
        let burnReduction = user.statusEffects.some(e => e.name === "Burn") ? 1 : 0;
        if (user.statusEffects.some(e => e.name === "READY") && !isSupportSkill) {
            let barrageSkill = skillSet.findSkill("Barrage");
            if (barrageSkill) barrageSkill.skillFunction(user, target, game.battleScene);
            user.statusEffects = user.statusEffects.filter(e => e.name !== "READY");
        } else if (user.statusEffects.some(e => e.name === "ShadowCloneEffect") && !isSupportSkill) {
            let barrageSkill = skillSet.findSkill("Barrage");
            if (barrageSkill) {
                let cloneCount = user.statusEffects.filter(e => e.name === "ShadowCloneEffect").length;
                for (let i = 0; i < cloneCount; i++) {
                    queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>Shadow Clone ${i + 1} uses Barrage on ${target.name}!</span>`);
                    barrageSkill.skillFunction(user, target, game.battleScene);
                }
            }
            user.statusEffects = user.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
        }

        // Apply Active effect modifications (Burn reduction)
        if (burnReduction && !isSupportSkill) {
            let originalFunction = skillSet.findSkill(skill.name).skillFunction;
            skill.skillFunction = function(u, t, s) {
                let result = originalFunction(u, t, s);
                if (t.hp > 0 && !result) {
                    s.queueOutput(`<span class='output-text-${t === game.player ? 'player' : 'enemy'}'>${t.name}</span> feels exhausted from Burn, reducing skill damage!`);
                }
                return result;
            }.bind(skillSet);
        }

        // Triggered Effects (check target's status effects)
        if (target.statusEffects.some(e => e.name === "Swap") && !isSupportSkill) { // Fixed to "Swap" for Substitution
            queueOutput(`<span class='output-text-${target === game.player ? 'player' : 'enemy'}'>${target.name}</span> uses Substitution to dodge the attack with a log!`);
            target.statusEffects = target.statusEffects.filter(e => e.name !== "Swap");
        } else if (target.statusEffects.some(e => e.name === "ShadowCloneEffect")) {
            queueOutput(`<span class='output-text-${target === game.player ? 'player' : 'enemy'}'>${target.name}</span>'s Shadow Clone absorbs the attack!`);
            target.statusEffects = target.statusEffects.filter(e => e.name !== "ShadowCloneEffect");
        } else {
            // Force Healing Stance for Training Dummy
            if (user.name === "Training Dummy" && user.skills.length === 1 && user.skills[0].name === "Healing Stance") {
                user.skills[0].skillFunction(user, target, game.battleScene);
            } else {
                skill.skillFunction(user, target, game.battleScene);
            }
        }

        // End of Turn: Schedule next
        processBattleQueue();
    }, 2000);
}

function applyStatusEffects(entity) {
    entity.statusEffects = entity.statusEffects.filter(effect => {
        if (effect.name === "Burn" || effect.name === "Doom" || effect.name === "Bleed") {
            entity.hp -= effect.damage;
            effect.duration--;
            queueOutput(`<span class='output-text-${entity === game.player ? 'player' : 'enemy'}'>${entity.name}</span> takes ${effect.damage} damage from <span class='status-${effect.name.toLowerCase().replace(" ", "")}'>${effect.name}</span>!`);
            updateStatus();
        } else if (effect.name === "Regen") {
            let heal = entity.hp < entity.maxHp ? effect.damage : 0;
            entity.hp = Math.min(entity.maxHp, entity.hp + heal);
            effect.duration--;
            if (heal > 0) queueOutput(`<span class='output-text-${entity === game.player ? 'player' : 'enemy'}'>${entity.name}</span> heals ${heal} HP from <span class='status-${effect.name.toLowerCase().replace(" ", "")}'>${effect.name}</span>!`);
            updateStatus();
        } else if (effect.name === "ShadowCloneEffect") {
            if (effect.new) {
                effect.new = false;
            } else if (effect.duration > 0) {
                effect.duration--;
            }
        } else if (effect.name === "Swap" || effect.name === "DoubleImage" || effect.name === "Dome") {
            effect.duration--;
        } else if (effect.name === "Numb" || effect.name === "READY" || effect.name === "DynamicEntryProc") {
            effect.duration--;
        } else if (effect.name === "Release") {
            effect.duration--;
        }
        return effect.duration > 0;
    });
}

function endBattle() {
    game.gameState = "postBattle";
    let controls = document.getElementById("main-controls");
    if (controls) controls.style.display = "block";
    document.getElementById("skill-controls").innerHTML = "";
    queueOutput("<span class='battle-ready'>Battle ended!</span>");
    game.player.hp = game.player.maxHp;
    game.player.statusEffects = [];
    // Perform jutsu selection before arriving at village
    performJutsuSelection(1, false, () => ArriveVillage(game.player.lastVillage));
}

function startTravelFight() {
    startBattle(generateTravelEnemy(), "travel");
}
