// ui.js
import { storyBeats } from './story.js';

/**
 * Show a story beat in the shared modal.
 * - beatKey: string or function-config key from storyBeats
 * - context: optional data passed into functional beats, and also injected into button actions
 */
export function showStory(beatKey, context = {}) {
  const modal = document.getElementById('story-modal');
  const imgEl = document.getElementById('story-image');
  const textEl = document.getElementById('story-text');
  const btnContainer = document.getElementById('story-buttons');

  let beat = storyBeats[beatKey];
  if (typeof beat === 'function') {
    beat = beat(context);
  }

  // Render
  imgEl.src = beat.image || '';
  // Allow simple HTML (strong/em/emphasis/line breaks) in text
  textEl.innerHTML = (beat.text || '').replace(/\n/g, '<br/>');

  btnContainer.innerHTML = '';
  (beat.buttons || []).forEach(btn => {
    const b = document.createElement('button');
    b.textContent = btn.label;
    b.onclick = () => {
      modal.classList.add('hidden');
      // If button action expects context, pass it
      if (typeof btn.action === 'function') btn.action(context);
    };
    btnContainer.appendChild(b);
  });

  modal.classList.remove('hidden');
}
