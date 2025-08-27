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
                user.statusEffects.push(new StatusEffect("Regen", 1, 2, true));
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> enters ${this.name}, healing ${heal} HP 🌿!`);
                updateStatus();
            }},
            { name: "Fireball Jutsu", rank: "C-Rank", support: false, skillFunction: function(user, target, scene) {
                let damage = 4;
                target.hp -= damage;
                target.statusEffects.push(new StatusEffect("Burn", 1, 2, true));
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> casts ${this.name} on ${target.name} for ${damage} damage, inflicting Burn 🔥!`);
                updateStatus();
            }},
            { name: "Static Field Jutsu", rank: "C-Rank", support: false, skillFunction: function(user, target, scene) {
                let damage = 3;
                target.hp -= damage;
                target.statusEffects.push(new StatusEffect("Numb", 0, 1, true));
                user.statusEffects.push(new StatusEffect("Numb", 0, 1, true));
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses ${this.name} on ${target.name} for ${damage} damage, inflicting Numb ⚡️ on both!`);
                updateStatus();
            }},
            { name: "Substitution Jutsu", rank: "C-Rank", support: true, skillFunction: function(user, target, scene) {
                user.statusEffects.push(new StatusEffect("Swap", 0, 1, false, false, true));
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> prepares ${this.name} 🪵!`);
                updateStatus();
            }},
            { name: "Dynamic Entry", rank: "C-Rank", support: false, skillFunction: function(user, target, scene) {
                if (!user.statusEffects.some(e => e.name === "DynamicEntryProc")) {
                    let damage = 1;
                    target.hp -= damage;
                    scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses ${this.name} on ${target.name} for ${damage} damage!`);
                    user.statusEffects.push(new StatusEffect("DynamicEntryProc", 0, 1, false, true));
                    let availableSkills = user.skills.filter(s => s.name !== "Dynamic Entry");
                    if (availableSkills.length > 0) {
                        let nextSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                        nextSkill.skillFunction(user, target, scene);
                        scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> follows up with ${nextSkill.name}!`);
                    }
                } else {
                    // Use the originally drawn skill for the turn instead of Barrage
                    let originalSkill = user.skills[Math.floor(Math.random() * user.skills.length)];
                    originalSkill.skillFunction(user, target, scene);
                    scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses ${originalSkill.name} since Dynamic Entry already procced!`);
                }
                updateStatus();
            }},
            { name: "Demonic Vision", rank: "C-Rank", support: false, skillFunction: function(user, target, scene) {
                let damage = 1;
                target.hp -= damage;
                target.statusEffects.push(new StatusEffect("Doom", 1, 2, true));
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> casts ${this.name} on ${target.name} for ${damage} damage, inflicting Doom 💀!`);
                updateStatus();
            }},
            { name: "Earth Dome Jutsu", rank: "C-Rank", support: true, skillFunction: function(user, target, scene) {
                user.statusEffects.push(new StatusEffect("Dome", 0, 2, false, false, true));
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> raises ${this.name} 🪨!`);
                updateStatus();
            }},
            { name: "Double Image Jutsu", rank: "C-Rank", support: true, skillFunction: function(user, target, scene) {
                user.statusEffects.push(new StatusEffect("DoubleImage", 0, 2, false, false, true));
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> creates ${this.name} 🌫️!`);
                updateStatus();
            }},
            { name: "Shadow Clone Jutsu", rank: "C-Rank", support: true, skillFunction: function(user, target, scene) {
                user.statusEffects.push(new StatusEffect("ShadowCloneEffect", 0, 2, false, true, true));
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> summons ${this.name} 👥!`);
                updateStatus();
            }},
            { name: "Release", rank: "C-Rank", support: true, skillFunction: function(user, target, scene) {
                user.statusEffects.push(new StatusEffect("Release", 0, 1, false, false, true));
                scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> prepares ${this.name} ✋!`);
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
