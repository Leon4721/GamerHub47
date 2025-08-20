// assets/js/fit.js
// Non-destructive viewport-fit scaler for the game page.
// It measures the natural size of .game-container and scales it down ONLY if needed.
// Width is already responsive in your CSS; we still clamp by width just in case.

(function () {
  const root = document.documentElement;

  function $(sel, ctx = document) { return ctx.querySelector(sel); }

  function debounce(fn, ms = 60) {
    let t = 0;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function applyFit() {
    const gc = $('.game-container');
    if (!gc) return;

    // Reset any prior scaling before measuring
    document.body.classList.remove('gc-fit');
    root.style.setProperty('--gc-scale', '1');

    // Natural (unscaled) sizes
    const naturalH = gc.offsetHeight;
    const naturalW = gc.offsetWidth;

    // Available viewport space (with a small safety padding)
    const pad = 12;
    const availH = Math.max(0, window.innerHeight - pad);
    const availW = Math.max(0, window.innerWidth  - pad);

    if (!naturalH || !availH) return;

    // Compute scale factors; protect against divide-by-zero
    const hScale = naturalH > 0 ? (availH / naturalH) : 1;
    const wScale = naturalW > 0 ? (availW / naturalW) : 1;

    // We fit to whichever axis requires more downscaling (use the minimum)
    const scale = Math.min(1, hScale, wScale);

    if (scale < 1) {
      root.style.setProperty('--gc-scale', String(Number(scale.toFixed(4))));
      document.body.classList.add('gc-fit');
    } else {
      root.style.setProperty('--gc-scale', '1');
      document.body.classList.remove('gc-fit');
    }
  }

  const applyFitDebounced = debounce(applyFit, 60);

  // Run once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFit);
  } else {
    applyFit();
  }

  // Run after full load (fonts, images)
  window.addEventListener('load', applyFit);

  // Re-run on viewport changes
  window.addEventListener('resize', applyFitDebounced);
  window.addEventListener('orientationchange', applyFit);

  // Re-run after web fonts finish loading (if supported)
  try {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(applyFit).catch(() => {});
    }
  } catch {}

  // Observe the story modal and the game container for content/layout changes.
  // (e.g., popups open/close, monster card swaps, text updates)
  try {
    const modal = $('#story-modal');
    if (modal) {
      const mo = new MutationObserver(applyFitDebounced);
      mo.observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });
    }

    const gc = $('.game-container');
    if (gc) {
      const go = new MutationObserver(applyFitDebounced);
      go.observe(gc, { childList: true, subtree: true, attributes: true });
    }
  } catch {}
})();
