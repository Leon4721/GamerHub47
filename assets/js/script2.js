// selection.js — handles character selection and the pre-game story popup
import { showStory } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const characters = [
    {
      name: "Male",
      role: "Knight of Valor",
      image: "assets/images/galihad.png",
      stats: { Strength: 85, Agility: 70, Intellect: 60, Defense: 90 },
      description: "A noble knight from the Silver Kingdom, wielder of the legendary Sun-Spear."
    },
    {
      name: "Female",
      role: "Arcane Archer",
      image: "assets/images/eva.png",
      stats: { Strength: 65, Agility: 95, Intellect: 85, Defense: 70 },
      description: "An elven archer who channels elemental magic to strike from great distances."
    }
  ];

  const characterList = document.getElementById('characterList');
  const startBtn = document.getElementById('start-btn');
  let selectedCharacter = null;

  // Build character cards
  characters.forEach((char, index) => {
    const card = document.createElement('div');
    card.classList.add('character-card');
    card.dataset.index = index;

    card.innerHTML = `
      <div class="character-name">${char.name}</div>
      <div class="character-role">${char.role}</div>
      <div class="character-image" style="background-image:url('${char.image}')"></div>
      <div class="character-stats">
        ${Object.entries(char.stats).map(([stat, val]) => `
          <div class="stat">
            <div class="stat-value">${val}</div>
            <div class="stat-label">${stat}</div>
          </div>
        `).join('')}
      </div>
      <div class="character-description">${char.description}</div>
      <button class="select-btn" type="button">SELECT</button>
    `;
    characterList.appendChild(card);

    card.addEventListener('click', () => {
      document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedCharacter = char;
      startBtn.disabled = false;
    });
  });
function getHighScores() {
  try { return JSON.parse(localStorage.getItem('rpgHighScores')) || []; }
  catch { return []; }
}

function renderHighScoresIndex() {
  const tbody = document.querySelector('#highscore-table tbody');
  if (!tbody) return;
  const list = getHighScores();
  tbody.innerHTML = list.map((r, i) => `
    <tr>
      <td>${i+1}</td>
      <td>${r.name || '—'}</td>
      <td>${r.score}</td>
      <td>${r.bestStreak || 0}</td>
      <td>${r.rounds}</td>
      <td>${r.level}</td>
      <td>${r.path || '—'}</td>
      <td>${r.outcome}</td>
      <td>${r.date}</td>
    </tr>`).join('') || '<tr><td colspan="9">No scores yet</td></tr>';
}

  // Start -> show Post-Select popup (before navigating)
// === Difficulty popup (runs before story) ===
// === Difficulty profiles used by the game page ===
const DIFFICULTY = {
  easy:   { key:'easy',   label:'Easy',   speedFactor: 2.0, complexityFactor: 0.5, scoreFactor: 0.5 },
  medium: { key:'medium', label:'Medium', speedFactor: 1.0, complexityFactor: 1.0, scoreFactor: 1.0 },
  hard:   { key:'hard',   label:'Hard',   speedFactor: 0.5, complexityFactor: 2.0, scoreFactor: 2.0 }
};


function showDifficultyModal(onPick) {
  // overlay
  const wrap = document.createElement('div');
  wrap.id = 'difficulty-modal';
  wrap.setAttribute('role','dialog');
  wrap.setAttribute('aria-labelledby','difficulty-title');
  wrap.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,.85);
    display:flex; align-items:center; justify-content:center; z-index: 2000;
  `;

  // card
  const card = document.createElement('div');
  card.style.cssText = `
    background:#222; border:3px solid #ffcc00; color:#fff; width:min(92%,560px);
    border-radius:12px; padding:20px; text-align:center; box-shadow:0 12px 24px rgba(0,0,0,.5);
  `;
  card.innerHTML = `
    <h2 id="difficulty-title" style="margin:0 0 10px; color:#ffcc00;">Choose Difficulty</h2>
    <p style="margin:0 0 16px; color:#ddd;">You can change this on your next run.</p>
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px;">
      <button data-key="easy"   style="padding:14px; border-radius:10px; border:2px solid #2ecc71; background:rgba(46,204,113,.15); color:#2ecc71; cursor:pointer; font-weight:700;">Easy</button>
      <button data-key="medium" style="padding:14px; border-radius:10px; border:2px solid #ffcc00; background:rgba(255,204,0,.15); color:#ffcc00; cursor:pointer; font-weight:700;">Medium</button>
      <button data-key="hard"   style="padding:14px; border-radius:10px; border:2px solid #e74c3c; background:rgba(231,76,60,.15); color:#e74c3c; cursor:pointer; font-weight:700;">Hard</button>
    </div>
  `;
  wrap.appendChild(card);
  document.body.appendChild(wrap);

  card.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      const sel = DIFFICULTY[key] || DIFFICULTY.medium;
      localStorage.setItem('difficulty', JSON.stringify(sel));
      document.body.removeChild(wrap);
      onPick(sel);
    });
  });
}
// === end difficulty popup ===


// (REPLACE your old start click handler with this)
startBtn.addEventListener('click', () => {
  const playerName = document.getElementById('playerName').value.trim();
  if (!playerName) { alert("Please enter your hero's name first!"); return; }
  if (!selectedCharacter) { alert("Please select a character before starting the quest!"); return; }

  // Stash player first
  localStorage.setItem('playerData', JSON.stringify({ name: playerName, character: selectedCharacter }));
// Set player's portrait from selected character
const playerPortraitEl = document.getElementById('player-portrait');
if (playerPortraitEl) {
  const portrait = character?.image || character?.portrait || 'assets/images/characters/default.png';
  playerPortraitEl.src = portrait;
  playerPortraitEl.alt = character?.name ? `${character.name} portrait` : 'Selected character';
}

// Show mode name inside the circle
const modeEl = document.getElementById('mode-display');
if (modeEl && typeof difficulty?.label === 'string') {
  modeEl.textContent = difficulty.label;  // "Easy" | "Medium" | "Hard"
}

  // Ask for difficulty BEFORE any story beat
  showDifficultyModal(() => {
    // After pick, proceed to the pre-game story (as before)
    showStory('postSelect', { name: playerName, character: selectedCharacter });
  });
});

});