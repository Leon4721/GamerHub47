// Memory Game Script
let sequence = [];
let playerSequence = [];
let level = 0;
let score = 0;
let buttons = document.querySelectorAll('.game-button');
let feedback = document.getElementById('feedback');

// Generate a random button
function nextStep() {
    const choices = ['green', 'red', 'yellow', 'blue'];
    return choices[Math.floor(Math.random() * choices.length)];
}

// Play the sequence to the player
function playSequence() {
    let delay = 500;
    sequence.forEach((color, index) => {
        setTimeout(() => {
            activateButton(color);
        }, delay * (index + 1));
    });
}

// Highlight button
function activateButton(color) {
    let btn = document.getElementById(color);
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 400);
}

// Start game
document.getElementById('start-btn').addEventListener('click', startGame);

function startGame() {
    sequence = [];
    playerSequence = [];
    level = 0;
    score = 0;
    document.getElementById('level-display').textContent = "Level: 0";
    document.getElementById('score-display').textContent = "Score: 0";
    feedback.textContent = "Game started! Watch the sequence.";
    nextRound();
}

// Next level
function nextRound() {
    playerSequence = [];
    level++;
    document.getElementById('level-display').textContent = `Level: ${level}`;
    sequence.push(nextStep());
    setTimeout(playSequence, 800);
}

// Player input
buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        handlePlayerInput(btn.id);
    });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === '1') handlePlayerInput('green');
    if (e.key === '2') handlePlayerInput('red');
    if (e.key === '3') handlePlayerInput('yellow');
    if (e.key === '4') handlePlayerInput('blue');
});

function handlePlayerInput(color) {
    playerSequence.push(color);
    activateButton(color);

    if (!checkPlayerInput()) {
        feedback.textContent = "❌ Wrong sequence! Game Over.";
        return;
    }

    if (playerSequence.length === sequence.length) {
        score += 10;
        document.getElementById('score-display').textContent = `Score: ${score}`;
        feedback.textContent = "✅ Correct! Next round...";
        setTimeout(nextRound, 1000);
    }
}

// Check if input matches the sequence so far
function checkPlayerInput() {
    let idx = playerSequence.length - 1;
    return playerSequence[idx] === sequence[idx];
}
