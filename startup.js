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
    queueOutput("Welcome to the Shinobi Way! Let's begin your training.");
    const sparringDummy = new Character("Sparring Dummy", 50, 5, 2, 0);
    game.battleType = "eventFight";
    game.user = player;
    game.target = sparringDummy;
    game.gameState = "inBattle";
    startBattle(sparringDummy);
}
