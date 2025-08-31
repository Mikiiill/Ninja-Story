let game = { gameState: "start", player: null, target: null, battleType: null };
let player;

function startGame() {
    if (game.gameState === "tutorialComplete") {
        ArriveVillage(game.player.lastVillage || "Konoha");
        return;
    }
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("name-selection").style.display = "block";
}

function setPlayerName() {
    const name = document.getElementById("player-name").value;
    if (name) {
        player = new Character(name, 100, 10, 5, 10);
        game.player = player;
        document.getElementById("name-selection").style.display = "none";
        document.getElementById("game-screen").style.display = "block";
        startTutorial();
    } else {
        alert("Please enter a name!");
    }
}

function startTutorial() {
    startTutorialFight();
}

function startTutorialFight() {
    game.battleType = "eventFight"; // Ensure eventFight is set
    game.enemy = Object.assign({}, SparringDummy); // Shallow copy to avoid reference issues
    game.isTutorialBattle = true;
    console.log("[DEBUG]: Before startBattle - enemy:", game.enemy);
    game.gameState = "battle";
    startBattle(game.player, game.enemy);
    console.log("[DEBUG]: After startBattle - enemy:", game.enemy);
    if (game.enemy.name !== "SparringDummy") {
        console.error("[ERROR]: Enemy name overridden to:", game.enemy.name);
        game.enemy = Object.assign({}, SparringDummy); // Force correct name
    }
}
