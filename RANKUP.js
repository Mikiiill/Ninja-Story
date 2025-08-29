window.initiateStyleSelection = function() {
    console.log("initiateStyleSelection called, game.player.ninjaStyles:", game.player.ninjaStyles);
    // Basic styles available at start (hidden styles like Water, Wind, Feral excluded until unlocked)
    var styles = ["Ninjutsu", "Genjutsu", "Taijutsu", "Fire", "Earth", "Lightning"];
    var availableStyles = styles.filter(style => !Object.keys(game.player.ninjaStyles).includes(style));
    if (availableStyles.length > 0) {
        var selectedStyle = availableStyles[Math.floor(Math.random() * availableStyles.length)];
        // Permanently upgrade unranked styles to C-Rank
        game.player.ninjaStyles[selectedStyle] = "C-Rank";
        queueOutput(selectedStyle + " trained to C-Rank!");
        console.log("Selected style:", selectedStyle, "Rank:", game.player.ninjaStyles[selectedStyle]);
        if (Object.keys(game.player.ninjaStyles).length < 5) { // Allow up to 5 styles (3 initial + 2 new)
            initiateStyleSelection();
        } else {
            game.gameState = "chooseInitialJutsu";
            initiateJutsuSelection();
        }
    } else {
        game.gameState = "In Village";
        queueOutput("Arrived at " + game.player.lastVillage + "! HP restored, status effects cleared.");
        console.log("No available styles, setting gameState to In Village");
    }
};

function initiateJutsuSelection() {
    var availableJutsu = Object.keys(window.jutsu).filter(jutsu => {
        var skill = window.jutsu[jutsu];
        return skill.rank === "C-Rank" && // Match C-Rank for new styles
               Object.keys(game.player.ninjaStyles).some(style => 
                   skill.type.includes(style) && game.player.ninjaStyles[style] >= "C-Rank") &&
               !game.player.skills.some(s => s.name === jutsu) &&
               !game.player.skillInventory.some(s => s.name === jutsu);
    });
    if (availableJutsu.length > 0) {
        var selectedJutsu = availableJutsu[Math.floor(Math.random() * availableJutsu.length)];
        game.player.skillInventory.push(Object.assign({}, window.jutsu[selectedJutsu]));
        queueOutput(selectedJutsu + " added to skill inventory!");
        if (game.player.skillInventory.length < 2) { // Limit to 2 jutsu
            initiateJutsuSelection();
        } else {
            game.gameState = "In Village";
            queueOutput("Jutsu selection complete! You must learn more skills to become a Genin. Arrived at Newb Village.");
            ArriveVillage("Newb Village"); // Transition to village
        }
    }
}
