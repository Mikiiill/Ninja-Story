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
    setTimeout(() => takeTurn(first), 2000);
}

function takeTurn(name) {
    queueOutput(`<span class='output-text-${name === game.player.name ? 'player' : 'enemy'}'>${name}</span>'s turn`);
    setTimeout(() => {
        let user = name === game.player.name ? game.player : game.enemy;
        let target = name === game.player.name ? game.enemy : game.player;
        applyStatusEffects(user);
        let skillSet = new Skills();
        let usableSkills = user.skills; // All active skills are automatically usable
        let skill = usableSkills.length > 0 ? usableSkills[Math.floor(Math.random() * usableSkills.length)] : null;
        if (user.statusEffects.some(e => e.name === "Numb")) {
            queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> is stunned by <span class='status-numb'>Numb ⚡️</span> and skips their skill phase!`);
            user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb"); // Remove Numb and end turn
            return; // End turn immediately
        } else if (user.statusEffects.some(e => e.name === "READY")) {
            let barrageSkill = skillSet.findSkill("Barrage");
            if (barrageSkill) barrageSkill.skillFunction(user, target, game.battleScene);
            user.statusEffects = user.statusEffects.filter(e => e.name !== "READY");
        } else if (skill) {
            let burnReduction = user.statusEffects.some(e => e.name === "Burn") ? 1 : 0;
            if (burnReduction && skill !== skillSet.findSkill("Healing Stance")) {
                let originalFunction = skillSet.findSkill(skill.name).skillFunction;
                skill.skillFunction = function(u, t, s) {
                    let result = originalFunction(u, t, s);
                    if (t.hp > 0 && !result) {
                        s.queueOutput(`<span class='output-text-${t === game.player ? 'player' : 'enemy'}'>${t.name}</span> feels exhausted from Burn, reducing skill damage!`);
                    }
                    return result;
                }.bind(skillSet);
            }
            // Check for defensive effects like Substitution
            if (target.statusEffects.some(e => e.name === "Substitution")) {
                queueOutput(`<span class='output-text-${target === game.player ? 'player' : 'enemy'}'>${target.name}</span> uses Substitution to block the attack!`);
                target.statusEffects = target.statusEffects.filter(e => e.name !== "Substitution");
            } else {
                // Force Healing Stance for Training Dummy if it's the only skill
                if (user.name === "Training Dummy" && user.skills.length === 1 && user.skills[0].name === "Healing Stance") {
                    user.skills[0].skillFunction(user, target, game.battleScene);
                } else {
                    skill.skillFunction(user, target, game.battleScene);
                }
            }
        } else if (usableSkills.length === 0) {
            queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> has no skills to use!`);
        }
        if (game.player.hp > 0 && game.enemy.hp > 0) {
            setTimeout(() => takeTurn(target.name), 2000);
        } else {
            endBattle();
        }
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
    // Restore village controls and clear battle UI
    let controls = document.getElementById("main-controls");
    if (controls) controls.style.display = "block";
    document.getElementById("skill-controls").innerHTML = ""; // Ensure no residual battle UI
    queueOutput("<span class='battle-ready'>Battle ended!</span>");
    game.player.hp = game.player.maxHp;
    game.player.statusEffects = [];
    performJutsuSelection(1); // Assuming this is defined elsewhere
}

function startTravelFight() {
    startBattle(generateTravelEnemy(), "travel");
}
