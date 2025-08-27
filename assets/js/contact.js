// assets/js/contact.js
(() => {
  // ====== 1) INIT EmailJS with your PUBLIC key ======
  // Get this from EmailJS Dashboard → Account → API Keys (it starts with "public_")
  const PUBLIC_KEY = 'PUBLIC_KEY_HERE'; // <-- REPLACE ME (e.g., 'public_AbC123xyz')
  emailjs.init(PUBLIC_KEY);

  // ====== 2) Your fixed Service ID from user ======
  const SERVICE_ID = 'service_v0q4w4j';

  // ====== 3) Your Template ID ======
  // Create a template in EmailJS and copy its ID (e.g., 'template_abc123')
  const TEMPLATE_ID = 'TEMPLATE_ID_HERE'; // <-- REPLACE ME

  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');
  const sendBtn = document.getElementById('send-btn');

  const pageUrlInput = document.getElementById('page_url');
  const consentHidden = document.getElementById('consent_value');
  const consentCheckbox = document.getElementById('consent_checkbox');

  // Helpful extras
  if (pageUrlInput) pageUrlInput.value = window.location.href;

  // simple human-speed check (anti-bot)
  const loadTime = Date.now();

  const setStatus = (msg) => { statusEl.textContent = msg; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // ====== Client validation ======
    const name = form.from_name.value.trim();
    const email = form.reply_to.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !subject || !message) {
      setStatus('Please fill in all required fields.');
      return;
    }

    // Optional consent gate
    if (consentCheckbox && !consentCheckbox.checked) {
      setStatus('Please tick the consent box so we can contact you.');
      return;
    }

    // Honeypot
    if (form._honeypot && form._honeypot.value) {
      // likely a bot; silently abort
      return;
    }

    // Human-speed: at least 1500ms since page load
    if (Date.now() - loadTime < 1500) {
      setStatus('Please wait a moment before sending.');
      return;
    }

    // Sync consent value into hidden field so it goes with the template
    if (consentHidden) {
      consentHidden.value = consentCheckbox && consentCheckbox.checked ? 'Yes' : 'No';
    }

    // ====== Send via EmailJS ======
    try {
      sendBtn.disabled = true;
      setStatus('Sending…');

      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form);
      setStatus('Message sent! We’ll get back to you shortly.');
      form.reset();
      if (pageUrlInput) pageUrlInput.value = window.location.href; // repopulate after reset
    } catch (err) {
      console.error('[EmailJS] send error:', err);
      // Helpful messages for common errors
      if (String(err?.text || err?.message || '').includes('User ID')) {
        setStatus('Email service is not initialized correctly. Double-check your Public Key.');
      } else if (String(err?.text || '').includes('template') || String(err?.text || '').includes('service')) {
        setStatus('Email template or service not found. Check your IDs.');
      } else {
        setStatus('Sorry, sending failed. Please try again in a moment.');
      }
    } finally {
      sendBtn.disabled = false;
    }
  });
})();
  // Modal helpers
    const modalBackdrop=document.getElementById('modal-backdrop');
    const modalTitle=document.getElementById('modal-title');
    const modalMsg=document.getElementById('modal-message');
    const modalOk=document.getElementById('modal-ok');
    function showModal(t,m){ modalTitle.textContent=t||'Notice'; modalMsg.textContent=m||''; modalBackdrop.style.display='flex'; modalBackdrop.setAttribute('aria-hidden','false'); modalOk.focus(); }
    function hideModal(){ modalBackdrop.style.display='none'; modalBackdrop.setAttribute('aria-hidden','true'); }
    modalOk.addEventListener('click',hideModal);
    modalBackdrop.addEventListener('click',(e)=>{ if(e.target===modalBackdrop) hideModal(); });
    document.addEventListener('keydown',(e)=>{ if(e.key==='Escape' && modalBackdrop.getAttribute('aria-hidden')==='false') hideModal(); });

    // Smart Return
    (function(){
      const btn=document.getElementById('btn-return');
      if(!btn) return;
      btn.addEventListener('click',()=>{
        try{
          const ref=document.referrer;
          if(ref && new URL(ref).origin===location.origin){ history.back(); }
          else{ window.location.href='index.html'; }
        }catch{ window.location.href='index.html'; }
      });
    })();

    // EmailJS config
    const PUBLIC_KEY='K7MPJRPc2Z9q4R3gh'; // 
    const SERVICE_ID='service_3g1qw6b';
    const TEMPLATE_ID='template_n9as6o4'; // change only if your template differs

    try{
      emailjs.init(PUBLIC_KEY);
    }catch(e){
      console.error('[EmailJS] init failed:', e);
    }

    // Form logic (explicit mapping + detailed errors)
    (function(){
      const form=document.getElementById('contact-form');
      const status=document.getElementById('form-status');
      const sendBtn=document.getElementById('btn-send');
      const pageUrl=document.getElementById('page_url');
      if(pageUrl) pageUrl.value=window.location.href;

      const loadTime=Date.now();

      form.addEventListener('submit', async (e)=>{
        e.preventDefault();

        if(!form.checkValidity()){
          status.textContent='Please fill in all required fields.';
          showModal('Missing Information','Please fill in all required fields before sending.');
          return;
        }
        if(form._honeypot && form._honeypot.value){ return; }
        if(Date.now()-loadTime<1200){
          status.textContent='Please wait a moment before sending.';
          showModal('Slow down','Please wait a moment before sending.');
          return;
        }

        const params={
          from_name: document.getElementById('from_name').value.trim(),
          reply_to:  document.getElementById('reply_to').value.trim(),
          message:   document.getElementById('message').value.trim(),
          subject:   'RPG Memory Battle – Contact Form',
          page_url:  pageUrl ? pageUrl.value : location.href
        };

        try{
          sendBtn.disabled=true;
          status.textContent='Sending…';

          const res=await emailjs.send(SERVICE_ID, TEMPLATE_ID, params);

          status.textContent='Thanks! Your message has been sent.';
          showModal('Message Sent','Thanks! Your message has been sent. We’ll get back to you shortly.');
          form.reset();
          if(pageUrl) pageUrl.value=window.location.href;
          console.log('[EmailJS] success:', res);
        }catch(err){
          console.error('[EmailJS] send error:', err);
          const raw=(err && (err.text || err.message)) ? (err.text || err.message) : JSON.stringify(err);
          let friendly='Sorry, sending failed. Please try again in a moment.';
          const lower=String(raw).toLowerCase();
          if(lower.includes('user id') || lower.includes('public key')){
            friendly='Email service is not initialized correctly. Double-check your Public Key (must start with "public_").';
          }else if(lower.includes('service') || lower.includes('template')){
            friendly='Email template or service not found. Verify Service ID and Template ID.';
          }else if(lower.includes('unauthorized') || lower.includes('401')){
            friendly='Unauthorized. Ensure the Public Key belongs to your EmailJS account.';
          }
          status.textContent=friendly;
          showModal('Send Failed', `${friendly}\n\nDetails: ${raw}`);
        }finally{
          sendBtn.disabled=false;
        }
      });
    })();