var MapData = {
    "Newb Village": { areas: ["Wilderness", "Training Grounds"] },
    "Wilderness": { areas: ["Newb Village"] },
    "Training Grounds": { areas: ["Newb Village"] }
};

function ArriveVillage(village) {
    game.gameState = "In Village";
    game.player.hp = game.player.maxHp;
    game.player.statusEffects = [];
    game.player.lastVillage = village;
    var controls = document.getElementById("main-controls");
    if (controls) controls.style.display = "block";
    queueOutput("Arrived at " + village + "! HP restored, status effects cleared.");
}
