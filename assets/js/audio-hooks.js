// assets/js/index-audio-hooks.js
// Plays sfx for: name missing on start, character select, contact click (handled in audio.js)

document.addEventListener('DOMContentLoaded', () => {
  try { window.AudioFX && window.AudioFX.init(); } catch {}

  const nameInput =
    document.getElementById('player-name') ||
    document.querySelector('[name="player-name"]');

  // Try to identify a "Start Game" trigger on index
  const startBtn =
    document.getElementById('start-game') ||
    document.querySelector('[data-start-game]') ||
    document.querySelector('a[href$="game.html"]');

  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      const name = (nameInput?.value || '').trim();
      if (!name) {
        try { window.AudioFX && window.AudioFX.play('namefill'); } catch {}
        // Let your existing validation/pop still run; if you navigate directly,
        // you can prevent default here instead:
        // e.preventDefault();
      }
    });
  }

  // Character selection (click on card or change of radio/input)
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.character-card, [data-character], .char-select');
    if (card) {
      try { window.AudioFX && window.AudioFX.play('selectcharacter'); } catch {}
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target && (e.target.matches('input[name="character"]') || e.target.closest('input[name="character"]'))) {
      try { window.AudioFX && window.AudioFX.play('selectcharacter'); } catch {}
    }
  });
});
