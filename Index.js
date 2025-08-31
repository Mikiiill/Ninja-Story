function showSignIn() {
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("sign-in").style.display = "block";
}

function signIn() {
    const email = document.getElementById("email-input").value;
    if (email) {
        const verificationCode = Math.floor(Math.random() * 10000);
        const inputCode = prompt(`Enter verification code sent to your email (mock code: ${verificationCode})`);
        if (inputCode == verificationCode) {
            const savedData = localStorage.getItem(email);
            if (savedData) {
                const playerData = JSON.parse(savedData);
                alert(`Welcome back, ${playerData.name}! Loaded from ${playerData.location}`);
                updateStatsDisplay(playerData);
                showGameMenu(playerData);
            } else {
                alert("No account found. Creating new one.");
                startAsGuest(true, email);
            }
        } else {
            alert("Verification failed.");
        }
    } else {
        alert("Enter a valid email.");
    }
}

function startAsGuest(isNewAccount = false, email = null) {
    document.getElementById("sign-in").style.display = "none";
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("name-input").style.display = "block";
}

function createCharacter() {
    const name = document.getElementById("char-name-input").value.trim();
    if (name) {
        const player = new Character(name, 10, 10);
        player.styles = { Ninjutsu: "D-Rank", Taijutsu: "D-Rank", Genjutsu: "D-Rank" };
        player.rank = "Student";
        player.maxEXP = 10;
        player.location = "Newb Village";
        player.inventory = [];
        player.jutsuList = [];
        player.rewardList = [];
        document.getElementById("name-input").style.display = "none";
        document.getElementById("confirmation").style.display = "block";
        document.getElementById("confirmation").innerText = `new character ${player.name}!`;
        localStorage.setItem("guestPlayer", JSON.stringify(player));
        updateStatsDisplay(player);
        showGameMenu(player);
    } else {
        alert("Enter a name!");
    }
}

function updateStatsDisplay(player) {
    const statsDiv = document.getElementById("stats-display");
    statsDiv.style.display = "block";
    statsDiv.innerHTML = `
        Name: ${player.name}<br>
        HP: ${player.hp}/${player.maxHP}<br>
        EXP: ${player.exp}/${player.maxEXP}<br>
        Rank: ${player.rank}<br>
        Location: ${player.location}<br>
        Styles: ${Object.entries(player.styles).map(([style, rank]) => `${style}: ${rank}`).join(", ")}
    `;
}

function showGameMenu(player) {
    // Placeholder for future buttons based on location
    const statsDiv = document.getElementById("stats-display");
    statsDiv.innerHTML += "<br><button onclick='startTutorialFight()'>Start Tutorial</button>";
}

function startTutorialFight() {
    const player = JSON.parse(localStorage.getItem("guestPlayer"));
    if (player) {
        const enemy = new Character("SparringDummy", 6, 6);
        enemy.skills = [new Skills().findSkill("Bite"), new Skills().findSkill("Healing Stance")];
        startBattle(player, enemy, "eventFight");
    }
}
