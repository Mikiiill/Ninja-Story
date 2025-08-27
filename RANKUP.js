function initiateStyleSelection() {
    Log.debug("Initiating style selection");
    let controls = document.getElementById("style-controls");
    controls.innerHTML = "";
    let styles = ["Ninjutsu", "Genjutsu", "Taijutsu", "Fire", "Lightning", "Earth"];
    styles.forEach((style) => {
        let button = document.createElement("button");
        button.innerText = style;
        button.className = style.toLowerCase();
        button.onclick = () => selectStyle(style, button);
        controls.appendChild(button);
    });
}

function selectStyle(style, button) {
    if (game.gameState === "chooseStyles" && game.player.ninjaStyles[style] && game.player.ninjaStyles[style] === "D-Rank" && Object.values(game.player.ninjaStyles).filter(r => r !== "D-Rank").length < 2) {
        if (confirm(`Upgrade <span class='output-text-${style.toLowerCase()}'>${style}</span> to C-Rank?`)) {
            game.player.ninjaStyles[style] = "C-Rank";
            queueOutput(`<span class='output-text-${style.toLowerCase()}'>${style}</span> trained to C-Rank!`);
            button.className += " disabled";
            button.disabled = true;
            if (Object.values(game.player.ninjaStyles).filter(r => r !== "D-Rank").length === 2) {
                document.getElementById("style-controls").innerHTML = "";
                setupInitialJutsuSelection();
            } else {
                let remainingPoints = 2 - Object.values(game.player.ninjaStyles).filter(r => r !== "D-Rank").length;
                queueOutput(`<span class='output-text-neutral'>You have ${remainingPoints} point${remainingPoints === 1 ? '' : 's'} remaining to upgrade another style.</span>`);
            }
        }
    }
}

function setupInitialJutsuSelection() {
    Log.debug("Setting up initial Jutsu selection");
    game.gameState = "chooseInitialJutsu";
    performJutsuSelection(3, () => ArriveVillage("Newb Village"));
}

function performJutsuSelection(times, callback) {
    if (times > 0) {
        Log.debug(`Performing Jutsu selection, remaining times: ${times}`);
        let controls = document.getElementById("jutsu-controls");
        controls.innerHTML = "";
        let skillSet = new Skills();
        let availableJutsu = skillSet.skills.filter(skill => skillSet.canUseSkill(game.player, skill));
        let randomJutsu = [];
        for (let i = 0; i < 3 && availableJutsu.length > 0; i++) {
            let index = Math.floor(Math.random() * availableJutsu.length);
            randomJutsu.push(availableJutsu.splice(index, 1)[0]);
        }
        if (randomJutsu.length > 0) {
            randomJutsu.forEach(jutsu => {
                let button = document.createElement("button");
                button.innerText = jutsu.name;
                button.onclick = function() { selectJutsu(jutsu, () => performJutsuSelection(times - 1, callback)); };
                controls.appendChild(button);
            });
        } else {
            queueOutput("<span class='output-text-neutral'>No jutsu available based on styles and ranks.</span>");
            if (callback) callback();
        }
    } else {
        Log.debug("Jutsu selection completed");
        if (callback) callback();
    }
}

function selectJutsu(jutsu, callback) {
    if (game.gameState === "chooseInitialJutsu" || game.gameState === "postBattle") {
        if (confirm(`Select <span class='output-text-${jutsu.style}'>${jutsu.name}</span>?`)) {
            let count = game.player.skills.filter(s => s.name === jutsu.name).length + game.player.skillInventory.filter(s => s.name === jutsu.name).length;
            if (count < 3 || (game.player.skills.length + game.player.skillInventory.length < 10 && (jutsu.rank === "D-Rank" || jutsu.rank === "C-Rank"))) {
                game.player.skillInventory.push(jutsu);
                queueOutput(`<span class='output-text-${jutsu.style}'>${jutsu.name}</span> added to skill inventory!`);
                updateSkillCount();
                document.getElementById("jutsu-controls").innerHTML = "";
                if (callback) callback();
            } else {
                game.player.gold += jutsu.rank === "D-Rank" ? 5 : jutsu.rank === "C-Rank" ? 10 : 50;
                queueOutput(`Extra <span class='output-text-${jutsu.style}'>${jutsu.name}</span> converted to ${jutsu.rank === "D-Rank" ? 5 : jutsu.rank === "C-Rank" ? 10 : 50} gold due to owning 3 or more!`);
                updateSkillCount();
                document.getElementById("jutsu-controls").innerHTML = "";
                if (callback) callback();
            }
        }
    }
}
