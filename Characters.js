var enemies = {
    "Training Dummy": { hp: 10, maxHp: 10, skills: ["Healing Stance"], skillInventory: [], statusEffects: [], lastVillage: "Newb Village" },
    "Thief": { hp: 15, maxHp: 15, skills: ["Steal"], skillInventory: [], statusEffects: [], lastVillage: "Newb Village" },
    "Rabid Dog": { hp: 12, maxHp: 12, skills: ["Bite"], skillInventory: [], statusEffects: [], lastVillage: "Wilderness" }
};

function Skills() {
    this.skills = window.jutsu;
}

Skills.prototype.findSkill = function(name) {
    return this.skills[name] ? Object.assign({}, this.skills[name]) : null;
};

function generateEnemy(name) {
    var enemyTemplate = enemies[name];
    if (!enemyTemplate) return null;
    var enemy = Object.assign({}, enemyTemplate);
    enemy.skills = enemy.skills.map(skill => new Skills().findSkill(skill)).filter(skill => skill !== null);
    return enemy;
}
