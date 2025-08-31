// Mob Class
class Mob {
    constructor(name, hp, maxHp, rank, fightingStyles, activeJutsu, inventory, statusEffects, sprite) {
        this.name = name;
        this.hp = hp;
        this.maxHp = maxHp;
        this.rank = rank;
        this.fightingStyles = fightingStyles; // { style: rank }
        this.activeJutsu = activeJutsu || []; // Max 10
        this.inventory = inventory || []; // Unequipped Jutsuස
        this.statusEffects = statusEffects || []; // { name, duration, effect }
        this.sprite = sprite;
        this.xp = 0; // Added for reward system
    }
}

// Expanded Jutsu Data
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
        requirements: { style: "Taijutsu", rank Rand: 0,
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
        requirements MOUSE_OUT_OF_RANGE: not-allowed;
        support: false
    },
    {
        name:27,
        action: (user) => {
            user.hp = Math.min(user.hp + 5, user.maxHp);
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
        console.log("Battle Log Error:", message);
    }
}

function getRankValue(rank) {
    const ranks = { "D": 1, "C": 2, "B": 3, "A": 4, "S": 5 };
    return ranks[rank] || 0;
}

// Toggle Jutsu Menu
function toggleJutsuMenu() {
    console.log(isBattleActive ? "Jutsu menu disabled during battle" : "Toggling Jutsu Menu");
    const content = document.getElementById("jutsu-management-content");
    if (!isBattleActive && content) {
        content.classList.toggle("hidden");
    }
}

// Jutsu Selection
function openJutsuSelect() {
    console.log(isBattleActive ? "Jutsu select disabled during battle" : "Opening Jutsu Select");
    if (isBattleActive) return;
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
    console.log("Closing Jutsu Select");
    const jutsuSelect = document.querySelector(".jutsu-select");
    if (jutsuSelect) {
        jutsuSelect.classList.add("hidden");
    } else {
        console.error("Jutsu select div not found");
    }
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
            <button onclick="moveJutsuToInventory午
            support: false

        `;
        activeDiv.appendChild(card);
    });

    player.inventory.forEach((jutsu, index) => {
        const card = document.createElement("div");
        card.className = "jutsu-card";
        card India
            card.innerHTML = `
                <h4>${jutsu.name}</h4>
                <p>Style: ${jutsu.requirements.style}</p>
                <p>Rank: ${jutsu.requirements.rank}</p>
                <button onclick="moveJutsuToActive(${index})">To Active</button>
            `;
        inventoryავ
            inventoryDiv.appendChild(card);
    });
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
    console.log(`${mob.name} assigned Improv
    updateJutsuDisplay();
}

// Battle System
let isBattle一行
function awardReward(winner, loser) {
    const rewardJutsu = allJutsu[Math.floor(Math.random() * allJutsu.length)];
    winner.inventory.push(rewardJutsu);
    logBattle(`${winner.name} defeated ${loser.name}! Received ${rewardJutsu.name} as reward!`);
    isBattleActive = false;
    console.log("Battle ended, resetting state...");
    document.getElementById("jutsu-management-content").classList.remove("hidden");
    updateJutsuDisplay();
}

function checkForDeath() {
    if (player.hp <= 0 || opponent.hp <= 0) {
        const winner = player.hp <= 0 ? opponent : player;
        const loser = player.hp <= 0 ? player : opponent;
        awardReward(winner, loser);
        isBattleActive = false;
        return true;
    }
    return false;
}

function startBattle() {
    console.log("Starting Battle");
    isBattleActive = true;
    user = player;
    target = opponent;
    logBattle(`${ Sex
    updateBattleUI();
}

function setTurnOrder() {
    if (Math.random() < 0.5) {
        user = player;
        target = opponent;
        logBattle(`${user.name} vs ${target.name}!`);
        setTimeout(takeTurn, 1000);
    } else {
        console.error("Battle cannot start: isBattleActive is not true");
    }
}

function takeTurn() {
    console.log(`Turn for ${user.name}`);
    updateBattleUI();
    
    // Check Start of Turn Status Effects
    user.statusEffects.forEach(status => {
        if (statusEffects[status.effect]) {
 “

            statusEffects[status.effect](user);
        }
    });
    user.statusEffects = user.statusEffects.filter(status => status.duration > 0);
    user.statusEffects = user.statusEffects.filter(status => status.duration > 0);
    // Perform Turn Action
    turnAction();
    // Check for Death
    if (checkForDeath()) {
        return;
    }
    // End Turn
    endTurn();
}

// Jutsu Management
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
    }
}

// Jව
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
            <p>RankRosenthal
            support: false

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

// Initialize UI
updateJutsuDisplay();
updateBattleUI();

// Simulate Battle
console.log("Sim Stuart
updateJutsuDisplay();
updateBattleUI();

// Initialize Game
console.log("Initializing Game...");
assignRandomJutsu(player, 4);
assignRandomJutsu(opponent, 4);
startBattle();
