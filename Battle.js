// Battle.js (partial update to reflect battle types)
function startBattle(player, enemy) {
    if (game.gameState !== "battle") {
        game.gameState = "battle";
        game.user = player;
        game.target = enemy;
        determineTurnOrder(player, enemy);
        console.log(`Battle started: ${game.battleType} - ${enemy.name} [HP: ${enemy.hp}/${enemy.maxHp}]`);
    }
}

function determineTurnOrder(player, enemy) {
    // Existing logic to determine turn order
    game.battleScene = {
        turn: Math.random() < 0.5 ? player : enemy,
        log: []
    };
    takeTurn(game.battleScene.turn);
}

// Ensure battle types are handled
function handleBattleType() {
    switch (game.battleType) {
        case "training":
            // Training fight vs Training Dummy
            break;
        case "travel":
            // Travel fight vs Wild Dog or Thief
            break;
        case "event":
            // Event fight (e.g., tutorial) vs Training Dummy
            break;
    }
}
