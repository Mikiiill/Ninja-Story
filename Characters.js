function generateTrainingEnemy() {
    let enemies = [
        { name: "Training Dummy", hp: 15, maxHp: 15 },
        { name: "Thief", hp: 20, maxHp: 20 },
        { name: "Rabid Dog", hp: 25, maxHp: 25 }
    ];
    return enemies[Math.floor(Math.random() * enemies.length)];
}

function generateTravelEnemy() {
    let enemies = [
        { name: "Bandit", hp: 30, maxHp: 30 },
        { name: "Wild Boar", hp: 35, maxHp: 35 }
    ];
    return enemies[Math.floor(Math.random() * enemies.length)];
}
