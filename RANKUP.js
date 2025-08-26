function initiateStyleSelection() {
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
        if (confirm(`Upgrade ${style} to C-Rank?`)) {
            game.player.ninjaStyles[style] = "C-Rank";
            queueOutput(`<span class="output-text-${style.toLowerCase()}">${style}</span> trained to C-Rank!`);
            button.className += " disabled";
            button.disabled = true;
            if (Object.values(game.player.ninjaStyles).filter(r => r !== "D-Rank").length === 2) {
                document.getElementById("style-controls").innerHTML = "";
                setupInitialJutsuSelection();
            } else {
                let remainingPoints = 2 - Object.values(game.player.ninjaStyles).filter(r => r !== "D-Rank").length;
                queueOutput(`You have ${remainingPoints} point${remainingPoints === 1 ? '' : 's'} remaining to upgrade another style.`);
            }
        }
    }
}

function setupInitialJutsuSelection() {
    game.gameState = "chooseInitialJutsu";
    performJutsuSelection(3);
}

function performJutsuSelection(times) {
    if (times > 0) {
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
                button.onclick = function() { selectJutsu(jutsu, () => performJutsuSelection(times - 1)); };
                controls.appendChild(button);
            });
        } else {
            queueOutput('No jutsu available based on styles and ranks.');
            addInitialBarrageCards();
        }
    } else {
        addInitialBarrageCards();
    }
}

function selectJutsu(jutsu, callback) {
    if (game.gameState === "chooseInitialJutsu" || game.gameState === "postBattle") {
        if (confirm(`Select <span class="output-text-${jutsu.style || 'neutral'}">${jutsu.name}</span>?`)) {
            let count = game.player.skills.filter(s => s.name === jutsu.name).length + game.player.skillInventory.filter(s => s.name === jutsu.name).length;
            if (count < 3 || (game.player.skills.length + game.player.skillInventory.length < 10 && (jutsu.rank === "D-Rank" || jutsu.rank === "C-Rank"))) {
                game.player.skillInventory.push(jutsu);
                queueOutput(`<span class="output-text-${jutsu.style || 'neutral'}">${jutsu.name}</span> added to skill inventory!`);
                updateSkillCount();
                document.getElementById("jutsu-controls").innerHTML = "";
                if (callback) callback();
            } else {
                game.player.gold += jutsu.rank === "D-Rank" ? 5 : jutsu.rank === "C-Rank" ? 10 : 50;
                queueOutput(`Extra <span class="output-text-${jutsu.style || 'neutral'}">${jutsu.name}</span> converted to ${jutsu.rank === "D-Rank" ? 5 : jutsu.rank === "C-Rank" ? 10 : 50} gold due to owning 3 or more!`);
                updateSkillCount();
                document.getElementById("jutsu-controls").innerHTML = "";
                if (callback) callback();
            }
        }
    }
}

function addInitialBarrageCards() {
    let barrageSkill = new Skills().findSkill("Barrage");
    game.player.skillInventory.push(barrageSkill);
    game.player.skillInventory.push(barrageSkill); // Total of 2 Barrage cards
    queueOutput("You received 2 free <span class='output-text-neutral'>Barrage</span> cards to start!");
    completeRankUp();
}

function completeRankUp() {
    game.gameState = "main";
    showMainScreen();
}
