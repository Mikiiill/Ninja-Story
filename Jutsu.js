class Skills {
    constructor() {
        this.skills = [
            { name: "Barrage", rank: "D-Rank", support: false, skillFunction: function(user, target, scene) {
                let damage = 1 + Math.floor(Math.random() * 2);
                target.hp -= damage;
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> attacks ${target.name} with ${this.name} for ${damage} damage!`);
                if (Math.random() < 0.5) {
                    let comboDamage = 1;
                    target.hp -= comboDamage;
                    scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> combos ${target.name} for ${comboDamage} damage!`);
                }
                updateStatus();
            }},
            { name: "Healing Stance", rank: "D-Rank", support: true, skillFunction: function(user, target, scene) {
                let heal = 1;
                user.hp = Math.min(user.maxHp, user.hp + heal);
                user.statusEffects.push({ name: "Regen", damage: 1, duration: 2 });
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> enters ${this.name}, healing ${heal} HP 🌿!`);
                updateStatus();
            }},
            { name: "Fireball Jutsu", rank: "C-Rank", support: false, skillFunction: function(user, target, scene) {
                let damage = 4;
                target.hp -= damage;
                target.statusEffects.push({ name: "Burn", damage: 1, duration: 2 });
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> casts ${this.name} on ${target.name} for ${damage} damage, inflicting Burn 🔥!`);
                updateStatus();
            }},
            { name: "Static Field Jutsu", rank: "C-Rank", support: false, skillFunction: function(user, target, scene) {
                let damage = 3;
                target.hp -= damage;
                target.statusEffects.push({ name: "Numb", damage: 0, duration: 1 });
                user.statusEffects.push({ name: "Numb", damage: 0, duration: 1 });
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses ${this.name} on ${target.name} for ${damage} damage, inflicting Numb ⚡️ on both!`);
                updateStatus();
            }},
            { name: "Substitution Jutsu", rank: "C-Rank", support: true, skillFunction: function(user, target, scene) {
                user.statusEffects.push({ name: "Swap", damage: 0, duration: 1 });
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> prepares ${this.name} 🪵!`);
                updateStatus();
            }},
            { name: "Dynamic Entry", rank: "C-Rank", support: false, skillFunction: function(user, target, scene) {
                if (!user.statusEffects.some(e => e.name === "DynamicEntryProc")) {
                    let damage = 1;
                    target.hp -= damage;
                    scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses ${this.name} on ${target.name} for ${damage} damage!`);
                    user.statusEffects.push({ name: "DynamicEntryProc", damage: 0, duration: 1 });
                    // Inline skill selection
                    let availableSkills = user.skills.filter(s => s.name !== "Dynamic Entry");
                    if (availableSkills.length > 0) {
                        let nextSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                        nextSkill.skillFunction(user, target, scene);
                        scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> follows up with ${nextSkill.name}!`);
                    }
                } else {
                    let barrageSkill = this.findSkill("Barrage");
                    if (barrageSkill) barrageSkill.skillFunction(user, target, scene);
                    scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses ${this.name} but falls back to Barrage since Dynamic Entry already procced!`);
                }
                updateStatus();
            }},
            { name: "Demonic Vision", rank: "C-Rank", support: false, skillFunction: function(user, target, scene) {
                let damage = 1;
                target.hp -= damage;
                target.statusEffects.push({ name: "Doom", damage: 1, duration: 2 });
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> casts ${this.name} on ${target.name} for ${damage} damage, inflicting Doom 💀!`);
                updateStatus();
            }}
        ];
    }

    findSkill(name) {
        return this.skills.find(skill => skill.name === name);
    }

    canUseSkill(player, skill) {
        let styleMatch = Object.keys(player.ninjaStyles).find(style => {
            return skill.name.includes(style) || (style === "Ninjutsu" && ["Barrage", "Healing Stance"].includes(skill.name));
        });
        return styleMatch && player.ninjaStyles[styleMatch] >= skill.rank;
    }
}
