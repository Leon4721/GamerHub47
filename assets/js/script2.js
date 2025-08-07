// selection.js
// Handles character selection and starting the game
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
      <button class="select-btn">SELECT</button>
    `;
    characterList.appendChild(card);

    card.addEventListener('click', () => {
      document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedCharacter = char;
      startBtn.disabled = false;
    });
  });

  startBtn.addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value.trim();
    if (!playerName) {
      alert("Please enter your hero's name first!");
      return;
    }
    if (!selectedCharacter) {
      alert("Please select a character before starting the quest!");
      return;
    }
    localStorage.setItem('playerData', JSON.stringify({ name: playerName, character: selectedCharacter }));
    window.location.href = 'game.html';
  });
});
