const rankUpButton = document.getElementById("RANKUP");
rankUpButton.addEventListener("click", debounceAction(() => {
    logBattle("RANKUP clicked!");
    if (inBattle) {
        logBattle(`Cannot rank up during battle! inBattle: ${inBattle}`);
        return;
    }
    if (isRankUpSessionActive) {
        logBattle("Rank up session already active!");
        return;
    }
    isRankUpSessionActive = true;
    game.rankUpPoints = 2;
    disableActionButtons();
    const optionsDiv = document.getElementById("jutsu-options");
    if (optionsDiv) {
        optionsDiv.innerHTML = "";
        const availableStyles = ["Ninjutsu", "Genjutsu", "Taijutsu", "Fire", "Lightning", "Earth"];
        availableStyles.forEach(style => {
            const currentRank = player.fightingStyles[style] || "None";
            const card = document.createElement("div");
            card.className = "jutsu-card";
            card.innerHTML = `<h4>${style}</h4><p>Current Rank: ${currentRank}</p>`;
            card.onclick = debounceAction(() => upgradeFightingStyle(style));
            optionsDiv.appendChild(card);
        });
        const jutsuSelect = document.querySelector(".jutsu-select");
        if (jutsuSelect) {
            jutsuSelect.classList.remove("hidden");
            optionsDiv.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            logBattle("Error: jutsu-select not found");
            enableActionButtons();
            isRankUpSessionActive = false;
        }
    } else {
        logBattle("Error: jutsu-options not found");
        enableActionButtons();
        isRankUpSessionActive = false;
    }
}));
