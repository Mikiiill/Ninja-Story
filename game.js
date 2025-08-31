// Mob Class
class Mob {
    constructor(name, hp, maxHp, rank, fightingStyles, activeJutsu, inventory, statusEffects, sprite) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.rank = rank;
        this.fightingStyles = fightingStyles; // { style: rank }
        this.activeJutsu = activeJutsu || []; // Max 10
        this.inventory = inventory || []; // Unequipped Jutsu
        this.statusEffects = statusEffects || []; // { name, duration, effect }
        this.sprite = sprite;
        this.xp = 0; // For reward system
    }
}

// Jutsu Data
const allJutsu = [
    {
        name: "Fireball Jutsu",
        action: (user, target) => {
            target.hp -= 5;
            logBattle(`${user.name} uses Fireball Jutsu, dealing 5 damage to ${target.name}!`);
        },
        requirements: { style: "Ninjutsu", rank: "D" },
        support: false
    },
    {
        name: "Regen Jutsu",
        action: (user) => {
            user.statusEffects.push({ name: "Regen", duration: 3, effect: "regen" });
            logBattle(`${user.name} uses Regen Jutsu, gaining Regen status!`);
        },
        requirements: { style: "Ninjutsu", rank: "D" },
        support: true
    },
    {
        name: "Punch",
        action: (user, target) => {
            target.hp -= 3;
            logBattle(`${user.name} uses Punch, dealing 3 damage to ${target.name}!`);
        },
        requirements: { style: "Taijutsu", rank: "D" },
        support: false
    },
    {
        name: "Illusion Jutsu",
        action: (user, target) => {
            target.statusEffects.push({ name: "Stun", duration: 1, effect: "stun" });
            logBattle(`${user.name} uses Illusion Jutsu, stunning ${target.name}!`);
        },
        requirements: { style: "Genjutsu", rank: "D" },
        support: false
    },
    {
        name: "Quick Strike",
        action: (user, target) => {
            target.hp -= 4;
            logBattle(`${user.name} uses Quick Strike, dealing 4 damage to ${target.name}!`);
        },
        requirements: { style: "Taijutsu", rank: "D" },
        support: false
    },
    {
        name: "Heal Jutsu",
        action: (user) => {
            user.hp = Math.min(user.maxHp, user.hp + 5);
            logBattle(`${user.name} uses Heal Jutsu, restoring 5 HP!`);
        },
        requirements: { style: "Ninjutsu", rank: "D" },
        support: true
    }
];

// Status Effects
const statusEffects = {
    regen: (mob) => {
        mob.hp = Math.min(mob.maxHp, mob.hp + 1);
        logBattle(`${mob.name} regenerates 1 HP due to Regen!`);
    },
    stun: (mob) => {
        logBattle(`${mob.name} is stunned and skips their turn!`);
        return true; // Indicates turn skip
    }
};

// Utility Functions
function logBattle(message) {
    const log = document.getElementById("battle-log-content");
    if (log) {
        log.innerHTML += `<p>${message}</p>`;
        log.scrollTop = log.scrollHeight;
    } else {
        console.error("Battle Log Error:", message);
    }
}

function getRankValue(rank) {
    const ranks = { "D": 1, "C": 2, "B": 3, "A": 4, "S": 5 };
    return ranks[rank] || 0;
}

// Jutsu Menu Toggle
let isBattleActive = false;

function toggleJutsuMenu() {
    console.log("Toggle Jutsu Menu clicked");
    if (isBattleActive) {
        logBattle("Cannot toggle Jutsu menu during battle!");
        return;
    }
    const content = document.getElementById("jutsu-management-content");
    if (content) {
        content.classList.toggle("hidden");
    } else {
        console.error("Jutsu management content not found");
    }
    updateButtonStates();
}

// Jutsu Selection
function openJutsuSelect() {
    console.log("Select New Jutsu clicked");
    if (isBattleActive) {
        logBattle("Cannot select Jutsu during battle!");
        return;
    }
    const optionsDiv = document.getElementById("jutsu-options");
    if (!optionsDiv) {
        console.error("Jutsu options div not found");
        return;
    }
    optionsDiv.innerHTML = "";
    const eligibleJutsu = allJutsu.filter(jutsu => {
        const req = jutsu.requirements;
        const styleRank = player.fightingStyles[req.style] || "None";
        return getRankValue(styleRank) >= getRankValue(req.rank);
    });
    
    const shuffled = eligibleJutsu.sort(() => 0.5 - Math.random()).slice(0, 3);
    shuffled.forEach(jutsu => {
        const card = document.createElement("div");
        card.className = "jutsu-card";
        card.innerHTML = `
            <h4>${jutsu.name}</h4>
            <p>Style: ${jutsu.requirements.style}</p>
            <p>Rank: ${jutsu.requirements.rank}</p>
        `;
        card.onclick = () => addJutsuToInventory(jutsu);
        optionsDiv.appendChild(card);
    });
    document.querySelector(".jutsu-select").classList.remove("hidden");
}

