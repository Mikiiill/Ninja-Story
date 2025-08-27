function startBattle(enemyType, fightType = "event") {
    if (game.gameState !== "battle") {
        game.enemy = enemyType;
        game.gameState = "battle";
        document.getElementById("skill-controls").innerHTML = "";
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
        setTimeout(() => determineTurnOrder(fightType), 1000);
    } else {
        queueOutput("<span class='output-text-neutral'>Battle already in progress!</span>");
    }
}

function determineTurnOrder(fightType) {
    let coinFlip = Math.random() < 0.5;
    let first = coinFlip ? game.player.name : game.enemy.name;
    let second = coinFlip ? game.enemy.name : game.player.name;
    queueOutput(`<span class='output-text-neutral'>${second} is off guard!</span>`);
    setTimeout(() => takeTurn(first, fightType), 2000);
}

function takeTurn(name, fightType) {
    queueOutput(`<span class='output-text-${name === game.player.name ? 'player' : 'enemy'}'>${name}</span>'s turn`);
    setTimeout(() => {
        let user = name === game.player.name ? game.player : game.enemy;
        let target = name === game.player.name ? game.enemy : game.player;
        applyStatusEffects(user);
        let skillSet = new Skills();
        let usableSkills = user.skills.filter(skill => skillSet.canUseSkill(user, skill));
        let skill = usableSkills.length > 0 ? usableSkills[Math.floor(Math.random() * usableSkills.length)] : null;
        if (user.statusEffects.some(e => e.name === "Numb")) {
            queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> is stunned by <span class='status-numb'>Numb ⚡️</span> and skips their skill phase!`);
            user.statusEffects = user.statusEffects.filter(e => e.name !== "Numb");
        } else if (user.statusEffects.some(e => e.name === "READY")) {
            let barrageSkill = skillSet.findSkill("Barrage");
            if (barrageSkill) barrageSkill.skillFunction(user, target, game.battleScene);
            user.statusEffects = user.statusEffects.filter(e => e.name !== "READY");
        } else if (skill) {
            let burnReduction = user.statusEffects.some(e => e.name === "Burn") ? 1 : 0;
            if (burnReduction && skill !== skillSet.findSkill("Healing Stance")) {
                skill.skillFunction = function(u, t, s) {
                    let original = skillSet.findSkill(skill.name).skillFunction;
                    let result = original(u, t, s);
                    if (t.hp > 0 && !result) {
                        s.queueOutput(`<span class='output-text-${t === game.player ? 'player' : 'enemy'}'>${t.name}</span> feels exhausted from Burn, reducing skill damage!`);
                    }
                    return result;
                };
            }
            let skillStyle = skill.style || "neutral";
            skill.skillFunction(user, target, game.battleScene);
        }
        if (game.player.hp > 0 && game.enemy.hp > 0) {
            setTimeout(() => takeTurn(target.name, fightType), 2000);
        } else {
            endBattle(fightType);
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

function endBattle(fightType) {
    game.gameState = "postBattle";
    queueOutput("<span class='battle-ready'>Battle ended!</span>");
    game.player.hp = game.player.maxHp;
    game.player.statusEffects = [];
    if (fightType === "training") {
        performJutsuSelection(1, () => ArriveVillage(game.player.lastVillage));
    } else if (fightType === "travel") {
        game.battleNum++;
        if (game.battleNum <= 4) {
            startTravelFight();
        } else {
            game.player.lastVillage = game.player.lastVillage; // Set to chosen destination (already updated in travelButton onclick)
            ArriveVillage(game.player.lastVillage); // Arrive at new village after 4 fights
        }
    } else {
        performJutsuSelection(1); // Default for event fights
    }
}

function generateTrainingEnemy() {
    let enemies = [
        { name: "Training Dummy", hp: 10, maxHp: 10, ninjaStyles: { Taijutsu: "D-Rank", Ninjutsu: "D-Rank" }, skills: [], gold: 5 },
        { name: "Thief", hp: 10, maxHp: 10, ninjaStyles: { Taijutsu: "C-Rank", Ninjutsu: "D-Rank" }, skills: [], gold: 10 },
        { name: "Rabid Dog", hp: 10, maxHp: 10, ninjaStyles: { Feral: "C-Rank", Taijutsu: "D-Rank" }, skills: [], gold: 8 }
    ];
    let enemy = JSON.parse(JSON.stringify(enemies[Math.floor(Math.random() * enemies.length)]));
    let skillSet = new Skills();
    enemy.skills = skillSet.skills.filter(skill => skillSet.canUseSkill(enemy, skill)).slice(0, 2); // Limit to 2 skills
    return enemy;
}

function startTravelFight() {
    let rankStyles = {
        "Genin": { hp: 12, styles: { Ninjutsu: "C-Rank", Taijutsu: "C-Rank", Genjutsu: "D-Rank", Fire: "D-Rank", Lightning: "D-Rank", Earth: "D-Rank" }, gold: 15 },
        "Chuun
