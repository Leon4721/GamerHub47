import { showStory } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('playerData');
  if (!raw) { window.location.href = 'index.html'; return; }
  const { name: playerName, character } = JSON.parse(raw);

  document.getElementById('player-health-label').textContent = `${playerName}'s Health`;

  let sequence = [], playerSequence = [], round = 0, score = 0, playerHealth = 100, monsterHealth = 100, level = 1, gameStarted = false;

  const buttons = document.querySelectorAll('.game-button');
  const feedback = document.getElementById('feedback');
  const monsterNameEl = document.getElementById('monster-name');
  const monsterLevelEl = document.getElementById('monster-level');
  const monsterDisplay = document.querySelector('.monster-display');
  const playerHPBar = document.getElementById('player-health');
  const monsterHPBar = document.getElementById('monster-health');
  const playerHPValue = document.getElementById('player-health-value');
  const monsterHPValue = document.getElementById('monster-health-value');
  const roundDisplay = document.getElementById('round-display');
  const scoreDisplay = document.getElementById('score-display');
  const levelDisplay = document.getElementById('level-display');
  const startBtn = document.getElementById('start-btn');
  const redoBtn = document.getElementById('redo-btn');

  const monsters = [
    { name: 'Goblin', level: 1, image: 'assets/images/goblin.png', speed: 800, health: 100 },
    { name: 'Orc', level: 2, image: 'assets/images/orc.png', speed: 700, health: 120 },
    { name: 'Dark Mage', level: 3, image: 'assets/images/darkmage.png', speed: 600, health: 150 },
    { name: 'Skeleton Knight', level: 4, image: 'assets/images/sknigh.png', speed: 500, health: 200 },
    { name: 'Dragon', level: 5, image: 'assets/images/dragon.png', speed: 400, health: 250 }
  ];

  function createMonsterCard(m) {
    const c = document.createElement('div');
    c.className = 'monster-card appear';
    c.style.backgroundImage = `url('${m.image}')`;
    return c;
  }

  function initGame() {
    sequence = [];
    playerSequence = [];
    round = 0;
    score = 0;
    playerHealth = 100;
    level = 1;
    monsterHealth = monsters[0].health;
    setMonster(0);
    updateDisplays();
    feedback.textContent = 'Press Start Battle to begin your adventure!';
    gameStarted = false;
  }

  function setMonster(i) {
    const m = monsters[i];
    monsterNameEl.textContent = m.name;
    monsterLevelEl.textContent = m.level;
    monsterHealth = m.health;
    levelDisplay.textContent = m.level;
    monsterDisplay.innerHTML = '';
    monsterDisplay.appendChild(createMonsterCard(m));
  }

  function updateDisplays() {
    playerHPBar.style.width = `${playerHealth}%`;
    monsterHPBar.style.width = `${(monsterHealth / monsters[level-1].health) * 100}%`;
    playerHPValue.textContent = `${playerHealth}%`;
    monsterHPValue.textContent = `${Math.round((monsterHealth / monsters[level-1].health) * 100)}%`;
    roundDisplay.textContent = round;
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
  }

  function startBattle() {
    if (gameStarted) return;
    gameStarted = true;
    feedback.textContent = `Battle begins! Defeat the ${monsters[0].name}!`;
    setTimeout(nextRound, 1500);
  }

  function replaySequence() {
    if (!gameStarted || !sequence.length) return;
    feedback.textContent = 'Replaying the pattern...';
    showSequence();
  }

  function nextRound() {
    if (!gameStarted) return;
    playerSequence = [];
    round++;
    sequence.push(nextAttack(), nextAttack());
    feedback.textContent = `Memorize the attack pattern! Round ${round}`;
    showSequence();
  }

  function nextAttack() {
    const choices = ['archer', 'mage', 'warrior', 'healer'];
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function showSequence() {
    const delay = monsters[level-1].speed;
    sequence.forEach((cls, i) => {
      setTimeout(() => highlightButton(cls), delay * (i + 1));
    });
    setTimeout(() => { feedback.textContent = 'Your turn! Repeat the pattern.'; }, delay * (sequence.length + 1));
  }

  function highlightButton(id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 400);
  }

  function handlePlayerInput(id) {
    if (!gameStarted) return;
    playerSequence.push(id);
    highlightButton(id);

    if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
      const dmg = 10 + level * 2;
      playerHealth = Math.max(playerHealth - dmg, 0);
      updateDisplays();
      if (playerHealth <= 0) {
        gameStarted = false;
        return feedback.textContent = '💀 You have fallen! Game Over.';
      }
      setTimeout(() => {
        feedback.textContent = `Wrong! You take ${dmg} damage.`;
        playerSequence = [];
        showSequence();
      }, 500);
      return;
    }

    if (playerSequence.length === sequence.length) {
      let dmg = 0, heal = 0;
      sequence.forEach(a => {
        if (a === 'healer') {
          if (character.name === 'Female' || level > 2) heal += 10 + level * 2;
        } else {
          dmg += 10 + level * 2;
        }
      });

      playerHealth = Math.min(playerHealth + heal, 100);
      monsterHealth -= dmg;
      score += dmg;
      updateDisplays();

      if (monsterHealth <= 0) {
        document.querySelector('.monster-card')?.classList.replace('appear', 'defeat');
        feedback.textContent = `🏆 ${monsters[level-1].name} defeated!`;
        score += 100 * level;
        setTimeout(() => {
          if (level < monsters.length) {
            level++;
            setMonster(level - 1);
            playerHealth = 100;
            sequence = [];
            round = 0;
            updateDisplays();
            feedback.textContent = `Advanced to level ${level}! Facing ${monsters[level-1].name}!`;
            setTimeout(nextRound, 2500);
          } else {
            gameStarted = false;
            feedback.textContent = '🎉 CONGRATULATIONS! You defeated all monsters!';
          }
        }, 2000);
      } else {
        const msgParts = [];
        if (heal) msgParts.push(`Healed ${heal} HP.`);
        msgParts.push(`Dealt ${dmg} damage!`);
        feedback.textContent = `✅ ${msgParts.join(' ')}`;
        setTimeout(nextRound, 1500);
      }
    }
  }

  startBtn.addEventListener('click', startBattle);
  redoBtn.addEventListener('click', replaySequence);
  buttons.forEach(b => b.addEventListener('click', () => handlePlayerInput(b.id)));
  document.addEventListener('keydown', e => {
    if (!gameStarted) return;
    const map = { '1': 'archer', '2': 'mage', '3': 'warrior', '4': 'healer' };
    if (map[e.key]) handlePlayerInput(map[e.key]);
  });

  initGame();
});
