// ui.js
import { storyBeats } from './story.js';

export function showStory(beatKey, context = {}) {
  const modal = document.getElementById('story-modal');
  const imgEl = document.getElementById('story-image');
  const textEl = document.getElementById('story-text');
  const btnContainer = document.getElementById('story-buttons');

  // If any node is missing, don't crash—log and bail.
  if (!modal || !imgEl || !textEl || !btnContainer) {
    console.warn('[Story] Modal nodes missing in DOM.');
    return;
  }

  let beat = storyBeats?.[beatKey];

  // Fallback if the beat key doesn't exist
  if (!beat) {
    console.warn(`[Story] Unknown beat key: ${beatKey}`);
    beat = {
      image: '',
      text: `<strong>Scene not found:</strong> ${beatKey}`,
      buttons: [{ label: 'Back to Title', action: () => { window.location.href = 'index.html'; } }]
    };
  }

  // If beat is a function, safely execute it
  if (typeof beat === 'function') {
    try { beat = beat(context); }
    catch (err) {
      console.error('[Story] Beat function crashed:', err);
      beat = {
        image: '',
        text: `<strong>Oops.</strong> This scene failed to render.`,
        buttons: [{ label: 'Back to Title', action: () => { window.location.href = 'index.html'; } }]
      };
    }
  }

  // Render the scene
  imgEl.src = beat.image || '';
  textEl.innerHTML = (beat.text || '').replace(/\n/g, '<br/>');
  btnContainer.innerHTML = '';

  (beat.buttons || []).forEach(btn => {
    const b = document.createElement('button');
    b.textContent = btn.label;
    b.onclick = () => {
      modal.classList.add('hidden');
      if (typeof btn.action === 'function') btn.action(context);
    };
    btnContainer.appendChild(b);
  });

  modal.classList.remove('hidden');
}
