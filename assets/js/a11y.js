

(() => {

  const polite = document.createElement('div');
  polite.id = 'sr-announcer-polite';
  polite.setAttribute('aria-live', 'polite');
  polite.className = 'sr-only';

  const assertive = document.createElement('div');
  assertive.id = 'sr-announcer-assertive';
  assertive.setAttribute('aria-live', 'assertive');
  assertive.className = 'sr-only';

  document.addEventListener('DOMContentLoaded', () => {
    document.body.append(polite, assertive);


    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) document.documentElement.classList.add('reduce-motion');
    reduce.addEventListener?.('change', (e) => {
      document.documentElement.classList.toggle('reduce-motion', e.matches);
    });

    document.body.addEventListener('keydown', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.classList.contains('game-button') || target.getAttribute('role') === 'button') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          target.click();
        }
      }
    });
  });

  function announce(message, mode = 'polite') {
    const node = mode === 'assertive' ? assertive : polite;

    node.textContent = '';
 
    setTimeout(() => { node.textContent = message; }, 10);
  }


  function trapFocus(container) {
    if (!container) return () => {};
    const FOCUSABLE = 'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const firstLast = () => {
      const list = Array.from(container.querySelectorAll(FOCUSABLE)).filter(el => el.offsetParent !== null);
      return { first: list[0], last: list[list.length - 1] };
    };
    function onKey(e) {
      if (e.key !== 'Tab') return;
      const { first, last } = firstLast();
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener('keydown', onKey);
    return () => container.removeEventListener('keydown', onKey);
  }


  window.A11Y = { announce, trapFocus };
})();
