
document.addEventListener('DOMContentLoaded', () => {
  try { window.AudioFX && window.AudioFX.init(); } catch {}

  const nameInput =
    document.getElementById('player-name') ||
    document.querySelector('[name="player-name"]');


  const startBtn =
    document.getElementById('start-game') ||
    document.querySelector('[data-start-game]') ||
    document.querySelector('a[href$="game.html"]');

  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      const name = (nameInput?.value || '').trim();
      if (!name) {
        try { window.AudioFX && window.AudioFX.play('namefill'); } catch {}
       
      }
    });
  }

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
