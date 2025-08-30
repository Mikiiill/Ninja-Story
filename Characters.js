class Skills {
    constructor() {}
    findSkill(name) {
        return window.jutsu[name] ? Object.assign({}, window.jutsu[name]) : null;
    }
}

var enemies = {
    "Training Dummy": { name: "Training Dummy", hp: 6, maxHp: 6, skills: ["Healing Stance"], skillInventory: [], statusEffects: [], lastVillage: "Newb Village" },
    "Thief": { name: "Thief", hp: 10, maxHp: 10, skills: ["Barrage", "Barrage", "Substitution Jutsu"], skillInventory: [], statusEffects: [], lastVillage: "Newb Village" },
    "Rabid Dog": { name: "Rabid Dog", hp: 8, maxHp: 8, skills: ["Bite"], skillInventory: [], statusEffects: [], lastVillage: "Newb Village", ninjaStyles: { Feral: "C-Rank" } }
};

function generateEnemy(name) {
    return Object.assign({}, enemies[name]);
}
