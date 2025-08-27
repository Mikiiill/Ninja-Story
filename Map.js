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
                    if ((game.player.Rank === "Student" && game.player.skills.length >= 4) || game.player.Rank !== "Student") {
                        let enemy = generateTrainingEnemy();
                        startBattle(enemy, "training");
                    } else {
                        queueOutput("<span class='output-text-neutral'>Cannot train: Student needs 4 skills!</span>");
                    }
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
                    let skillsControls = document.getElementById("skill-controls");
                    skillsControls.innerHTML = "";
                    let equippedDiv = document.createElement("div");
                    equippedDiv.innerHTML = "<strong>Equipped Skills:</strong><br>";
                    game.player.skills.forEach((skill, index) => {
                        let skillButton = document.createElement("button");
                        skillButton.innerText = skill.name;
                        skillButton.className = `output-text-${skill.style}`;
                        skillButton.onclick = () => {
                            game.player.skillInventory.push(skill);
                            game.player.skills.splice(index, 1); // Remove only the clicked instance
                            queueOutput(`<span class='output-text-${skill.style}'>${skill.name}</span> moved to inventory!`);
                            skillsButton.onclick(); // Refresh
                        };
                        equippedDiv.appendChild(skillButton);
                    });
                    if (game.player.skills.length === 0) equippedDiv.innerHTML += "None";
                    let inventoryDiv = document.createElement("div");
                    inventoryDiv.innerHTML = "<strong>Inventory:</strong><br>";
                    game.player.skillInventory.forEach((skill, index) => {
                        let skillButton = document.createElement("button");
                        skillButton.innerText = skill.name;
                        skillButton.className = `output-text-${skill.style}`;
                        skillButton.onclick = () => {
                            if (game.player.skills.length < 10) {
                                game.player.skills.push(skill);
                                game.player.skillInventory.splice(index, 1); // Remove only the clicked instance
                                queueOutput(`<span class='output-text-${skill.style}'>${skill.name}</span> equipped!`);
                                skillsButton.onclick(); // Refresh
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
                if (game.gameState === "In Village") {
                    Log.debug("Travel button clicked");
                    let travelControls = document.getElementById("travel-controls");
                    travelControls.style.display = "flex";
                    let villages = ["Newb Village", "Hidden Leaf", "Sand Village"];
                    let areas = MapData[villageName]?.areas || [];
                    let options = [...villages, ...areas];
                    options.forEach(village => {
                        let villageButton = document.createElement("button");
                        villageButton.innerText = village;
                        villageButton.onclick = () => {
                            if (confirm(`Confirm travel to ${village}?`)) {
                                if ((game.player.Rank === "Student" && game.player.skills.length >= 4) || game.player.Rank !== "Student") {
                                    game.battleNum = 0;
                                    game.player.lastVillage = village;
                                    Log.debug(`Starting travel fight to ${village}`);
                                    startTravelFight();
                                    travelControls.style.display = "none";
                                } else {
                                    queueOutput("<span class='output-text-neutral'>Cannot travel: Student needs 4 skills!</span>");
                                    travelControls.style.display = "none";
                                }
                            } else {
                                travelControls.style.display = "none";
                            }
                        };
                        travelControls.appendChild(villageButton);
                    });
                    let cancelButton = document.createElement("button");
                    cancelButton.innerText = "Cancel";
                    cancelButton.onclick = () => { travelControls.style.display = "none"; };
                    travelControls.appendChild(cancelButton);
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
