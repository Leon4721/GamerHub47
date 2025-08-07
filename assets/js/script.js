// script.js
// Game page: loads saved hero, populates HUD, then runs battle logic with difficulty, player damage on failure, and conditional healing

document.addEventListener('DOMContentLoaded', () => {
  // 1) Load & verify playerData
  const raw = localStorage.getItem('playerData');
  if (!raw) {
    window.location.href = 'index.html';
    return;
  }
  const { name: playerName, character } = JSON.parse(raw);

  // 2) Populate HUD
  const nameEl    = document.getElementById('playerNameEl');
  const roleEl    = document.getElementById('playerRoleEl');
  const avatarEl  = document.getElementById('playerAvatar');
  const healthLbl = document.getElementById('player-health-label');

  if (nameEl)   nameEl.textContent   = playerName;
  if (roleEl)   roleEl.textContent   = character.role;
  if (avatarEl) avatarEl.src         = character.image;
  if (healthLbl) healthLbl.textContent = `${playerName}'s Health`;

  Object.entries(character.stats).forEach(([stat,val]) => {
    const el = document.getElementById(`${stat.toLowerCase()}-value`);
    if (el) el.textContent = val;
  });

  // 3) Battle logic state
  let sequence       = [];
  let playerSequence = [];
  let round          = 0;
  let score          = 0;
  let playerHealth   = 100;
  let monsterHealth  = 100;
  let level          = 1;
  let gameStarted    = false;

  // 4) DOM elements
  const buttons        = document.querySelectorAll('.game-button');
  const feedback       = document.getElementById('feedback');
  const monsterNameEl  = document.getElementById('monster-name');
  const monsterLevelEl = document.getElementById('monster-level');
  const monsterDisplay = document.querySelector('.monster-display');
  const playerHPBar    = document.getElementById('player-health');
  const monsterHPBar   = document.getElementById('monster-health');
  const playerHPValue  = document.getElementById('player-health-value');
  const monsterHPValue = document.getElementById('monster-health-value');
  const roundDisplay   = document.getElementById('round-display');
  const scoreDisplay   = document.getElementById('score-display');
  const levelDisplay   = document.getElementById('level-display');
  const startBtn       = document.getElementById('start-btn');
  const redoBtn        = document.getElementById('redo-btn');

  // 5) Monster definitions (include speed for difficulty)
  const monsters = [
    { name: 'Goblin',         level: 1, image: 'assets/images/goblin.png',     speed: 800, health: 100 },
    { name: 'Orc',            level: 2, image: 'assets/images/orc.png',        speed: 700, health: 120 },
    { name: 'Dark Mage',      level: 3, image: 'assets/images/darkmage.png',  speed: 600, health: 150 },
    { name: 'Skeleton Knight',level: 4, image: 'assets/images/sknigh.png',    speed: 500, health: 200 },
    { name: 'Dragon',         level: 5, image: 'assets/images/dragon.png',     speed: 400, health: 250 }
  ];

  // Helper: create monster card
  function createMonsterCard(m) {
    const c = document.createElement('div');
    c.className = 'monster-card appear';
    c.style.backgroundImage = `url('${m.image}')`;
    return c;
  }

  // Initialize game
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

  // Set current monster and UI
  function setMonster(i) {
    const m = monsters[i];
    monsterNameEl.textContent  = m.name;
    monsterLevelEl.textContent = m.level;
    monsterHealth = m.health;
    levelDisplay.textContent   = m.level;
    monsterDisplay.innerHTML   = '';
    monsterDisplay.appendChild(createMonsterCard(m));
  }

  // Update health bars, scores, etc.
  function updateDisplays() {
    playerHPBar.style.width  = `${playerHealth}%`;
    monsterHPBar.style.width = `${(monsterHealth / monsters[level-1].health) * 100}%`;
    playerHPValue.textContent  = `${playerHealth}%`;
    monsterHPValue.textContent = `${Math.round((monsterHealth / monsters[level-1].health) * 100)}%`;
    roundDisplay.textContent   = round;
    scoreDisplay.textContent   = score;
    levelDisplay.textContent   = level;
  }

  // Start battle
  function startBattle() {
    if (gameStarted) return;
    gameStarted = true;
    feedback.textContent = `Battle begins! Defeat the ${monsters[0].name}!`;
    setTimeout(nextRound, 1500);
  }

  // Replay pattern
  function replaySequence() {
    if (!gameStarted || !sequence.length) return;
    feedback.textContent = 'Replaying the pattern...';
    showSequence();
  }

  // Next round: add attack and show pattern
  function nextRound() {
    if (!gameStarted) return;
    playerSequence = [];
    round++;
   sequence.push(nextAttack(), nextAttack()); m
    feedback.textContent = `Memorize the attack pattern! Round ${round}`;
    showSequence();
  }

  // Pick random attack
  function nextAttack() {
    const choices = ['archer', 'mage', 'warrior', 'healer'];
    return choices[Math.floor(Math.random() * choices.length)];
  }

  // Display the sequence with monster speed
  function showSequence() {
    const delay = monsters[level-1].speed;
    sequence.forEach((cls, i) => {
      setTimeout(() => highlightButton(cls), delay * (i + 1));
    });
    setTimeout(() => {
      feedback.textContent = 'Your turn! Repeat the pattern.';
    }, delay * (sequence.length + 1));
  }

  // Highlight button
  function highlightButton(id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.add('active');
    setTimeout(() => btn.classList.remove('active'), 400);
  }

  // Handle player input
  function handlePlayerInput(id) {
    if (!gameStarted) return;
    playerSequence.push(id);
    highlightButton(id);

    // Wrong input: damage player and replay
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

    // Completed sequence correctly
    if (playerSequence.length === sequence.length) {
      // Calculate damage to monster and healing to player
      let dmg = 0;
      let heal = 0;
      sequence.forEach(a => {
        if (a === 'healer') {
          // Allow heal if female or level > 2
          if (character.name === 'Female' || level > 2) {
            heal += 10 + level * 2;
          }
        } else {
          dmg += 10 + level * 2;
        }
      });

      // Apply healing then damage
      playerHealth = Math.min(playerHealth + heal, 100);
      monsterHealth -= dmg;
      score += dmg;
      updateDisplays();

      // Monster defeated
      if (monsterHealth <= 0) {
        monsterHealth = 0;
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
            feedback.textContent = '🎉 CONGRATULATIONS! You defeated all monsters and won the game!';
          }
        }, 2000);
      } else {
        // Round success
        const msgParts = [];
        if (heal) msgParts.push(`Healed ${heal} HP.`);
        msgParts.push(`Dealt ${dmg} damage!`);
        feedback.textContent = `✅ ${msgParts.join(' ')}`;
        setTimeout(nextRound, 1500);
      }
    }
  }

  // Attach events
  startBtn.addEventListener('click', startBattle);
  redoBtn.addEventListener('click', replaySequence);
  buttons.forEach(b => b.addEventListener('click', () => handlePlayerInput(b.id)));
  document.addEventListener('keydown', e => {
    if (!gameStarted) return;
    const map = { '1': 'archer', '2': 'mage', '3': 'warrior', '4': 'healer' };
    if (map[e.key]) handlePlayerInput(map[e.key]);
  });

  // Start everything
  initGame();
});
