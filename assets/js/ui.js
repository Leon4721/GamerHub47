// ui.js
import { storyBeats } from './story.js';

export function showStory(beatKey, context = {}) {
  const modal       = document.getElementById('story-modal');
  const imgEl       = document.getElementById('story-image');
  const textEl      = document.getElementById('story-text');
  const btnContainer= document.getElementById('story-buttons');

  let beat = storyBeats[beatKey];
  if (typeof beat === 'function') {
    beat = beat(context);
  }

  imgEl.src        = beat.image;
  textEl.textContent = beat.text;
  btnContainer.innerHTML = '';

  beat.buttons.forEach(btn => {
    const b = document.createElement('button');
    b.textContent = btn.label;
    b.onclick = () => {
      modal.classList.add('hidden');
      btn.action();
    };
    btnContainer.appendChild(b);
  });

  modal.classList.remove('hidden');
}