function startBattle(player, enemy, battleType) {
    console.log(`Starting ${battleType} battle: ${player.name} vs. ${enemy.name}`);
    let user = player, target = enemy;
    while (user.hp > 0 && target.hp > 0) {
        const skill = user.skills[Math.floor(Math.random() * user.skills.length)];
        console.log(`${user.name} uses ${skill.name}!`);
        if (skill.support) {
            applyStatusEffect(user, skill.effect);
        } else {
            let damage = skill.damage * skill.hits;
            target.hp = Math.max(0, target.hp - damage);
            console.log(`Deals ${damage} damage. ${target.name} HP: ${target.hp}/${target.maxHP}`);
        }
        [user, target] = [target, user]; // Switch turns
    }
    if (target.hp <= 0) {
        console.log(`${target.name} defeated! ${user.name} wins!`);
        applyReward(player, battleType, enemy.name);
    }
}

function applyStatusEffect(target, effect) {
    target.statusEffects.push({ ...effect, duration: effect.duration });
}

function applyReward(player, battleType, enemyName) {
    if (battleType === "training") {
        player.exp = Math.min(player.maxEXP, player.exp + 1);
        console.log(`Earned 1 EXP. Total: ${player.exp}/${player.maxEXP}`);
    } else if (battleType === "eventFight" && enemyName === "SparringDummy") {
        console.log("Good!");
    }
}
