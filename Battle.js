// Battle.js (Reverted to your last working version)
function startBattle(player, enemy) {
    if (game.gameState !== "battle") {
        game.gameState = "battle";
        game.user = player;
        game.target = enemy;
        game.battleScene = { turn: determineFirstTurn(player, enemy), log: [] };
        queueOutput(`BATTLE BEGINS!<br>${player.name} vs. ${enemy.name}`);
        if (Math.random() < 0.3) queueOutput(`${enemy.name} is off guard!`);
        takeTurn(game.battleScene.turn);
    }
}

function determineFirstTurn(player, enemy) {
    return Math.random() < 0.5 ? player : enemy;
}

function takeTurn(character) {
    if (game.gameState !== "battle") return;
    game.battleScene.turn = character;
    queueOutput(`${character.name}'s turn`);
    applyStatusEffects(character);

    let skill;
    if (character === game.user) {
        // Player turn logic (handled by UI/buttons)
    } else {
        skill = character.skills[Math.floor(Math.random() * character.skills.length)];
        if (skill) {
            useSkill(character, game.user === character ? game.target : game.user, skill);
        } else {
            queueOutput(`${character.name} has no skills to use!`);
        }
    }

    if (game.user.hp <= 0 || game.target.hp <= 0) {
        endBattle();
        return;
    }

    setTimeout(() => takeTurn(character === game.user ? game.target : game.user), 1000);
}

function useSkill(user, target, skill) {
    if (skill.status) applyStatusEffect(target, skill.status);
    for (let i = 0; i < skill.hits; i++) {
        let damage = skill.damage;
        if (damage > 0) {
            target.hp = Math.max(0, target.hp - damage);
            if (i === 0) {
                queueOutput(`${user.name} uses ${skill.name}! ${user.name} attacks ${target.name} with ${skill.name} for ${damage} damage!`);
            } else {
                queueOutput(`${user.name} combos ${target.name} for ${damage} damage!`);
            }
        }
    }
    applyStatusEffects(user);
    if (skill.name === "Barrage" && isNaN(damage)) {
        queueOutput(`${user.name} encountered an error with ${skill.name}!`);
    }
}

function applyStatusEffect(target, status) {
    let existing = target.statusEffects.find(e => e.name === status.name);
    if (existing) {
        existing.duration = Math.min(5, existing.duration + 1);
    } else {
        target.statusEffects.push({ ...status, duration: status.duration });
    }
}

function applyStatusEffects(character) {
    let effects = character.statusEffects.filter(effect => effect.effect);
    effects.forEach(effect => {
        if (effect.effect) effect.effect(character);
        effect.duration--;
    });
    character.statusEffects = character.statusEffects.filter(e => e.duration > 0);
}

function endBattle() {
    game.gameState = "end";
    queueOutput("Battle ended!");
    if (game.battleScene && game.battleScene.onEnd) {
        game.battleScene.onEnd();
    }
}
