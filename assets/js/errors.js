
(() => {
  const toast = document.createElement('div');
  toast.id = 'error-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.style.cssText = `
    position: fixed; z-index: 9999; left: 50%; transform: translateX(-50%);
    bottom: 16px; max-width: 90vw; background: #1f2937; color: #fff;
    padding: 10px 14px; border-radius: 10px; box-shadow: 0 6px 20px rgba(0,0,0,.3);
    font-size: 14px; display: none;
  `;
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(toast));

  function showToast(msg) {
    toast.textContent = msg;
    toast.style.display = 'block';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => (toast.style.display = 'none'), 4000);
  }

  window.addEventListener('error', (e) => {
    console.error('[GlobalError]', e.error || e.message);
    showToast('Something went wrong, but you can keep playing. Check console for details.');
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('[UnhandledRejection]', e.reason);
    showToast('A background task failed. We recovered gracefully.');
  });


  window.safeTry = async (fn, fallback) => {
    try { return await fn(); } catch (err) { console.warn('[safeTry]', err); return fallback; }
  };
})();