function closeJutsuSelect() {
    console.log("Cancel Jutsu Select clicked");
    const jutsuSelect = document.querySelector(".jutsu-select");
    if (jutsuSelect) {
        jutsuSelect.classList.add("hidden");
    } else {
        console.error("Jutsu select div not found");
    }
}

function addJutsuToInventory(jutsu) {
    console.log(`Adding ${jutsu.name} to inventory`);
    const totalCopies = player.activeJutsu.concat(player.inventory).filter(j => j.name === jutsu.name).length;
    if (totalCopies >= 4) {
        logBattle(`Cannot add ${jutsu.name}: Max 4 copies allowed!`);
        return;
    }
    player.inventory.push(jutsu);
    updateJutsuDisplay();
    closeJutsuSelect();
}

// Jutsu Management
function updateJutsuDisplay() {
    const activeDiv = document.getElementById("active-jutsu");
    const inventoryDiv = document.getElementById("inventory-jutsu");
    if (!activeDiv || !inventoryDiv) {
        console.error("Jutsu display divs not found");
        return;
    }
    activeDiv.innerHTML = "";
    inventoryDiv.innerHTML = "";

    player.activeJutsu.forEach((jutsu, index) => {
        const card = document.createElement("div");
        card.className = "jutsu-card";
        card.innerHTML = `
            <h4>${jutsu.name}</h4>
            <p>Style: ${jutsu.requirements.style}</p>
            <p>Rank: ${jutsu.requirements.rank}</p>
            <button onclick="moveJutsuToInventory(${index})" ${isBattleActive ? "disabled" : ""}>To Inventory</button>
        `;
        activeDiv.appendChild(card);
    });

    player.inventory.forEach((jutsu, index) => {
        const card = document.createElement("div");
        card.className = "jutsu-card";
        card.innerHTML = `
            <h4>${jutsu.name}</h4>
            <p>Style: ${jutsu.requirements.style}</p>
            <p>Rank: ${jutsu.requirements.rank}</p>
            <button onclick="moveJutsuToActive(${index})" ${isBattleActive ? "disabled" : ""}>To Active</button>
        `;
        inventoryDiv.appendChild(card);
    });
}

function moveJutsuToInventory(index) {
    console.log(`Moving Jutsu ${index} to inventory`);
    if (isBattleActive) {
        logBattle("Cannot move Jutsu during battle!");
        return;
    }
    if (player.activeJutsu.length > 0) {
        player.inventory.push(player.activeJutsu.splice(index, 1)[0]);
        updateJutsuDisplay();
    }
}

function moveJutsuToActive(index) {
    console.log(`Moving Jutsu ${index} to active`);
    if (isBattleActive) {
        logBattle("Cannot move Jutsu during battle!");
        return;
    }
    if (player.activeJutsu.length < 10) {
        const jutsu = player.inventory[index];
        const totalCopies = player.activeJutsu.concat(player.inventory).filter(j => j.name === jutsu.name).length;
        if (totalCopies <= 4) {
            player.activeJutsu.push(player.inventory.splice(index, 1)[0]);
            updateJutsuDisplay();
        } else {
            logBattle(`Cannot equip ${jutsu.name}: Max 4 copies allowed!`);
        }
    } else {
        logBattle("Cannot equip Jutsu: Active Jutsu limit (10) reached!");
    }
}

// Battle System
let user, target;
let isBattleActive = false;

function updateButtonStates() {
    const selectJutsuBtn = document.getElementById("select-jutsu-btn");
    const startBattleBtn = document.getElementById("start-battle-btn");
    const toggleMenuBtn = document.querySelector('button[onclick="toggleJutsuMenu()"]');
    if (selectJutsuBtn && startBattleBtn && toggleMenuBtn) {
        selectJutsuBtn.disabled = isBattleActive;
        startBattleBtn.disabled = isBattleActive;
        toggleMenuBtn.disabled = isBattleActive;
    } else {
        console.error("Button elements not found");
    }
}

function awardReward(winner, loser) {
    const eligibleJutsu = allJutsu.filter(jutsu => {
        const req = jutsu.requirements;
        const styleRank = winner.fightingStyles[req.style] || "None";
        return getRankValue(styleRank) >= getRankValue(req.rank);
    });
    const rewardJutsu = eligibleJutsu[Math.floor(Math.random() * eligibleJutsu.length)];
    const totalCopies = winner.activeJutsu.concat(winner.inventory).filter(j => j.name === rewardJutsu.name).length;
    if (totalCopies < 4) {
        winner.inventory.push(rewardJutsu);
        logBattle(`${winner.name} defeated ${loser.name}! Received ${rewardJutsu.name} as reward!`);
    } else {
        logBattle(`${winner.name} defeated ${loser.name}! No Jutsu added (max copies reached).`);
    }
    winner.xp += 50;
    logBattle(`${winner.name} gained 50 XP!`);
    isBattleActive = false;
    updateButtonStates();
    updateJutsuDisplay();
}

