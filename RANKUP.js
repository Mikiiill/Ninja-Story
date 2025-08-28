function performStyleSelection(points) {
    var styles = ["Taijutsu", "Lightning", "Fire", "Genjutsu", "Medical", "Ninjutsu", "Feral"];
    var availableStyles = styles.filter(style => !Object.keys(game.player.ninjaStyles).includes(style));
    if (points > 0 && availableStyles.length > 0) {
        var selectedStyle = availableStyles[Math.floor(Math.random() * availableStyles.length)];
        game.player.ninjaStyles[selectedStyle] = "C-Rank";
        queueOutput(selectedStyle + " trained to C-Rank!");
        points--;
        if (points > 0) queueOutput("You have " + points + " point remaining to upgrade another style.");
        var skillSet = new Skills();
        var jutsu = skillSet.findSkill(getJutsuForStyle(selectedStyle));
        if (jutsu) {
            game.player.skillInventory.push(jutsu);
            game.player.skillInventory.push(jutsu); // Two copies
            queueOutput(jutsu.name + " added to skill inventory!");
        }
        if (points > 0) performStyleSelection(points);
        else game.gameState = "chooseInitialJutsu";
    } else {
        game.gameState = "In Village";
        queueOutput("Arrived at " + game.player.lastVillage + "! HP restored, status effects cleared.");
    }
}

function getJutsuForStyle(style) {
    var jutsuMap = {
        "Taijutsu": "Dynamic Entry",
        "Lightning": "Static Field Jutsu",
        "Fire": "Fireball Jutsu",
        "Genjutsu": "Demonic Mind",
        "Medical": "Healing Stance",
        "Ninjutsu": "Substitution Jutsu",
        "Feral": "Bite"
    };
    return jutsuMap[style] || "Barrage";
}

function performJutsuSelection(points, isInitial, callback) {
    if (points > 0) {
        var availableJutsu = Object.keys(window.jutsu).filter(jutsu => {
            var skill = window.jutsu[jutsu];
            return skill.rank === "D-Rank" && !game.player.skills.some(s => s.name === jutsu) && !game.player.skillInventory.some(s => s.name === jutsu);
        });
        if (availableJutsu.length > 0) {
            var selectedJutsu = availableJutsu[Math.floor(Math.random() * availableJutsu.length)];
            game.player.skillInventory.push(window.jutsu[selectedJutsu]);
            queueOutput(selectedJutsu + " added to skill inventory!");
            points--;
            if (points > 0) performJutsuSelection(points, isInitial, callback);
            else if (callback) callback();
        }
    } else if (callback) {
        callback();
    }
}

function performEXPUpdate() {
    game.player.exp = Math.min(game.player.maxExp, (game.player.exp || 0) + 1);
    queueOutput("<span class='output-text-neutral'>Training fight completed! EXP: " + game.player.exp + "/" + game.player.maxExp + "</span>");
    if (game.player.exp === game.player.maxExp) {
        performJutsuSelection(1, false, function() {
            game.player.exp = 0;
            ArriveVillage(game.player.lastVillage);
        });
    } else {
        ArriveVillage(game.player.lastVillage);
    }
}
