// assets/js/a11y.js
// ============================================================================
// Accessibility helpers (screen reader announcements, focus-trap, keyboard UX)
// Author: You (Project 2). No external libs. You may reuse with attribution.
// ============================================================================

(() => {
  // SR live region (polite + assertive)
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

    // Respect reduced motion: add a class to root
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) document.documentElement.classList.add('reduce-motion');
    reduce.addEventListener?.('change', (e) => {
      document.documentElement.classList.toggle('reduce-motion', e.matches);
    });

    // Make .game-button elements keyboard-activatable (Space/Enter)
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
    // Clear then set to force SR announcement
    node.textContent = '';
    // tiny timeout to ensure DOM mutation is detected by SR
    setTimeout(() => { node.textContent = message; }, 10);
  }

  // Focus trap for any modal/dialog container
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

  // Expose globally
  window.A11Y = { announce, trapFocus };
})();
