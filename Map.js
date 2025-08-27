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
                if (game.gameState === "In Village" && game.player.skills.length > 0) { // Require at least one skill
                    Log.debug("Train button clicked");
                    let enemy = generateTrainingEnemy();
                    Log.debug(`Generated enemy: ${enemy.name} with HP ${enemy.hp}`);
                    startBattle(enemy, "training");
                } else {
                    queueOutput("<span class='output-text-neutral'>Cannot train without equipped skills or outside village!</span>");
                }
            };
            controls.appendChild(trainButton);

            let skillsButton = document.createElement("button");
            skillsButton.innerText = "Manage Skills";
            skillsButton.className = "skills-button";
            skillsButton.onclick = () => {
                if (game.gameState === "In Village") {
                    Log.debug("Manage Skills button clicked");
                    let skillsControls = document.getElementById("skill-controls");
                    skillsControls.innerHTML = "";
                    let equippedDiv = document.createElement("div");
                    equippedDiv.innerHTML = "<strong>Equipped Skills:</strong><br>";
                    game.player.skills.forEach(skill => {
                        let skillButton = document.createElement("button");
                        skillButton.innerText = skill.name;
                        skillButton.className = `output-text-${skill.style}`;
                        skillButton.onclick = () => {
                            if (game.player.skillInventory.length < 10) {
                                game.player.skills = game.player.skills.filter(s => s.name !== skill.name);
                                game.player.skillInventory.push(skill);
                                queueOutput(`<span class='output-text-${skill.style}'>${skill.name}</span> moved to inventory!`);
                                skillsButton.onclick();
                            } else {
                                queueOutput("<span class='output-text-neutral'>Inventory full (10 max)!</span>");
                            }
                        };
                        equippedDiv.appendChild(skillButton);
                    });
                    if (game.player.skills.length === 0) equippedDiv.innerHTML += "None";
                    let inventoryDiv = document.createElement("div");
                    inventoryDiv.innerHTML = "<strong>Inventory:</strong><br>";
                    game.player.skillInventory.forEach(skill => {
                        let skillButton = document.createElement("button");
                        skillButton.innerText = skill.name;
                        skillButton.className = `output-text-${skill.style}`;
                        skillButton.onclick = () => {
                            if (game.player.skills.length < 10) {
                                game.player.skillInventory = game.player.skillInventory.filter(s => s.name !== skill.name);
                                game.player.skills.push(skill);
                                queueOutput(`<span class='output-text-${skill.style}'>${skill.name}</span> equipped!`);
                                skillsButton.onclick();
                            } else {
                                queueOutput("<span class='output-text-neutral'>Skill limit (10) reached!</span>");
                            }
                        };
                        inventoryDiv.appendChild(skillButton);
                    });
                    if (game.player.skillInventory.length === 0) inventoryDiv.innerHTML += "None";
                    skillsControls.appendChild(equippedDiv);
                    skillsControls.appendChild(inventoryDiv);
                    let doneButton = document.createElement("button");
                    doneButton.innerText = "Done";
                    doneButton.onclick = () => {
                        skillsControls.innerHTML = "";
                        queueOutput("<span class='output-text-neutral'>Skill management closed.</span>");
                    };
                    skillsControls.appendChild(doneButton);
                } else {
                    queueOutput("<span class='output-text-neutral'>Cannot manage skills outside village!</span>");
                }
            };
            controls.appendChild(skillsButton);

            let travelButton = document.createElement("button");
            travelButton.innerText = "Travel";
            travelButton.className = "travel-button";
            travelButton.onclick = () => {
                if (game.gameState === "In Village" && game.player.skills.length > 0) { // Require at least one skill
                    Log.debug("Travel button clicked");
                    let villages = ["Newb Village", "Hidden Leaf", "Sand Village"];
                    let areas = MapData[villageName]?.areas || [];
                    let options = [...villages, ...areas];
                    let choice = prompt(`Travel to: ${options.join(", ")}`).trim().toLowerCase(); // Case-insensitive
                    Log.debug(`Travel choice: ${choice}, Options: ${options.join(", ")}`);
                    let validChoice = options.find(opt => opt.toLowerCase() === choice);
                    if (validChoice) {
                        game.battleNum = 0; // Reset battle count for new travel
                        game.player.lastVillage = validChoice; // Update destination before fights
                        Log.debug(`Starting travel fight to ${validChoice}`);
                        startTravelFight();
                    } else {
                        queueOutput("<span class='output-text-neutral'>Invalid travel destination!</span>");
                    }
                } else {
                    queueOutput("<span class='output-text-neutral'>Cannot travel without equipped skills or outside village!</span>");
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
