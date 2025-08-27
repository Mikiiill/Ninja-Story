function ArriveVillage(villageName) {
    game.gameState = "In Village"; // Set to specific village state
    Log.debug(`State set to ${game.gameState} before setup`);
    game.player.lastVillage = villageName;
    game.player.hp = game.player.maxHp;
    game.player.statusEffects = [];
    // Wait for output queue to clear before setting up controls
    let checkQueue = setInterval(() => {
        if (!game.isOutputting && game.outputQueue.length === 0) {
            clearInterval(checkQueue);
            queueOutput(`<span class='output-text-neutral'>Arrived at <span class='battle-ready'>${villageName}</span>! HP restored, status effects cleared.</span>`);
            let controls = document.getElementById("main-controls");
            controls.innerHTML = "";
            let trainButton = document.createElement("button");
            trainButton.innerText = "Train";
            trainButton.className = "train-button";
            trainButton.onclick = () => {
                if (game.gameState === "In Village") {
                    Log.debug("Train button clicked");
                    let enemy = generateTrainingEnemy();
                    startBattle(enemy, "training");
                } else {
                    queueOutput("<span class='output-text-neutral'>Cannot train outside village!</span>");
                }
            };
            controls.appendChild(trainButton);

            let skillsButton = document.createElement("button");
            skillsButton.innerText = "Manage Skills";
            skillsButton.className = "skills-button";
            skillsButton.onclick = () => {
                if (game.gameState === "In Village") {
                    Log.debug("Manage Skills button clicked");
                    let skillsList = game.player.skills.map(s => `<span class='output-text-${s.style}'>${s.name}</span>`).join(", ") || "No skills equipped.";
                    let inventoryList = game.player.skillInventory.map(s => `<span class='output-text-${s.style}'>${s.name}</span>`).join(", ") || "No skills in inventory.";
                    queueOutput(`<span class='output-text-neutral'>Equipped Skills: ${skillsList}<br>Inventory: ${inventoryList}</span>`);
                } else {
                    queueOutput("<span class='output-text-neutral'>Cannot manage skills outside village!</span>");
                }
            };
            controls.appendChild(skillsButton);

            let travelButton = document.createElement("button");
            travelButton.innerText = "Travel";
            travelButton.className = "travel-button";
            travelButton.onclick = () => {
                if (game.gameState === "In Village") {
                    Log.debug("Travel button clicked");
                    let villages = ["Newb Village", "Hidden Leaf", "Sand Village"];
                    let areas = MapData[villageName]?.areas || [];
                    let options = [...villages, ...areas];
                    let choice = prompt(`Travel to: ${options.join(", ")}`);
                    if (choice && options.includes(choice)) {
                        game.battleNum = 0; // Reset battle count for new travel
                        game.player.lastVillage = choice; // Update destination before fights
                        startTravelFight();
                    } else {
                        queueOutput("<span class='output-text-neutral'>Invalid travel destination!</span>");
                    }
                } else {
                    queueOutput("<span class='output-text-neutral'>Cannot travel outside village!</span>");
                }
            };
            controls.appendChild(travelButton);

            let shopButton = document.createElement("button");
            shopButton.innerText = "Shop";
            shopButton.className = "shop-button";
            shopButton.onclick = () => {
                if (game.gameState === "In Village") {
                    Log.debug("Shop button clicked");
                    queueOutput("<span class='output-text-neutral'>Shop opened! (Placeholder: Buy items here later)</span>");
                } else {
                    queueOutput("<span class='output-text-neutral'>Cannot access shop outside village!</span>");
                }
            };
            controls.appendChild(shopButton);
            Log.debug(`Arrived at ${villageName}, controls set up, gameState: ${game.gameState}`);
        }
    }, 100);
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
