

(function () {
  function $(sel, ctx = document) { return ctx.querySelector(sel); }
  const helpBtn = $('#help-btn');
  const modal   = $('#howto-modal');
  const closeX  = $('#howto-close');
  const okBtn   = $('.howto-ok');
  const backdrop= $('.howto-backdrop');

  if (!helpBtn || !modal) return;

  function openModal(){
    modal.classList.remove('hidden');
    helpBtn.setAttribute('aria-expanded', 'true');

    if (closeX) closeX.focus({ preventScroll: true });
  
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function closeModal(){
    modal.classList.add('hidden');
    helpBtn.setAttribute('aria-expanded', 'false');
   
    helpBtn.focus({ preventScroll: true });
 
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  helpBtn.addEventListener('click', openModal);
  if (closeX) closeX.addEventListener('click', closeModal);
  if (okBtn) okBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      e.preventDefault();
      closeModal();
    }
  });
})();
