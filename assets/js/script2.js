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
  startBtn.addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) { alert("Please enter your hero's name first!"); return; }
    if (!selectedCharacter) { alert("Please select a character before starting the quest!"); return; }

    // Stash data first so the story beat can read context if needed later
    localStorage.setItem('playerData', JSON.stringify({ name: playerName, character: selectedCharacter }));

    // Show the illustrated story pop-up before moving to game.html
    showStory('postSelect', { name: playerName, character: selectedCharacter });
  });
});
