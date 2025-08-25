let game = {
    player: { name: "Shinobi", hp: 10, maxHp: 10, Rank: "Student", ninjaStyles: { Fire: "D-Rank", Lightning: "D-Rank", Illusion: "D-Rank", Earth: "D-Rank", Feral: "D-Rank" }, skills: [], skillInventory: [], statusEffects: [] },
    enemy: null,
    battleNum: 1,
    output: [],
    gameState: "start",
    battleScene: null,
    outputQueue: [],
    isOutputting: false
};

function log(msg) {
    const el = document.getElementById('log');
    el.innerHTML += '<br>' + msg;
}

function startGame() {
    log('Attempting to start game at ' + new Date().toLocaleTimeString() + '...');
    game.output = ["Train to become a Shinobi! Click to choose styles!"];
    document.getElementById("output").innerHTML = game.output.join("<br>");
    game.battleScene = { chosenStyles: [], chooseNinjaStyles: function() { log('Choose styles now...'); } };
    setTimeout(() => game.battleScene.chooseNinjaStyles(), 1000);
}
