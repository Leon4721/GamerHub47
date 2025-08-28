// game logic with story popups at exact milestones + half-health events
import { showStory } from './ui.js';

if (window.__RPG_INIT__) { console.warn('RPG already initialized'); }
else { window.__RPG_INIT__ = true; }

document.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('playerData');
  if (!raw) { window.location.href = 'index.html'; return; }
  const { name: playerName, character } = JSON.parse(raw);

  // Put player's portrait into the left card (robust)
  const playerPortraitEl = document.getElementById('player-portrait');

  function resolvePortraitPath() {
    // preferred → alt → safe fallback
    const candidate =
      character?.image ||
      character?.portrait ||
      'assets/images/characters/default.png'; // adjust if your real path differs
    return candidate;
  }

  function setPortraitSafe(imgEl, src) {
    if (!imgEl) {
      console.warn('[portrait] #player-portrait not found in DOM');
      return;
    }

    // Clear any prior handlers
    imgEl.onerror = null;
    imgEl.onload = null;

    // Add robust onerror to swap to a known-good fallback
    imgEl.onerror = () => {
      console.error('[portrait] Failed to load:', imgEl.src);
      // Try a hard-coded fallback variant (root vs relative) to cover path base issues
      const fallbacks = [
        'assets/images/characters/default.png',
        '/assets/images/characters/default.png'
      ];
      const next = fallbacks.find(fb => !imgEl.src.endsWith(fb));
      if (next) {
        console.warn('[portrait] Trying fallback:', next);
        imgEl.src = next;
      }
    };

    // Log success so you can see which path actually worked
    imgEl.onload = () => {
      console.log('[portrait] Loaded:', imgEl.src);
    };

    // Set alt text and src
    imgEl.alt = character?.name ? `${character.name} portrait` : 'Selected character portrait';
    imgEl.src = src;
  }

  if (playerPortraitEl) {
    const src = resolvePortraitPath();
    console.log('[portrait] Attempting:', src);
    setPortraitSafe(playerPortraitEl, src);
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
  let howtoPending = false; // ⬅️ prevents double-popup/double-click during first-run modal

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
  const playerHealthLabel  = document.getElementById('player-health-label');
  const monsterHealthLabel = document.getElementById('monster-health-label');

  // === Audio Manager: SFX + Music (independent toggles) ===
  const AudioFX = (() => {
    let ctx;
    let sfxEnabled  = JSON.parse(localStorage.getItem('sfxEnabled')  ?? 'true');
    let musicEnabled= JSON.parse(localStorage.getItem('musicEnabled')?? 'false');

    // Map button IDs → SFX files
    const SFX_URLS = {
      success: 'assets/audio/sfx/success.mp3',
  
      // NEW:
      game_over: 'assets/audio/sfx/game_over.mp3',
      contactus: 'assets/audio/sfx/contactus.mp3'
    };

    const buffers = {}; // decoded SFX buffers
    const bgm = new Audio('assets/audio/music/overworld_theme.mp3');
    bgm.loop = true;
    bgm.volume = 0.35;  // music loudness (tune to taste)

    function ensureCtx(){
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    async function loadAll(){
      try{
        ensureCtx();
        await Promise.all(Object.entries(SFX_URLS).map(async ([key, url]) => {
          const res = await fetch(url);
          if (!res.ok) return; // file may not exist (optional)
          const arr = await res.arrayBuffer();
          buffers[key] = await ctx.decodeAudioData(arr);
        }));
      }catch(e){ console.warn('[audio] preload issue:', e); }
    }

    function beepFallback(){
      // tiny triangle beep if a file is missing; avoids silence feeling like a bug
      try{
        ensureCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(520, ctx.currentTime);
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
        o.connect(g).connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + 0.16);
      }catch{}
    }

    function play(name){
      if (!sfxEnabled) return;
      try{
        ensureCtx();
        const buf = buffers[name];
        if (!buf){ beepFallback(); return; }
        const src  = ctx.createBufferSource();
        const gain = ctx.createGain();
        gain.gain.value = 0.9;          // SFX loudness (tune to taste)
        src.buffer = buf;
        src.connect(gain).connect(ctx.destination);
        src.start(0);
      }catch(e){ console.warn('[audio] play error', e); }
    }

    function setSFX(on){
      sfxEnabled = !!on;
      localStorage.setItem('sfxEnabled', JSON.stringify(sfxEnabled));
      updateButtons();
    }
    function toggleSFX(){ setSFX(!sfxEnabled); }

    function setMusic(on){
      musicEnabled = !!on;
      localStorage.setItem('musicEnabled', JSON.stringify(musicEnabled));
      if (musicEnabled) bgm.play().catch(()=>{});
      else bgm.pause();
      updateButtons();
    }
    function toggleMusic(){ setMusic(!musicEnabled); }

    function unlock(){  // resume context on first gesture (autoplay policies)
      try{
        ensureCtx();
        if (ctx.state === 'suspended') ctx.resume();
      }catch{}
    }

    function updateButtons(){
      const sfxBtn = document.getElementById('sfx-toggle');
      const musicBtn = document.getElementById('music-toggle');
      if (sfxBtn){
        sfxBtn.setAttribute('aria-pressed', String(sfxEnabled));
        sfxBtn.title = `Sound effects: ${sfxEnabled ? 'on' : 'off'}`;
        const i = sfxBtn.querySelector('i');
        if (i){
          i.classList.toggle('fa-volume-high', sfxEnabled);
          i.classList.toggle('fa-volume-xmark', !sfxEnabled);
        }
      }
      if (musicBtn){
        musicBtn.setAttribute('aria-pressed', String(musicEnabled));
        musicBtn.title = `Music: ${musicEnabled ? 'on' : 'off'}`;
        musicBtn.classList.toggle('off', !musicEnabled);
      }
    }

    function init(){
      loadAll();                   // preload SFX (non-blocking)
      updateButtons();
      // Hook UI
      document.getElementById('sfx-toggle')?.addEventListener('click', () => { unlock(); toggleSFX(); });
      document.getElementById('music-toggle')?.addEventListener('click', () => { unlock(); toggleMusic(); });
      // Contact button/link SFX
      document.querySelectorAll('.contact-btn, a[href$="contact.html"]').forEach(a => {
        a.addEventListener('click', () => { unlock(); play('contactus'); }, { passive: true });
      });
      // Ensure we unlock at first user gesture (e.g., Start Game)
      window.addEventListener('click', unlock, { once: true });
      // If music was left on last time, start it
      if (musicEnabled) bgm.play().catch(()=>{});
    }

    return { init, play, unlock };
  })();
  AudioFX.init();

  // Monsters
  const monsters = [
    { name: 'Goblin',          level: 1, image: 'assets/images/goblin.png',        speed: 800, health: 100 },
    { name: 'Orc',             level: 2, image: 'assets/images/orc.png',           speed: 700, health: 120 },
    { name: 'Dark Mage',       level: 3, image: 'assets/images/darkmage.png',      speed: 600, health: 150 },
    // NOTE: check filename below - was 'sknigh.png'; if your asset is 'sknight.png', update accordingly
    { name: 'Skeleton Knight', level: 4, image: 'assets/images/sknight.png',       speed: 500, health: 200 },
    { name: 'Dragon',          level: 5, image: 'assets/images/dragon.png',        speed: 400, health: 250 }
  ];

  function possessive(name) {
    return /s$/i.test(name) ? `${name}'` : `${name}'s`;
  }

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

    // Update monster health label + ARIA each time a monster is set
    if (monsterHealthLabel) monsterHealthLabel.textContent = `${possessive(m.name)} Health`;
    if (monsterHPBar)       monsterHPBar.setAttribute('aria-label', `${possessive(m.name)} Health`);

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

  // ---- Difficulty scaling helpers --------------------------------------------
  // Fixed baseline complexity per monster level (1..5). index 0 unused.
  const BASE_ADDS_BY_LEVEL = [0, 1, 1, 2, 2, 3];

  // Round bonus increases difficulty within a monster: R1=0, R2=+1, R3=+2, R4+=+3
  function roundBonusOf(r) { return Math.min(3, Math.max(0, r - 1)); }

  // Safely read the 'adds' multiplier from difficulty (backward compatible)
  function getAddsMultiplier(diff) {
    if (typeof diff?.addsMultiplier === 'number') return diff.addsMultiplier;
    if (typeof diff?.complexityFactor === 'number') return diff.complexityFactor;
    return 1.0;
  }

  // Compute Easy cap so that Lv5 on Easy is never harder than Lv2 on Hard (same round)
  function capEasyAgainstHardL2(adds, round) {
    const HARD_MULT = 1.5; // expected Hard complexity multiplier
    const baseL2 = BASE_ADDS_BY_LEVEL[2] || 1;
    const rawL2 = baseL2 + roundBonusOf(round);
    const hardL2Adds = Math.max(1, Math.round(rawL2 * HARD_MULT));
    return Math.min(adds, hardL2Adds);
  }

  // Determine number of NEW steps to add this round
  function computeAddsForRound(level, round, diffObj) {
    const base = BASE_ADDS_BY_LEVEL[level] || 1;
    const raw = base + roundBonusOf(round);
    const mul = getAddsMultiplier(diffObj);
    let adds = Math.max(1, Math.round(raw * mul));
    if (diffObj?.key === 'easy') adds = capEasyAgainstHardL2(adds, round);
    return adds;
  }

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
      // CHANGED to openStory so we can tag the popup type/level
      gamePauseWith(() => openStory('halfPlayer', { name: playerName }));
    }
    if (!shownHalfMonster && monsterHealth > 0) {
      const maxHealth = monsters[level - 1].health;
      if ((monsterHealth / maxHealth) <= 0.5) {
        shownHalfMonster = true;
        // CHANGED to openStory so we can tag the popup type/level
        gamePauseWith(() => openStory('halfMonster', {}));
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
    howtoPending = false;

    // set player's health label with their name + ARIA once at init
    if (playerHealthLabel) playerHealthLabel.textContent = `${possessive(playerName)} Health`;
    if (playerHPBar)       playerHPBar.setAttribute('aria-label', `${possessive(playerName)} Health`);

    setMonster(0);
    if (feedback) feedback.textContent = 'Press Start Battle to begin your adventure!';
    gameStarted = false;
    shownHalfPlayer = false;
    shownHalfMonster = false;
    updateDisplays();
  }

  // === START BATTLE with robust How-to logic (show ONCE per player, ONLY at Level 1 start) ===
  function startBattle() {
    if (gameStarted || howtoPending) return; // ⬅️ block extra clicks while modal flow is in progress

    const begin = () => {
      gameStarted = true;
      feedback.textContent = `Battle begins! Defeat the ${monsters[0].name}!`;
      setTimeout(nextRound, 1200);
    };

    // Per-player key; only consider modal at start of Level 1, before Round 1
    const howtoKey = `howtoSeen:${playerName || 'anon'}`;
    const seenHowto = localStorage.getItem(howtoKey) === '1';
    const atVeryStart = level === 1 && round === 0;

    if (atVeryStart && !seenHowto) {
      const helpBtn = document.getElementById('help-btn');
      const modal   = document.getElementById('howto-modal');

      // Fallback: if modal elements aren't available, just start
      if (!helpBtn || !modal) { begin(); return; }

      howtoPending = true; // ⬅️ lock until we finish the one-time flow

      // Attach observer BEFORE attempting to open, so we don't miss the "opened" state
      let prevHidden = modal.classList.contains('hidden');
      const mo = new MutationObserver(() => {
        const isHidden = modal.classList.contains('hidden');

        // Transition: OPENED (hidden -> visible)
        if (prevHidden && !isHidden) {
          // no-op; just noted it opened
        }

        // Transition: CLOSED (visible -> hidden)
        if (!prevHidden && isHidden) {
          mo.disconnect();
          localStorage.setItem(howtoKey, '1');
          howtoPending = false; // release the lock
          begin();
        }

        prevHidden = isHidden;
      });
      mo.observe(modal, { attributes: true, attributeFilter: ['class'] });

      // Try to open via existing handler
      helpBtn.click();

      // Safety net: if still hidden after a short delay, force show once
      setTimeout(() => {
        if (modal.classList.contains('hidden')) {
          helpBtn.setAttribute('aria-expanded', 'true');
          modal.classList.remove('hidden');
        }
      }, 150);

      return; // wait for user to close modal
    }

    // Otherwise, just start immediately (no modal)
    begin();
  }

  function replaySequence() {
    if (!gameStarted || !sequence.length) return;
    if (feedback) feedback.textContent = 'Replaying the pattern...';
    showSequence();
  }

  // prevents adjacent duplicates
  function nextAttack(prev) {
    const choices = ['archer', 'mage', 'warrior', 'healer'];
    let pick;
    do { pick = choices[Math.floor(Math.random() * choices.length)]; } while (pick === prev);
    return pick;
  }

  // per-level baseline + round bonus + difficulty + Easy cap; uses no-duplicate generator
  function nextRound() {
    if (!gameStarted) return;
    playerSequence = [];
    round++;

    // Add new steps based on monster level + round + difficulty
    const adds = computeAddsForRound(level, round, difficulty);
    let last = sequence.length ? sequence[sequence.length - 1] : null;
    for (let i = 0; i < adds; i++) {
      const nxt = nextAttack(last);
      sequence.push(nxt);
      last = nxt;
    }

    if (feedback) feedback.textContent = `Memorize the attack pattern! Round ${round}`;
    showSequence();
  }

  // timing uses multiplication so selector (Easy=2.0, Hard=0.5) maps to slower/faster correctly
  function showSequence() {
    const baseDelay = monsters[level - 1].speed;
    const speedFactor = Math.max(0.5, Number(difficulty?.speedFactor) || 1);
    const delay = Math.max(120, Math.round(baseDelay * speedFactor));

    sequence.forEach((cls, i) => {
      setTimeout(() => highlightButton(cls), delay * (i + 1));
    });
    setTimeout(() => { if (feedback) feedback.textContent = 'Your turn! Repeat the pattern.'; }, delay * (sequence.length + 1));
  }

  function highlightButton(id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    // Play the SFX named after the id (archer/mage/warrior/healer)
    AudioFX.play(id);

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
      // NEW: fail sound
      AudioFX.play('fail');
      updateDisplays();
      if (playerHealth <= 0) {

        // NEW: ONLY here – game over sound
        AudioFX.play('game_over');

        // DEFEAT popup
        gamePauseWith(() =>
          openStory('defeat', {
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
          // Healing: Female has it from the start; both characters from level > 2
          if (character?.name === 'Female' || level > 2) heal += 10 + level * 2;
        } else {
          dmg += 10 + level * 2;
        }
      });

      playerHealth = Math.min(playerHealth + heal, 100);
      monsterHealth = Math.max(monsterHealth - dmg, 0);

      // Score scaled by difficulty
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
              gamePauseWith(() => openStory('afterLevel2', {}), doAdvance);
            } else if (justCleared === 3) {
              gamePauseWith(() => openStory('afterLevel3', {}), doAdvance);
            } else if (justCleared === 4) {
              const ctx = { setPath: (p) => { pathChoice = p; } };
              gamePauseWith(() => openStory('afterLevel4', ctx), doAdvance);
            } else {
              doAdvance();
            }
          } else {
            gamePauseWith(() => openStory('victory', { score, rounds: round, path: pathChoice }));
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

  // --- Story tagging + pause/resume with success chime on close (Lv≥3) ---
  let __lastStory = { type: null, threshold: 0 };
  function openStory(type, payload) {
    // Determine the "level threshold" this story corresponds to
    let threshold;
    switch (type) {
      case 'afterLevel2': threshold = 2; break;
      case 'afterLevel3': threshold = 3; break;
      case 'afterLevel4': threshold = 4; break;
      case 'victory':     threshold = 5; break;
      case 'defeat':      threshold = -1; break; // explicitly excluded from success chime
      case 'halfPlayer':
      case 'halfMonster': threshold = level; break; // current level context
      default:            threshold = level;
    }
    __lastStory = { type, threshold };
    return showStory(type, payload);
  }

  function gamePauseWith(showFn, after = null) {
    const wasRunning = gameStarted;
    gameStarted = false;
    showFn();

    const modal = document.getElementById('story-modal');
    if (!modal) { if (after) after(); return; }

    const observer = new MutationObserver(() => {
      const hidden = modal?.classList.contains('hidden');
      if (hidden) {
        observer.disconnect();

        // NEW: play success SFX when any story popup (except 'defeat') closes AND threshold ≥ 3
        if (__lastStory.type !== 'defeat' && __lastStory.threshold >= 3) {
          AudioFX.play('success');
        }

        if (after) {
          setTimeout(() => { if (!wasRunning) gameStarted = true; after(); }, 150);
        }
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
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
            gamePauseWith(() => openStory('afterLevel2', {}), doAdvance);
          } else if (justCleared === 3) {
            gamePauseWith(() => openStory('afterLevel3', {}), doAdvance);
          } else if (justCleared === 4) {
            const ctx = { setPath: (p) => { pathChoice = p; } };
            gamePauseWith(() => openStory('afterLevel4', ctx), doAdvance);
          } else {
            doAdvance();
          }
        } else {
          gamePauseWith(() => openStory('victory', { score, rounds: round, path: pathChoice }));
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

  // Highlight helper: static (no animation), auto-clears after `duration`.
  function cue(id, { gold = false, duration = 450 } = {}) {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.remove('cue', 'cue-gold'); // reset
    void el.offsetWidth;                     // reflow so class re-applies
    el.classList.add(gold ? 'cue-gold' : 'cue');

    setTimeout(() => el.classList.remove(gold ? 'cue-gold' : 'cue'), duration);
  }

  // Example sequence playback:
  // - normal cue uses the button's own glow
  // - the SECOND in any consecutive run becomes gold
  function playSequence(sequence, stepDelay = 700) {
    sequence.forEach((id, i) => {
      setTimeout(() => {
        const sameAsPrev = i > 0 && sequence[i] === sequence[i - 1];
        const secondInRun =
          sameAsPrev && (i < 2 || sequence[i - 2] !== sequence[i]); // only the first repeat
        cue(id, { gold: secondInRun, duration: Math.max(350, stepDelay - 150) });
      }, i * stepDelay);
    });
  }
// help.js (or wherever you auto-open)
const HOWTO_KEY = 'rpg_seen_howto';

function openHowtoModal({firstRun = false} = {}) {
  const modal = document.getElementById('howto-modal');
  modal.classList.remove('hidden');
  document.getElementById('howto-title')?.focus();
}



  // Go!
  initGame();
});