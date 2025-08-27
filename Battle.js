function startBattle(enemy, mode) {
    try {
        if (game.gameState !== "In Village" || !game.player.skills || game.player.skills.length === 0) {
            queueOutput("<span class='output-text-neutral'>Cannot start battle: Invalid state or no skills!</span>");
            return;
        }
        game.enemy = enemy || { name: "Unknown", hp: 0, maxHp: 0, statusEffects: [] }; // Default enemy if null
        if (!game.enemy.statusEffects) game.enemy.statusEffects = [];
        game.battleNum = (mode === "training") ? 1 : game.battleNum + 1;
        Log.debug(`Battle started with ${game.enemy.name}, mode: ${mode}`);
        updateStatus();
        queueOutput(`<span class='output-text-neutral'>Battle against ${game.enemy.name} begun!</span>`);
        // Add your battle turn logic here (e.g., player turn, enemy turn)
    } catch (error) {
        Log.error(`Error in startBattle: ${error.message}`);
    }
}

function startTravelFight() {
    try {
        if (game.gameState !== "In Village" || !game.player.skills || game.player.skills.length === 0) {
            queueOutput("<span class='output-text-neutral'>Cannot start travel fight: Invalid state or no skills!</span>");
            return;
        }
        let enemy = generateTravelEnemy();
        if (enemy) {
            Log.debug(`Generated travel enemy: ${enemy.name} with HP ${enemy.hp}`);
            startBattle(enemy, "travel");
        } else {
            Log.error("Failed to generate travel enemy");
            queueOutput("<span class='output-text-neutral'>Error: No enemy generated for travel.</span>");
        }
    } catch (error) {
        Log.error(`Error in startTravelFight: ${error.message}`);
    }
}
