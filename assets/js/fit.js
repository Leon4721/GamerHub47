
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

    document.body.classList.remove('gc-fit');
    root.style.setProperty('--gc-scale', '1');

    const naturalH = gc.offsetHeight;
    const naturalW = gc.offsetWidth;


    const pad = 12;
    const availH = Math.max(0, window.innerHeight - pad);
    const availW = Math.max(0, window.innerWidth  - pad);

    if (!naturalH || !availH) return;

    const hScale = naturalH > 0 ? (availH / naturalH) : 1;
    const wScale = naturalW > 0 ? (availW / naturalW) : 1;

 
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


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFit);
  } else {
    applyFit();
  }


  window.addEventListener('load', applyFit);


  window.addEventListener('resize', applyFitDebounced);
  window.addEventListener('orientationchange', applyFit);


  try {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(applyFit).catch(() => {});
    }
  } catch {}


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