function checkForDeath() {
    if (player.hp <= 0 || opponent.hp <= 0) {
        const winner = player.hp <= 0 ? opponent : player;
        const loser = player.hp <= 0 ? player : opponent;
        logBattle(`${loser.name} is defeated! ${winner.name} wins!`);
        awardReward(winner, loser);
        return true;
    }
    return false;
}

function startBattle() {
    console.log("Start Battle clicked");
    if (isBattleActive) {
        logBattle("Battle already in progress!");
        return;
    }
    isBattleActive = true;
    updateButtonStates();
    user = player;
    target = opponent;
    logBattle(`${user.name} vs ${target.name}!`);
    setTurnOrder();
}

function setTurnOrder() {
    if (Math.random() < 0.5) {
        user = player;
        target = opponent;
        logBattle(`${player.name} goes first!`);
    } else {
        user = opponent;
        target = player;
        logBattle(`${opponent.name} goes first!`);
    }
    takeTurn();
}

function takeTurn() {
    if (!isBattleActive) return;
    console.log(`Turn for ${user.name}`);
    updateBattleUI();
    
    // Check Start of Turn Status Effects
    let skipTurn = false;
    user.statusEffects.forEach(status => {
        if (statusEffects[status.effect]) {
            if (status.effect === "stun" && statusEffects[status.effect](user)) {
                skipTurn = true;
            } else {
                statusEffects[status.effect](user);
            }
            status.duration--;
        }
    });
    user.statusEffects = user.statusEffects.filter(status => status.duration > 0);

    if (skipTurn) {
        logBattle(`${user.name} skips their turn due to Stun!`);
        endTurn();
        return;
    }

    // Perform Turn Action
    turnAction();

    // Check for Death
    if (checkForDeath()) {
        return;
    }

    // End Turn
    endTurn();
}

function turnAction() {
    if (user.activeJutsu.length > 0) {
        const jutsu = user.activeJutsu[Math.floor(Math.random() * user.activeJutsu.length)];
        if (jutsu.support) {
            jutsu.action(user);
        } else {
            jutsu.action(user, target);
        }
    } else {
        logBattle(`${user.name} has no Active Jutsu!`);
    }
}

function endTurn() {
    if (!isBattleActive) return;
    [user, target] = [target, user];
    setTimeout(takeTurn, 1000);
}

function updateBattleUI() {
    const userName = document.getElementById("user-name");
    const userHp = document.getElementById("user-hp");
    const userStatus = document.getElementById("user-status");
    const opponentName = document.getElementById("opponent-name");
    const opponentHp = document.getElementById("opponent-hp");
    const opponentStatus = document.getElementById("opponent-status");

    if (userName && userHp && userStatus && opponentName && opponentHp && opponentStatus) {
        userName.textContent = player.name;
        userHp.textContent = `${player.hp}/${player.maxHp}`;
        userStatus.textContent = player.statusEffects.map(s => s.name).join(", ") || "None";
        opponentName.textContent = opponent.name;
        opponentHp.textContent = `${opponent.hp}/${opponent.maxHp}`;
        opponentStatus.textContent = opponent.statusEffects.map(s => s.name).join(", ") || "None";
    } else {
        console.error("UI elements not found");
    }
}

// Assign Random Jutsu
function assignRandomJutsu(mob, count) {
    const eligibleJutsu = allJutsu.filter(jutsu => {
        const req = jutsu.requirements;
        const styleRank = mob.fightingStyles[req.style] || "None";
        return getRankValue(styleRank) >= getRankValue(req.rank);
    });
    const shuffled = eligibleJutsu.sort(() => 0.5 - Math.random()).slice(0, count);
    mob.activeJutsu = shuffled;
    console.log(`${mob.name} assigned Jutsu: ${shuffled.map(j => j.name).join(", ")}`);
}

// Initialize Characters
const player = new Mob(
    "Naruto",
    100,
    100,
    "Student",
    { Ninjutsu: "D", Taijutsu: "D", Genjutsu: "D" },
    [],
    [],
    [],
    "https://via.placeholder.com/150"
);

const opponent = new Mob(
    "Sasuke",
    100,
    100,
    "Student",
    { Ninjutsu: "D", Taijutsu: "D", Genjutsu: "D" },
    [],
    [],
    [],
    "https://via.placeholder.com/150"
);

// Initialize Game
console.log("Initializing Game...");
assignRandomJutsu(player, 4);
assignRandomJutsu(opponent, 4);
updateJutsuDisplay();
updateBattleUI();
updateButtonStates();
