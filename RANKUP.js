// RANKUP.js
// Ensure initiateStyleSelection is globally accessible
window.initiateStyleSelection = function() {
    var styles = ["Taijutsu", "Ninjutsu", "Genjutsu", "Fire", "Lightning", "Earth", "Water", "Wind", "Feral"];
    var availableStyles = styles.filter(style => !Object.keys(game.player.ninjaStyles).includes(style));
    if (availableStyles.length > 0) {
        var selectedStyle = availableStyles[Math.floor(Math.random() * availableStyles.length)];
        game.player.ninjaStyles[selectedStyle] = "D-Rank";
        queueOutput(selectedStyle + " trained to D-Rank!");
        if (Object.keys(game.player.ninjaStyles).length < 2) {
            initiateStyleSelection();
        } else {
            game.gameState = "chooseInitialJutsu";
            initiateJutsuSelection();
        }
    } else {
        game.gameState = "In Village";
        queueOutput("Arrived at " + game.player.lastVillage + "! HP restored, status effects cleared.");
    }
};

function initiateJutsuSelection() {
    var availableJutsu = Object.keys(window.jutsu).filter(jutsu => {
        var skill = window.jutsu[jutsu];
        return skill.rank === "D-Rank" && !game.player.skills.some(s => s.name === jutsu) && !game.player.skillInventory.some(s => s.name === jutsu);
    });
    if (availableJutsu.length > 0) {
        var selectedJutsu = availableJutsu[Math.floor(Math.random() * availableJutsu.length)];
        game.player.skillInventory.push(Object.assign({}, window.jutsu[selectedJutsu]));
        queueOutput(selectedJutsu + " added to skill inventory!");
        if (game.player.skillInventory.length < 2) {
            initiateJutsuSelection();
        } else {
            game.gameState = "In Village";
            queueOutput("Jutsu selection complete! Arrived at " + game.player.lastVillage + ".");
        }
    }
}
