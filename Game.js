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
    }
}

// Jutsu Data (from Jutsu.js, simplified for example)
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
    }
    // Add more Jutsu from Jutsu.js as needed
];

// Status Effects
const statusEffects = {
    regen: (mob) => {
        mob.hp = Math.min(mob.maxHp, mob.hp + 1);
        logBattle(`${mob.name} regenerates 1 HP due to Regen!`);
    }
};

// Utility Functions
function logBattle(message) {
    const log = document.getElementById("battle-log-content");
    log.innerHTML += `<p>${message}</p>`;
    log.scrollTop = log.scrollHeight;
}

function getRankValue(rank) {
    const ranks = { "D": 1, "C": 2, "B": 3, "A": 4, "S": 5 };
    return ranks[rank] || 0;
}

// Jutsu Selection
function openJutsuSelect() {
    const optionsDiv = document.getElementById("jutsu-options");
    optionsDiv.innerHTML = "";
    const eligibleJutsu = allJutsu.filter(jutsu => {
        const req = jutsu.requirements;
        const styleRank = player.fightingStyles[req.style] || "None";
        return getRankValue(styleRank) >= getRankValue(req.rank);
    });
    
    // Select 3 random Jutsu
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
    document.querySelector(".jutsu-select").classList.add("hidden");
}

function addJutsuToInventory(jutsu) {
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
    activeDiv.innerHTML = "";
    inventoryDiv.innerHTML = "";

    player.activeJutsu.forEach((jutsu, index) => {
        const card = document.createElement("div");
        card.className = "jutsu-card";
        card.innerHTML = `
            <h4>${jutsu.name}</h4>
            <p>Style: ${jutsu.requirements.style}</p>
            <p>Rank: ${jutsu.requirements.rank}</p>
            <button onclick="moveJutsuToInventory(${index})">To Inventory</button>
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
            <button onclick="moveJutsuToActive(${index})">To Active</button>
        `;
        inventoryDiv.appendChild(card);
    });
}

function moveJutsuToInventory(index) {
    if (player.activeJutsu.length > 0) {
        player.inventory.push(player.activeJutsu.splice(index, 1)[0]);
        updateJutsuDisplay();
    }
}

function moveJutsuToActive(index) {
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

function startBattle() {
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
    // Update UI
    updateBattleUI();
    
    // Check Start of Turn Status Effects
    user.statusEffects.forEach(status => {
        if (statusEffects[status.effect]) {
            statusEffects[status.effect](user);
            status.duration--;
        }
    });
    user.statusEffects = user.statusEffects.filter(status => status.duration > 0);

    // Perform Turn Action
    turnAction();

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

    // Check if battle ends
    if (target.hp <= 0) {
        logBattle(`${target.name} is defeated! ${user.name} wins!`);
        return;
    }
    if (user.hp <= 0) {
        logBattle(`${user.name} is defeated! ${target.name} wins!`);
        return;
    }
}

function endTurn() {
    [user, target] = [target, user]; // Swap user and target
    setTimeout(takeTurn, 1000); // Delay for readability
}

function updateBattleUI() {
    document.getElementById("user-name").textContent = player.name;
    document.getElementById("user-hp").textContent = `${player.hp}/${player.maxHp}`;
    document.getElementById("user-status").textContent = player.statusEffects.map(s => s.name).join(", ") || "None";
    document.getElementById("user-sprite").src = player.sprite;

    document.getElementById("opponent-name").textContent = opponent.name;
    document.getElementById("opponent-hp").textContent = `${opponent.hp}/${opponent.maxHp}`;
    document.getElementById("opponent-status").textContent = opponent.statusEffects.map(s => s.name).join(", ") || "None";
    document.getElementById("opponent-sprite").src = opponent.sprite;
}

// Initialize Game
const player = new Mob(
    "Naruto",
    100,
    100,
    "Student",
    { Ninjutsu: "D", Taijutsu: "D", Genjutsu: "D" },
    [allJutsu[0], allJutsu[2]], // Start with Fireball and Punch
    [allJutsu[1]], // Regen in Inventory
    [],
    "https://via.placeholder.com/150"
);

const opponent = new Mob(
    "Sasuke",
    100,
    100,
    "Student",
    { Ninjutsu: "D", Taijutsu: "D", Genjutsu: "D" },
    [allJutsu[0], allJutsu[2]],
    [],
    [],
    "https://via.placeholder.com/150"
);

updateJutsuDisplay();
updateBattleUI();
