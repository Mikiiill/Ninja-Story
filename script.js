let game = {
    player: { name: "Shinobi", hp: 10, maxHp: 10, Rank: "Student" },
    gameState: "start"
};

function log(msg) {
    const el = document.getElementById('log');
    el.innerHTML += '<br>' + msg;
}

function startGame() {
    log('Attempting to start game at ' + new Date().toLocaleTimeString() + '...');
    const requiredElements = {
        output: document.getElementById("output"),
        controls: document.getElementById("controls"),
        log: document.getElementById("log")
    };
    log('Checking DOM elements: ' + JSON.stringify(Object.fromEntries(Object.entries(requiredElements).map([k, v]) => [k, !!v]))));
    if (!requiredElements.output || !requiredElements.controls || !requiredElements.log) {
        log('Error: Missing required DOM elements!');
        requiredElements.output.innerHTML = "Error: Missing game elements. Check index.html!";
        return;
    }
    log('Game initialized with state: ' + JSON.stringify({ hp: game.player.hp, Rank: game.player.Rank, gameState: game.gameState }));
    log('Adding test button...');
    let controls = document.getElementById("controls");
    controls.innerHTML = ""; // Clear controls
    let button = document.createElement("button");
    button.innerText = "Test Button";
    button.onclick = () => log('Test button clicked at ' + new Date().toLocaleTimeString() + '...');
    controls.appendChild(button);
    log('Test button added, waiting for input...');
}
