function ArriveVillage(villageName) {
    game.gameState = "main"; // Set state first
    Log.debug(`State set to ${game.gameState} before setup`);
    game.player.lastVillage = villageName;
    game.player.hp = game.player.maxHp;
    game.player.statusEffects = [];
    queueOutput(`<span class='output-text-neutral'>Arrived at <span class='battle-ready'>${villageName}</span>! HP restored, status effects cleared.</span>`);
    let controls = document.getElementById("main-controls");
    controls.innerHTML = "";
    let trainButton = document.createElement("button");
    trainButton.innerText = "Train";
    trainButton.className = "train-button";
    trainButton.onclick = () => {
        if (game.gameState === "main") {
            let enemy = generateTrainingEnemy();
            startBattle(enemy, "training");
        } else {
            queueOutput("<span class='output-text-neutral'>Cannot train outside main state!</span>");
        }
    };
    controls.appendChild(trainButton);

    let skillsButton = document.createElement("button");
    skillsButton.innerText = "Manage Skills";
    skillsButton.className = "skills-button";
    skillsButton.onclick = () => {
        if (game.gameState === "main") {
            queueOutput("<span class='output-text-neutral'>Skill management opened!</span>");
        } else {
            queueOutput("<span class='output-text-neutral'>Cannot manage skills outside main state!</span>");
        }
    };
    controls.appendChild(skillsButton);

    let travelButton = document.createElement("button");
    travelButton.innerText = "Travel";
    travelButton.className = "travel-button";
    travelButton.onclick = () => {
        if (game.gameState === "main") {
            let villages = ["Newb Village", "Hidden Leaf", "Sand Village"];
            let areas = MapData[villageName]?.areas || [];
            let options = [...villages, ...areas];
            let choice = prompt(`Travel to: ${options.join(", ")}`);
            if (choice && options.includes(choice)) {
                game.battleNum = 0; // Reset battle count for new travel
                game.player.lastVillage = choice; // Update destination before fights
                startTravelFight();
            }
        } else {
            queueOutput("<span class='output-text-neutral'>Cannot travel outside main state!</span>");
        }
    };
    controls.appendChild(travelButton);

    let shopButton = document.createElement("button");
    shopButton.innerText = "Shop";
    shopButton.className = "shop-button";
    shopButton.onclick = () => {
        if (game.gameState === "main") {
            queueOutput("<span class='output-text-neutral'>Shop opened!</span>");
        } else {
            queueOutput("<span class='output-text-neutral'>Cannot access shop outside main state!</span>");
        }
    };
    controls.appendChild(shopButton);
    Log.debug(`Arrived at ${villageName}, controls set up, gameState: ${game.gameState}`);
}

const MapData = {
    "Newb Village": {
        areas: ["Training Grounds", "Forest Path"]
    },
    "Hidden Leaf": {
        areas: ["Hokage Tower", "Training Field"]
    },
    "Sand Village": {
        areas: ["Desert Outpost", "Kazekage Residence"]
    }
};
