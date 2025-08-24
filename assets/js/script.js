// game logic with story popups at exact milestones + half-health events
import { showStory } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('playerData');
  if (!raw) { window.location.href = 'index.html'; return; }
  const { name: playerName, character } = JSON.parse(raw);

  // ===== Robust portrait loader with multi-step fallbacks =====
  const PORTRAIT_DEFAULTS = [
    'assets/images/characters/default.png',
    '/assets/images/characters/default.png',
    'assets/images/default.png',
    '/assets/images/default.png'
  ];

  function fileNameOnly(p) {
    try { return String(p || '').split('/').pop() || ''; } catch { return ''; }
  }

  function buildPortraitCandidates(char) {
    const chosen = (char?.portrait || char?.image || '').trim();

    // If we got an absolute or characters-path, keep as-is first
    const list = [];
    if (chosen) list.push(chosen);

    // If it isn't already inside /characters/, try mapping same filename into /characters/
    const name = fileNameOnly(chosen);
    if (name && !chosen.includes('/characters/')) {
      list.push('assets/images/characters/' + name);
    }

    // If it isn't already inside /assets/images/, try that too
    if (name && !chosen.startsWith('assets/images/')) {
      list.push('assets/images/' + name);
    }

    // Add defaults last
    return [...new Set([...list, ...PORTRAIT_DEFAULTS])];
  }

  function setPortraitWithFallbacks(imgEl, candidates) {
    if (!imgEl || !candidates?.length) return;

    let idx = 0;
    const tryNext = () => {
      if (idx >= candidates.length) return; // give up quietly
      const src = candidates[idx++];
      imgEl.onerror = tryNext;
      imgEl.onload = () => { console.log('[portrait] Loaded:', imgEl.src); };
      imgEl.src = src;
    };

    // Set alt text once
    imgEl.alt = character?.name ? `${character.name} portrait` : 'Selected character portrait';
    tryNext();
  }
  // =================================================================

  // Put player's portrait into the left card (robust)
  const playerPortraitEl = document.getElementById('player-portrait');
  if (playerPortraitEl) {
    const candidates = buildPortraitCandidates(character);
    console.log('[portrait] Candidates →', candidates);
    setPortraitWithFallbacks(playerPortraitEl, candidates);
  } else {
    console.warn('[portrait] #player-portrait not found in DOM');
  }

  // State
  let sequence = [];
  let playerSequence = [];
  let round = 0;
  let score = 0;
  let playerHealth = 100;
  let monsterHealth = 100;
  let level = 1;
  let gameStarted = false;
  let currentStreak = 0;
  let bestStreak = 0;

  function getHighScores() {
    try { return JSON.parse(localStorage.getItem('rpgHighScores')) || []; }
    catch { return []; }
  }

  function saveHighScore(entry) {
    const list = getHighScores();
    list.push(entry);
    // Sort by score desc, then bestStreak desc, then rounds desc
    list.sort((a,b) => b.score - a.score || b.bestStreak - a.bestStreak || b.rounds - a.rounds);
    const top5 = list.slice(0,5);
    localStorage.setItem('rpgHighScores', JSON.stringify(top5));
  }

  // One-time flags for special popups
  let shownHalfPlayer = false;
  let shownHalfMonster = false;
  let pathChoice = 'assault'; // default if player doesn't choose at Lv4 popup

  function makeRunEntry({ outcome }) {
    const now = new Date().toISOString().slice(0,10);
    return {
      name: playerName,
      character: character?.name || '',
      score,
      rounds: round,
      level,
      bestStreak,
      path: pathChoice,
      outcome, // 'victory' | 'defeat'
      date: now
    };
  }

  // DOM
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

  // Monsters
  const monsters = [
    { name: 'Goblin',          level: 1, image: 'assets/images/goblin.png',        speed: 800, health: 100 },
    { name: 'Orc',             level: 2, image: 'assets/images/orc.png',           speed: 700, health: 120 },
    { name: 'Dark Mage',       level: 3, image: 'assets/images/darkmage.png',      speed: 600, health: 150 },
    // NOTE: ensure the filename really is 'sknight.png' in your assets
    { name: 'Skeleton Knight', level: 4, image: 'assets/images/sknight.png',       speed: 500, health: 200 },
    { name: 'Dragon',          level: 5, image: 'assets/images/dragon.png',        speed: 400, health: 250 }
  ];

  function createMonsterCard(m) {
    const c = document.createElement('div');
    c.className = 'monster-card appear';
    c.style.backgroundImage = `url('${m.image}')`;
    return c;
  }

  function setMonster(i) {
    const m = monsters[i];
    if (monsterNameEl) monsterNameEl.textContent = m.name;
    if (monsterLevelEl) monsterLevelEl.textContent = m.level;
    monsterHealth = m.health;
    if (levelDisplay) levelDisplay.textContent = m.level;
    if (monsterDisplay) {
      monsterDisplay.innerHTML = '';
      monsterDisplay.appendChild(createMonsterCard(m));
    } else {
      console.warn('Missing .monster-display element in DOM.');
    }
    // Reset half-health flags per monster
    shownHalfMonster = false;
  }

  // Difficulty (defaults to Medium; apply factors)
  const defaultDiff = { key:'medium', label:'Medium', speedFactor:1.0, complexityFactor:1.0, scoreFactor:1.0 };
  const difficulty = (() => {
    try { return JSON.parse(localStorage.getItem('difficulty')) || defaultDiff; }
    catch { return defaultDiff; }
  })();

  // Show the game mode inside the circle
  const modeEl = document.getElementById('mode-display');
  if (modeEl) modeEl.textContent = difficulty.label || 'Medium';

  function updateDisplays() {
    const maxM = monsters[level - 1].health;
    if (playerHPBar) playerHPBar.style.width = `${playerHealth}%`;
    if (monsterHPBar) monsterHPBar.style.width = `${(monsterHealth / maxM) * 100}%`;
    if (playerHPValue) playerHPValue.textContent = `${playerHealth}%`;
    if (monsterHPValue) monsterHPValue.textContent = `${Math.max(0, Math.round((monsterHealth / maxM) * 100))}%`;
    if (roundDisplay) roundDisplay.textContent = round;
    if (scoreDisplay) scoreDisplay.textContent = score;
    if (levelDisplay) levelDisplay.textContent = level;

    // Half-health checks (pop once each)
    if (!shownHalfPlayer && playerHealth <= 50 && playerHealth > 0) {
      shownHalfPlayer = true;
      gamePauseWith(() => showStory('halfPlayer', { name: playerName }));
    }
    if (!shownHalfMonster && monsterHealth > 0) {
      const maxHealth = monsters[level - 1].health;
      if ((monsterHealth / maxHealth) <= 0.5) {
        shownHalfMonster = true;
        gamePauseWith(() => showStory('halfMonster', {}));
      }
    }
  }

  function initGame() {
    sequence = [];
    playerSequence = [];
    round = 0;
    score = 0;
    playerHealth = 100;
    level = 1;
    shownHalfPlayer = false;
    shownHalfMonster = false;
    setMonster(0);
    if (feedback) feedback.textContent = 'Press Start Battle to begin your adventure!';
    gameStarted = false;
    updateDisplays();
  }

  function startBattle() {
    if (gameStarted) return;

    // Only auto-scroll on narrow screens
    if (window.innerWidth < 800) {
      const controls = document.querySelector('.controls');
      if (controls) {
        controls.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    const begin = () => {
      gameStarted = true;
      if (feedback) feedback.textContent = `Battle begins! Defeat the ${monsters[0].name}!`;
      setTimeout(nextRound, 1200);
    };

    // First-time users: show How-to once, then start
    const seenHowto = localStorage.getItem('howtoSeen') === '1';
    if (!seenHowto) {
      const helpBtn = document.getElementById('help-btn');
      const modal   = document.getElementById('howto-modal');

      if (!helpBtn || !modal) { begin(); return; }

      helpBtn.click();
      localStorage.setItem('howtoSeen', '1');

      const mo = new MutationObserver(() => {
        if (modal.classList.contains('hidden')) {
          mo.disconnect();
          begin();
        }
      });
      mo.observe(modal, { attributes: true, attributeFilter: ['class'] });
      return;
    }

    begin();
  }

  function replaySequence() {
    if (!gameStarted || !sequence.length) return;
    if (feedback) feedback.textContent = 'Replaying the pattern...';
    showSequence();
  }

  function nextAttack() {
    const choices = ['archer', 'mage', 'warrior', 'healer'];
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function nextRound() {
    if (!gameStarted) return;
    playerSequence = [];
    round++;

    const baseAdds = 2;
    const extra = (round % 2 === 0) ? 1 : 0;
    const factor = Math.max(0.5, Number(difficulty?.complexityFactor) || 1);
    const adds = Math.max(1, Math.round((baseAdds + extra) * factor));
    for (let i = 0; i < adds; i++) sequence.push(nextAttack());

    if (feedback) feedback.textContent = `Memorize the attack pattern! Round ${round}`;
    showSequence();
  }

  function showSequence() {
    const baseDelay = monsters[level - 1].speed;
    const speedFactor = Math.max(0.5, Number(difficulty?.speedFactor) || 1);
    const delay = Math.max(120, Math.round(baseDelay / speedFactor));

    sequence.forEach((cls, i) => {
      setTimeout(() => highlightButton(cls), delay * (i + 1));
    });
    setTimeout(() => { if (feedback) feedback.textContent = 'Your turn! Repeat the pattern.'; }, delay * (sequence.length + 1));
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

    // Mistake handling
    if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
      const dmg = 10 + level * 2;
      playerHealth = Math.max(playerHealth - dmg, 0);
      updateDisplays();
      if (playerHealth <= 0) {

        // DEFEAT popup
        gamePauseWith(() =>
          showStory('defeat', {
            score, rounds: round,
            retry: () => {
              // Soft reset current level
              playerHealth = 100;
              monsterHealth = monsters[level - 1].health;
              sequence = [];
              round = 0;
              shownHalfPlayer = false; shownHalfMonster = false;
              updateDisplays();
              if (feedback) feedback.textContent = `Retry Level ${level}!`;
              setTimeout(() => { gameStarted = true; nextRound(); }, 600);
            }
          })
        );
        gameStarted = false;
        return;
      }
      setTimeout(() => {
        if (feedback) feedback.textContent = `Wrong! You take ${dmg} damage.`;
        playerSequence = [];
        showSequence();
      }, 500);
      return;
    }

    // Completed pattern correctly
    if (playerSequence.length === sequence.length) {
      let dmg = 0, heal = 0;
      sequence.forEach(a => {
        if (a === 'healer') {
          if (character?.name === 'Female' || level > 2) heal += 10 + level * 2;
        } else {
          dmg += 10 + level * 2;
        }
      });

      playerHealth = Math.min(playerHealth + heal, 100);
      monsterHealth = Math.max(monsterHealth - dmg, 0);

      const scoreFactor = Math.max(0.5, Number(difficulty?.scoreFactor) || 1);
      score += Math.round(dmg * scoreFactor);

      updateDisplays();

      if (monsterHealth <= 0) {
        document.querySelector('.monster-card')?.classList.replace('appear', 'defeat');
        if (feedback) feedback.textContent = `🏆 ${monsters[level - 1].name} defeated!`;
        score += Math.round(100 * level * scoreFactor);

        setTimeout(() => {
          if (level < monsters.length) {
            const justCleared = level;
            level++;
            sequence = [];
            round = 0;
            playerHealth = 100;
            shownHalfPlayer = false;
            shownHalfMonster = false;

            const doAdvance = () => {
              setMonster(level - 1);
              updateDisplays();
              if (feedback) feedback.textContent = `Advanced to level ${level}! Facing ${monsters[level - 1].name}!`;
              setTimeout(nextRound, 1200);
            };

            if (justCleared === 2) {
              gamePauseWith(() => showStory('afterLevel2', {}), doAdvance);
            } else if (justCleared === 3) {
              gamePauseWith(() => showStory('afterLevel3', {}), doAdvance);
            } else if (justCleared === 4) {
              const ctx = { setPath: (p) => { pathChoice = p; } };
              gamePauseWith(() => showStory('afterLevel4', ctx), doAdvance);
            } else {
              doAdvance();
            }
          } else {
            gamePauseWith(() => showStory('victory', { score, rounds: round, path: pathChoice }));
            gameStarted = false;
          }
        }, 900);
      } else {
        const parts = [];
        if (heal) parts.push(`Healed ${heal} HP.`);
        parts.push(`Dealt ${dmg} damage!`);
        if (feedback) feedback.textContent = `✅ ${parts.join(' ')}`;
        setTimeout(nextRound, 1000);
      }
    }
  }

  function gamePauseWith(showFn, after = null) {
    const wasRunning = gameStarted;
    gameStarted = false;
    showFn();
    if (after) {
      const modal = document.getElementById('story-modal');
      if (!modal) { after(); return; }
      const observer = new MutationObserver(() => {
        const hidden = modal?.classList.contains('hidden');
        if (hidden) {
          observer.disconnect();
          setTimeout(() => { if (!wasRunning) gameStarted = true; after(); }, 150);
        }
      });
      observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // Input bindings (guarded)
  if (startBtn) startBtn.addEventListener('click', startBattle);
  else console.warn('Missing #start-btn');
  if (redoBtn) redoBtn.addEventListener('click', replaySequence);

  buttons.forEach(b => b.addEventListener('click', () => handlePlayerInput(b.id)));
  document.addEventListener('keydown', e => {
    if (!gameStarted) return;
    const map = { '1': 'archer', '2': 'mage', '3': 'warrior', '4': 'healer' };
    if (map[e.key]) handlePlayerInput(map[e.key]);
  });

  /* === CHEAT: Type /Elias to insta-defeat the current level === */
  (() => {
    let _buffer = "";
    function cheatDefeatLevel() {
      if (level < 1 || level > monsters.length) return;

      monsterHealth = 0;
      updateDisplays();

      document.querySelector('.monster-card')?.classList.replace('appear', 'defeat');
      if (feedback) feedback.textContent = `🏆 ${monsters[level - 1].name} defeated!`;
      const scoreFactor = Math.max(0.5, Number(difficulty?.scoreFactor) || 1);
      score += Math.round(100 * level * scoreFactor);

      setTimeout(() => {
        if (level < monsters.length) {
          const justCleared = level;
          level++;

          sequence = [];
          round = 0;
          playerHealth = 100;
          shownHalfPlayer = false;
          shownHalfMonster = false;

          const doAdvance = () => {
            setMonster(level - 1);
            updateDisplays();
            if (feedback) feedback.textContent = `Advanced to level ${level}! Facing ${monsters[level - 1].name}!`;
            setTimeout(nextRound, 1200);
          };

          if (justCleared === 2) {
            gamePauseWith(() => showStory('afterLevel2', {}), doAdvance);
          } else if (justCleared === 3) {
            gamePauseWith(() => showStory('afterLevel3', {}), doAdvance);
          } else if (justCleared === 4) {
            const ctx = { setPath: (p) => { pathChoice = p; } };
            gamePauseWith(() => showStory('afterLevel4', ctx), doAdvance);
          } else {
            doAdvance();
          }
        } else {
          gamePauseWith(() => showStory('victory', { score, rounds: round, path: pathChoice }));
          gameStarted = false;
        }
      }, 900);
    }

    document.addEventListener('keydown', (e) => {
      const ch = e.key.length === 1 ? e.key : '';
      _buffer = (_buffer + ch).slice(-20);
      if (_buffer.endsWith('/Elias')) {
        cheatDefeatLevel();
        _buffer = "";
      }
    });
  })();

  // Go!
  initGame();
});
