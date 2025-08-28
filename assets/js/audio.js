// assets/js/audio.js
// Global audio manager: background music and per-button SFX, with independent toggles.
// Exposes window.AudioFX { init(), play(name) }

(function () {
  const AudioFX = {};
  let ctx;                      // WebAudio context for SFX
  let sfxEnabled   = true;
  let musicEnabled = false;
  const buffers = {};           // decoded SFX buffers

    // feedback
    success: 'assets/audio/sfx/success.mp3',
    fail   : 'assets/audio/sfx/fail.mp3',
    game_over: 'assets/audio/sfx/game_over.mp3',

    // index UX
    namefill: 'assets/audio/sfx/namefill.mp3',
    selectcharacter: 'assets/audio/sfx/selectcharacter.mp3',

    // nav
    contactus: 'assets/audio/sfx/contactus.mp3'
  };

  // Background music tag (HTMLAudio is fine for looped BGM)
  const bgm = new Audio('assets/audio/music/overworld_theme.mp3');
  bgm.loop = true;
  bgm.volume = 0.35;

  function readPrefs() {
    try { sfxEnabled   = JSON.parse(localStorage.getItem('sfxEnabled')   ?? 'true'); } catch {}
    try { musicEnabled = JSON.parse(localStorage.getItem('musicEnabled') ?? 'false'); } catch {}
  }

  function writePrefs() {
    localStorage.setItem('sfxEnabled', JSON.stringify(sfxEnabled));
    localStorage.setItem('musicEnabled', JSON.stringify(musicEnabled));
  }

  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  async function loadAll() {
    try {
      ensureCtx();
      await Promise.all(Object.entries(SFX_URLS).map(async ([key, url]) => {
        const res = await fetch(url);
        if (!res.ok) return; // optional files allowed
        const arr = await res.arrayBuffer();
        buffers[key] = await ctx.decodeAudioData(arr);
      }));
    } catch (err) {
      console.warn('[audio] preload failed', err);
    }
  }

  function beepFallback() {
    try {
      ensureCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.value = 520;
      g.gain.value = 0.0001;
      o.connect(g).connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      o.stop(ctx.currentTime + 0.16);
    } catch {}
  }

  function play(name) {
    if (!sfxEnabled) return;
    try {
      ensureCtx();
      const buf = buffers[name];
      if (!buf) { beepFallback(); return; }
      const src = ctx.createBufferSource();
      const gain = ctx.createGain();
      gain.gain.value = 0.9;
      src.buffer = buf;
      src.connect(gain).connect(ctx.destination);
      src.start(0);
    } catch (err) {
      console.warn('[audio] play error', err);
    }
  }

  function toggleSFX() {
    sfxEnabled = !sfxEnabled;
    writePrefs();
    updateButtons();
  }

  function toggleMusic() {
    musicEnabled = !musicEnabled;
    writePrefs();
    if (musicEnabled) bgm.play().catch(()=>{});
    else bgm.pause();
    updateButtons();
  }

  function unlock() {
    try {
      ensureCtx();
      if (ctx.state === 'suspended') ctx.resume();
    } catch {}
  }

  function updateButtons() {
    const sfxBtn = document.getElementById('sfx-toggle');
    const musicBtn = document.getElementById('music-toggle');
    if (sfxBtn) {
      sfxBtn.setAttribute('aria-pressed', String(sfxEnabled));
      sfxBtn.title = `Sound effects: ${sfxEnabled ? 'on' : 'off'}`;
      const i = sfxBtn.querySelector('i');
      if (i) {
        i.classList.toggle('fa-volume-high', sfxEnabled);
        i.classList.toggle('fa-volume-xmark', !sfxEnabled);
      }
    }
    if (musicBtn) {
      musicBtn.setAttribute('aria-pressed', String(musicEnabled));
      musicBtn.title = `Music: ${musicEnabled ? 'on' : 'off'}`;
      musicBtn.classList.toggle('off', !musicEnabled);
    }
  }

  function bindContactClickSfx() {
    document.querySelectorAll('.contact-btn, a[href$="contact.html"]').forEach(a => {
      a.addEventListener('click', () => {
        unlock();
        try { play('contactus'); } catch {}
      }, { passive: true });
    });
  }

  function init() {
    readPrefs();
    updateButtons();
    loadAll(); // preload SFX (non-blocking)
    bindContactClickSfx();

    // UI hooks for the on-page toggles (if present)
    document.getElementById('sfx-toggle')?.addEventListener('click', () => { unlock(); toggleSFX(); });
    document.getElementById('music-toggle')?.addEventListener('click', () => { unlock(); toggleMusic(); });

    // Ensure we unlock on first user gesture (covers autoplay restrictions)
    window.addEventListener('click', unlock, { once: true });

    // If user left music ON last time, resume it
    if (musicEnabled) bgm.play().catch(()=>{});
  }

  // expose
  AudioFX.init = init;
  AudioFX.play = play;
  window.AudioFX = AudioFX;
})();
