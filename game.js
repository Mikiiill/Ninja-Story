// Battle System
const game = {
    battleType: null,
    player: null,
    enemy: null, // Constant for enemy
    user: null,  // Turn-specific
    target: null, // Turn-specific
    targetDestination: null
};

async function startBattle(player, enemy) {
    logBattle(`startBattle called! inBattle: ${inBattle}, activeJutsu: ${player.activeJutsu.length}`);
    if (inBattle) {
        logBattle("Battle already in progress!");
        await sleep(3000);
        return;
    }
    if (player.activeJutsu.length === 0) {
        logBattle("Cannot start battle: No active Jutsu equipped!");
        await sleep(3000);
        return;
    }
    inBattle = true;
    game.player = player; // Constant: Shinobi (global player)
    game.enemy = enemy;   // Constant: Enemy (passed as enemy, e.g., from generateTrainingEnemy)
    const battleScreen = document.getElementById("battle-screen");
    const fightControls = document.getElementById("fight-controls");
    const travelControls = document.getElementById("travel-controls");
    if (battleScreen && fightControls && travelControls) {
        battleScreen.classList.remove("hidden");
        fightControls.classList.add("hidden");
        travelControls.classList.add("hidden");
    } else {
        logBattle("Error: battle-screen, fight-controls, or travel-controls not found");
        inBattle = false;
        return;
    }
    updateJutsuDisplay();
    updateBattleUI();
    logBattle(`<span class="output-text-player">${game.player.name}</span> vs <span class="output-text-enemy">${game.enemy.name}</span>!`);
    await sleep(3000);
    await setTurnOrder();
}

async function setTurnOrder() {
    logBattle(`setTurnOrder called!`);
    if (Math.random() < 0.5) {
        game.user = game.player; // Shinobi goes first
        game.target = game.enemy; // Enemy
        logBattle(`<span class="output-text-player">${game.player.name}</span> goes first!`);
    } else {
        game.user = game.enemy;   // Enemy goes first
        game.target = game.player; // Shinobi
        logBattle(`<span class="output-text-enemy">${game.enemy.name}</span> goes first!`);
    }
    await sleep(3000);
    await takeTurn();
}

function updateBattleUI() {
    try {
        const userName = document.getElementById("user-name");
        const userHp = document.getElementById("user-hp");
        const userStatus = document.getElementById("user-status");
        const userSprite = document.getElementById("user-sprite");
        const opponentName = document.getElementById("opponent-name");
        const opponentHp = document.getElementById("opponent-hp");
        const opponentStatus = document.getElementById("opponent-status");
        const opponentSprite = document.getElementById("opponent-sprite");
        const playerRank = document.getElementById("player-rank");
        const playerXp = document.getElementById("player-xp");

        if (!userName || !userHp || !userStatus || !userSprite || !opponentName || !opponentHp || !opponentStatus || !opponentSprite || !playerRank || !playerXp) {
            logBattle("Error: One or more UI elements missing in updateBattleUI!");
            inBattle = false;
            return;
        }

        userName.textContent = game.player.name;
        userHp.textContent = `${game.player.hp}/${game.player.maxHp}`;
        userStatus.textContent = game.player.statusEffects.map(s => statusEmojis[s.name] || s.name).join(" ") || "None";
        userSprite.src = game.player.sprite;
        opponentName.textContent = game.enemy ? game.enemy.name : "None";
        opponentHp.textContent = game.enemy ? `${game.enemy.hp}/${game.enemy.maxHp}` : "0/0";
        opponentStatus.textContent = game.enemy ? game.enemy.statusEffects.map(s => statusEmojis[s.name] || s.name).join(" ") || "None" : "None";
        opponentSprite.src = game.enemy ? game.enemy.sprite : "https://via.placeholder.com/120x160";
        playerRank.textContent = game.player.rank;
        playerXp.textContent = game.player.xp;
    } catch (e) {
        logBattle(`Error in updateBattleUI: ${e.message}`);
        inBattle = false;
    }
}
