function rankUpStyles(player) {
    player.rank = "Genin"; // Placeholder for future NPC event logic
    console.log(`${player.name} ranked up to ${player.rank}!`);
}

function learnJutsu(player) {
    if (player.exp >= player.maxEXP) {
        player.exp = 0;
        const availableJutsu = Object.values(new Skills().skills).filter(j =>
            player.styles[j.style] && ["D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"].indexOf(player.styles[j.style]) >= ["D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"].indexOf("D-Rank")
        );
        if (availableJutsu.length) {
            const jutsu = availableJutsu[0]; // Simplified selection
            player.addJutsu(jutsu);
            console.log(`Learned ${jutsu.name}!`);
        }
    }
}
