// game logic with story popups at exact milestones + half-health events
import { showStory } from './ui.js';

if (window.__RPG_INIT__) { console.warn('RPG already initialized'); }
else { window.__RPG_INIT__ = true; }

document.addEventListener('DOMContentLoaded', () => {
  const raw = localStorage.getItem('playerData');
  if (!raw) { window.location.href = 'index.html'; return; }
  const { name: playerName, character } = JSON.parse(raw);

  // Put player's portrait into the left card (robust, no root-path fallbacks)
  const playerPortraitEl = document.getElementById('player-portrait');

  function resolvePortraitPath() {
    // preferred → alt → safe fallback (relative only to avoid GitHub Pages root 404s)
    return (
      character?.image ||
      character?.portrait ||
      'assets/images/characters/default.png'
    );
  }

  function setPortraitSafe(imgEl, src) {
    if (!imgEl) return;

    imgEl.onerror = () => {
      // Single safe fallback (relative only)
      const fallback = 'assets/images/characters/default.png';
      if (!imgEl.src.endsWith(fallback)) imgEl.src = fallback;
    };
    imgEl.onload = null;

    imgEl.alt = character?.name ? `${character.name} portrait` : 'Selected character portrait';
    imgEl.src = src;
  }

  if (playerPortraitEl) {
    const src = resolvePortraitPath();
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
  let howtoPending = false; // prevents double-popup during first-run modal

  function getHighScores() {
    try { return JSON.parse(localStorage.getItem('rpgHighScores')) || []; }
    catch { return []; }
  }

  function saveHighScore(entry) {
    const list = getHighScores();
    list.push(entry);
    list.sort((a,b) => b.score - a.score || b.bestStreak - a.bestStreak || b.rounds - a.rounds);
    const top5 = list.slice(0,5);
    localStorage.setItem('rpgHighScores', JSON.stringify(top5));
  }

  // One-time flags for special popups
  let shownHalfPlayer = false;
  let shownHalfMonster = false;
  let pathChoice = 'assault';

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

    const SFX_URLS = {
      archer : 'assets/audio/sfx/archer.mp3',
      mage   : 'assets/audio/sfx/mage.mp3',
      warrior: 'assets/audio/sfx/warrior.mp3',
      healer : 'assets/audio/sfx/healer.mp3',
      success: 'assets/audio/sfx/success.mp3',
      fail   : 'assets/audio/sfx/fail.mp3',
      game_over: 'assets/audio/sfx/game_over.mp3',
      contactus: 'assets/audio/sfx/contactus.mp3'
    };

    const buffers = {};
    const bgm = new Audio('assets/audio/music/overworld_theme.mp3');
    bgm.loop = true;
    bgm.volume = 0.35;

    function ensureCtx(){
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    async function loadAll(){
      try{
        ensureCtx();
        await Promise.all(Object.entries(SFX_URLS).map(async ([key, url]) => {
          const res = await fetch(url);
          if (!res.ok) return;
          const arr = await res.arrayBuffer();
          buffers[key] = await ctx.decodeAudioData(arr);
        }));
      }catch(e){ /* non-blocking */ }
    }

    function beepFallback(){
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
        gain.gain.value = 0.9;
        src.buffer = buf;
        src.connect(gain).connect(ctx.destination);
        src.start(0);
      }catch(e){ /* ignore */ }
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

    function unlock(){
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
      loadAll();
      updateButtons();
      document.getElementById('sfx-toggle')?.addEventListener('click', () => { unlock(); toggleSFX(); });
      document.getElementById('music-toggle')?.addEventListener('click', () => { unlock(); toggleMusic(); });
      document.querySelectorAll('.contact-btn, a[href$="contact.html"]').forEach(a => {
        a.addEventListener('click', () => { unlock(); play('contactus'); }, { passive: true });
      });
      window.addEventListener('click', unlock, { once: true });
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
    if (monsterNameEl)  monsterNameEl.textContent  = m.name;
    if (monsterLevelEl) monsterLevelEl.textContent = m.level;
    monsterHealth = m.health;
    if (levelDisplay) levelDisplay.textContent = m.level;

    if (monsterHealthLabel) monsterHealthLabel.textContent = `${possessive(m.name)} Health`;
    if (monsterHPBar)       monsterHPBar.setAttribute('aria-label', `${possessive(m.name)} Health`);

    if (monsterDisplay) {
      monsterDisplay.innerHTML = '';
      monsterDisplay.appendChild(createMonsterCard(m));
    }
    shownHalfMonster = false;
  }

  // Difficulty
  const defaultDiff = { key:'medium', label:'Medium', speedFactor:1.0, complexityFactor:1.0, scoreFactor:1.0 };
  const difficulty = (() => {
    try { return JSON.parse(localStorage.getItem('difficulty')) || defaultDiff; }
    catch { return defaultDiff; }
  })();

  const modeEl = document.getElementById('mode-display');
  if (modeEl) modeEl.textContent = difficulty.label || 'Medium';

  // ---- Difficulty scaling helpers --------------------------------------------
  const BASE_ADDS_BY_LEVEL = [0, 1, 1, 2, 2, 3];
  function roundBonusOf(r) { return Math.min(3, Math.max(0, r - 1)); }
  function getAddsMultiplier(diff) {
    if (typeof diff?.addsMultiplier === 'number') return diff.addsMultiplier;
    if (typeof diff?.complexityFactor === 'number') return diff.complexityFactor;
    return 1.0;
  }
  function capEasyAgainstHardL2(adds, round) {
    const HARD_MULT = 1.5;
    const baseL2 = BASE_ADDS_BY_LEVEL[2] || 1;
    const rawL2 = baseL2 + roundBonusOf(round);
    const hardL2Adds = Math.max(1, Math.round(rawL2 * HARD_MULT));
    return Math.min(adds, hardL2Adds);
  }
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

    if (!shownHalfPlayer && playerHealth <= 50 && playerHealth > 0) {
      shownHalfPlayer = true;
      gamePauseWith(() => openStory('halfPlayer', { name: playerName }));
    }
    if (!shownHalfMonster && monsterHealth > 0) {
      const maxHealth = monsters[level - 1].health;
      if ((monsterHealth / maxHealth) <= 0.5) {
        shownHalfMonster = true;
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

    if (playerHealthLabel) playerHealthLabel.textContent = `${possessive(playerName)} Health`;
    if (playerHPBar)       playerHPBar.setAttribute('aria-label', `${possessive(playerName)} Health`);

    setMonster(0);
    if (feedback) feedback.textContent = 'Press Start Battle to begin your adventure!';
    gameStarted = false;
    shownHalfPlayer = false;
    shownHalfMonster = false;
    updateDisplays();
  }

  // === START BATTLE (shows How-to ONCE per player, only at the very start) ===
  function startBattle() {
    if (gameStarted || howtoPending) return;

    const begin = () => {
      gameStarted = true;
      if (feedback) feedback.textContent = `Battle begins! Defeat the ${monsters[0].name}!`;
      setTimeout(nextRound, 1200);
    };

    const howtoKey = `howtoSeen:${playerName || 'anon'}`;
    const seenHowto = localStorage.getItem(howtoKey) === '1';
    const atVeryStart = level === 1 && round === 0;

    if (atVeryStart && !seenHowto) {
      const helpBtn = document.getElementById('help-btn');
      const modal   = document.getElementById('howto-modal');
      if (!helpBtn || !modal) { begin(); return; }

      howtoPending = true;

      let prevHidden = modal.classList.contains('hidden');
      const mo = new MutationObserver(() => {
        const isHidden = modal.classList.contains('hidden');
        if (!prevHidden && isHidden) {
          mo.disconnect();
          localStorage.setItem(howtoKey, '1');
          howtoPending = false;
          begin();
        }
        prevHidden = isHidden;
      });
      mo.observe(modal, { attributes: true, attributeFilter: ['class'] });

      // Open via existing handler (NO auto-scroll)
      helpBtn.click();

      // Safety net: force open if still hidden briefly after
      setTimeout(() => {
        if (modal.classList.contains('hidden')) {
          helpBtn.setAttribute('aria-expanded', 'true');
          modal.classList.remove('hidden');
        }
      }, 150);

      return;
    }

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

  function nextRound() {
    if (!gameStarted) return;
    playerSequence = [];
    round++;

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
    AudioFX.play(id);
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
      AudioFX.play('fail');
      updateDisplays();
      if (playerHealth <= 0) {
        AudioFX.play('game_over');
        gamePauseWith(() =>
          openStory('defeat', {
            score, rounds: round,
            retry: () => {
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
    let threshold;
    switch (type) {
      case 'afterLevel2': threshold = 2; break;
      case 'afterLevel3': threshold = 3; break;
      case 'afterLevel4': threshold = 4; break;
      case 'victory':     threshold = 5; break;
      case 'defeat':      threshold = -1; break;
      case 'halfPlayer':
      case 'halfMonster': threshold = level; break;
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

  // Input bindings
  if (startBtn) startBtn.addEventListener('click', startBattle);
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

  // Highlight helper
  function cue(id, { gold = false, duration = 450 } = {}) {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.remove('cue', 'cue-gold');
    void el.offsetWidth;
    el.classList.add(gold ? 'cue-gold' : 'cue');

    setTimeout(() => el.classList.remove(gold ? 'cue-gold' : 'cue'), duration);
  }

  // Example sequence playback
  function playSequence(sequence, stepDelay = 700) {
    sequence.forEach((id, i) => {
      setTimeout(() => {
        const sameAsPrev = i > 0 && sequence[i] === sequence[i - 1];
        const secondInRun = sameAsPrev && (i < 2 || sequence[i - 2] !== sequence[i]);
        cue(id, { gold: secondInRun, duration: Math.max(350, stepDelay - 150) });
      }, i * stepDelay);
    });
  }

  // NOTE: Removed the separate help.js-style auto-open on DOMContentLoaded
  // (that was causing the first-load "jump"/glitch). How-to opens only on
  // first Start Battle for this player.

  // Go!
  initGame();
});
