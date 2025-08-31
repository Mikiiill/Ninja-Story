window.jutsu = {
    "Barrage": { name: "Barrage", style: "Taijutsu", rank: "E-Rank", damage: 1, combo: 1, support: false, skillFunction: function(user, target, scene) {
        let totalDamage = this.damage + (Math.random() < 0.5 ? this.combo : 0);
        target.hp -= totalDamage;
        scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> attacks ${target.name} with ${this.name} for ${this.damage} damage!`);
        if (totalDamage > this.damage) {
            scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> combos ${target.name} for ${this.combo} damage!`);
        }
    }},
    "Healing Stance": { name: "Healing Stance", style: "Medical", rank: "E-Rank", support: true, skillFunction: function(user, target, scene) {
        user.statusEffects.push({ name: "Regen", startOfTurn: true, startOfTurnFunction: function(u, t, s) {
            u.hp = Math.min(u.maxHp, u.hp + 1);
            s.queueOutput(`<span class='output-text-${u === game.player ? 'player' : 'enemy'}'>${u.name}</span> heals 1 HP from Regen 🌿!`);
            return false;
        }});
        scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> enters Healing Stance 🌿!`);
    }},
    "Substitution Jutsu": { name: "Substitution Jutsu", style: "Ninjutsu", rank: "D-Rank", support: true, skillFunction: function(user, target, scene) {
        if (Math.random() < 0.5) {
            let tempHp = user.hp;
            user.hp = target.hp;
            target.hp = tempHp;
            scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses ${this.name} to swap HP with ${target.name}!`);
        }
    }},
    "Dynamic Entry": { name: "Dynamic Entry", style: "Taijutsu", rank: "D-Rank", damage: 1, support: false, skillFunction: function(user, target, scene) {
        target.hp -= this.damage;
        scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses ${this.name} on ${target.name} for ${this.damage} damage!`);
        if (user.skills.includes(new Skills().findSkill("Static Field Jutsu"))) {
            new Skills().findSkill("Static Field Jutsu").skillFunction(user, target, scene);
        }
    }},
    "Static Field Jutsu": { name: "Static Field Jutsu", style: "Lightning", rank: "D-Rank", damage: 2, support: false, skillFunction: function(user, target, scene) {
        target.hp -= this.damage;
        target.statusEffects.push({ name: "Numb", startOfTurn: true, startOfTurnFunction: function(u, t, s) {
            s.queueOutput(`<span class='output-text-${u === game.player ? 'player' : 'enemy'}'>${u.name}</span> is stunned by Numb and skips their turn!`);
            return true;
        }, duration: 1 });
        user.statusEffects.push({ name: "Numb", startOfTurn: true, startOfTurnFunction: function(u, t, s) {
            s.queueOutput(`<span class='output-text-${u === game.player ? 'player' : 'enemy'}'>${u.name}</span> is stunned by Numb and skips their turn!`);
            return true;
        }, duration: 1 });
        scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> uses ${this.name} on ${target.name} for ${this.damage} damage, inflicting Numb ⚡️ on both!`);
    }},
    "Fireball Jutsu": { name: "Fireball Jutsu", style: "Fire", rank: "D-Rank", damage: 3, support: false, skillFunction: function(user, target, scene) {
        target.hp -= this.damage + (Math.random() < 0.33 ? 1 : 0);
        target.statusEffects.push({ name: "Burn", startOfTurn: true, startOfTurnFunction: function(u, t, s) {
            t.hp -= 1;
            s.queueOutput(`<span class='output-text-${t === game.player ? 'player' : 'enemy'}'>${t.name}</span> takes 1 damage from Burn 🔥!`);
            return false;
        }, active: true, activeFunction: function(u, t, s) {
            t.hp -= 1;
            s.queueOutput(`<span class='output-text-${t === game.player ? 'player' : 'enemy'}'>${t.name}</span> takes 1 damage from Burn 🔥!`);
        } });
        scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> casts ${this.name} on ${target.name} for ${this.damage} damage, inflicting Burn 🔥!`);
    }},
    "Bite": { name: "Bite", style: "Feral", rank: "C-Rank", damage: 2, support: false, skillFunction: function(user, target, scene) {
        target.hp -= this.damage;
        target.statusEffects.push({ name: "Bleed", startOfTurn: true, startOfTurnFunction: function(u, t, s) {
            t.hp -= 1;
            s.queueOutput(`<span class='output-text-${t === game.player ? 'player' : 'enemy'}'>${t.name}</span> takes 1 damage from Bleed 💧!`);
            return false;
        }, active: true, activeFunction: function(u, t, s) {
            t.hp -= 1;
            s.queueOutput(`<span class='output-text-${t === game.player ? 'player' : 'enemy'}'>${t.name}</span> takes 1 damage from Bleed 💧!`);
        } });
        scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> bites ${target.name} for ${this.damage} damage, inflicting Bleed 💧!`);
    }},
    "Demonic Mind": { name: "Demonic Mind", style: "Genjutsu", rank: "C-Rank", damage: 0, support: false, skillFunction: function(user, target, scene) {
        target.statusEffects.push({ name: "Doom", startOfTurn: true, startOfTurnFunction: function(u, t, s) {
            t.hp -= 2;
            s.queueOutput(`<span class='output-text-${t === game.player ? 'player' : 'enemy'}'>${t.name}</span> takes 2 damage from Doom 😈!`);
            if (t.hp <= 0) {
                s.queueOutput(`<span class='output-text-${t === game.player ? 'player' : 'enemy'}'>${t.name}</span> succumbs to Doom 😈!`);
                return true;
            }
            return false;
        }, active: false });
        scene.queueOutput(`<span class='output-text-${user === game.player ? 'player' : 'enemy'}'>${user.name}</span> casts ${this.name} on ${target.name}, inflicting Doom 😈!`);
    }}
};
