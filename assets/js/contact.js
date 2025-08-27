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
