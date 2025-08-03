// RPG Memory Battle Game
let sequence = [];
let playerSequence = [];
let round = 0;
let score = 0;
let playerHealth = 100;
let monsterHealth = 100;

const buttons = document.querySelectorAll('.game-button');
const feedback = document.getElementById('feedback');
const monsterName = document.getElementById('monster-name');
const playerHPBar = document.getElementById('player-health');
const monsterHPBar = document.getElementById('monster-health');

const monsters = ["Goblin", "Orc", "Dark Mage", "Skeleton King", "Dragon"];

// Generate a random attack (class)
function nextAttack() {
    const choices = ['archer', 'mage', 'warrior', 'healer'];
    return choices[Math.floor(Math.random() * choices.length)];
}

function updateHealthBars() {
    playerHPBar.style.width = playerHealth + "%";
    monsterHPBar.style.width = monsterHealth + "%";
}

function startBattle() {
    sequence = [];
    playerSequence = [];
    round = 0;
    score = 0;
    playerHealth = 100;
    monsterHealth = 100;
    updateHealthBars();
    document.getElementById('round-display').textContent = "Round: 0";
    document.getElementById('score-display').textContent = "Score: 0";
    feedback.textContent = "Battle begins!";
    monsterName.textContent = monsters[Math.floor(Math.random() * monsters.length)];
    nextRound();
}

document.getElementById('start-btn').addEventListener('click', startBattle);

function nextRound() {
    playerSequence = [];
    round++;
    document.getElementById('round-display').textContent = `Round: ${round}`;
    sequence.push(nextAttack());
    setTimeout(showSequence, 800);
}

function showSequence() {
    let delay = 600;
    sequence.forEach((cls, index) => {
        setTimeout(() => {
            highlightButton(cls);
        }, delay * (index + 1));
    });
}

function highlightButton(cls) {
    let btn = document.getElementById(cls);
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 400);
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => handlePlayerInput(btn.id));
});

document.addEventListener('keydown', (e) => {
    if (e.key === '1') handlePlayerInput('archer');
    if (e.key === '2') handlePlayerInput('mage');
    if (e.key === '3') handlePlayerInput('warrior');
    if (e.key === '4') handlePlayerInput('healer');
});

function handlePlayerInput(cls) {
    playerSequence.push(cls);
    highlightButton(cls);

    if (!checkPlayerInput()) {
    feedback.textContent = "❌ You missed! Monster strikes back!";
    playerHealth -= 20;
    updateHealthBars();
    if (playerHealth <= 0) {
        feedback.textContent = "💀 You were defeated!";
        return;
    }
    // 🆕 Automatically continue battle after 5s
    setTimeout(nextRound, 5000);
}


    if (playerSequence.length === sequence.length) {
        if (checkFullSequence()) {
            monsterHealth -= 25;
            score += 10;
            feedback.textContent = "✅ Perfect Attack! Monster takes damage!";
            updateHealthBars();
            document.getElementById('score-display').textContent = `Score: ${score}`;

            if (monsterHealth <= 0) {
                feedback.textContent = "🏆 Monster Defeated! Next battle...";
                monsterHealth = 100;
                monsterName.textContent = monsters[Math.floor(Math.random() * monsters.length)];
            }
            setTimeout(nextRound, 1000);
        }
    }
}

function checkPlayerInput() {
    let idx = playerSequence.length - 1;
    return playerSequence[idx] === sequence[idx];
}

function checkFullSequence() {
    return playerSequence.every((val, index) => val === sequence[index]);
}
