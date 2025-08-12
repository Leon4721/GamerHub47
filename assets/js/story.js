// story.js
// Central place for all story beats (images + text + buttons)
function getHighScores() {
  try { return JSON.parse(localStorage.getItem('rpgHighScores')) || []; }
  catch { return []; }
}

function renderHighScoreTable() {
  const rows = getHighScores().map((r, i) => `
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
    </tr>`).join('');

  return `
  <div class="hs-wrap">
    <h4>Top 5 High Scores</h4>
    <table class="hs-table">
      <thead>
        <tr><th>#</th><th>Name</th><th>Score</th><th>Streak</th><th>Rounds</th><th>Lvl</th><th>Path</th><th>Result</th><th>Date</th></tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="9">No scores yet</td></tr>'}</tbody>
    </table>
  </div>`;
}

function formatRunText(r) {
  return [
    'RPG Memory Battle — Result',
    `Player: ${r.name} (${r.character})`,
    `Outcome: ${r.outcome.toUpperCase()}`,
    `Score: ${r.score} | Best Streak: ${r.bestStreak} | Rounds: ${r.rounds}`,
    `Level: ${r.level} | Path: ${r.path || '—'}`,
    `Date: ${r.date}`
  ].join('\n');
}

export const storyBeats = {
  // 1) After character is selected, BEFORE moving to game.html
  postSelect: (ctx) => {
    const { name, character } = ctx;
    const isFemale = character?.name === 'Female';
    const who = isFemale ? 'Arcane Archer' : 'Knight of Valor';

    return {
      image: 'assets/images/intro_trail.png',
      text:
`<strong>${name}</strong>, ${who} of the Silverwood.
At dusk, a rare pact of <em>goblins</em> and <em>orcs</em> ambushed your camp and kidnapped an elvish tribal girl dear to you.
Tracks lead into the old forest where a darker power whispers.

Form your party. Ready your skills. The hunt begins.`,
      buttons: [
        { label: 'Begin Adventure', action: () => { window.location.href = 'game.html'; } }
      ]
    };
  },

  // 2) After Level 2 is completed, BEFORE Level 3 begins
  afterLevel2: {
    image: 'assets/images/after_orcs.png',
    text:
`The orc captain falls. Among his spoils you find sigils not of orcish make—
inked in ash and bone. Rumors whisper of a <strong>dark mage</strong> binding foes to her will.

Ahead lies a ruined watchtower, humming with warded magic.`,
    buttons: [{ label: 'Press On to Level 3', action: () => {} }]
  },

  // 3) After Level 3 is defeated, BEFORE Level 4 begins
  afterLevel3: {
    image: 'assets/images/mage_revealed.png',
    text:
`The Dark Mage crumples, but laughs with cracked lips:
“Puppets dancing on a dragon’s breath… seek the <strong>Obsidian Spire</strong> if you dare.” 
The path forks—sigils hint at guarded gates and hidden catacombs.`,
    buttons: [{ label: 'Approach the Spire', action: () => {} }]
  },

  // 4) After Level 4 is defeated, BEFORE Level 5 begins
  afterLevel4: {
    image: 'assets/images/spire_gates.png',
    text:
`The Skeleton Knight shatters. In the quiet that follows, the Spire’s gates awaken.
Choose your advance: break the wards by force, or slip beneath through the catacombs?`,
    buttons: [
      { label: '⚔️ Break the wards (assault)', action: (ctx) => ctx?.setPath?.('assault') },
      { label: '🕯️ The catacombs (stealth)', action: (ctx) => ctx?.setPath?.('stealth') }
    ]
  },

  // 5) Half-health events (separate for player and monster)
  halfPlayer: (ctx) => ({
    image: 'assets/images/low_player.png',
    text:
`Wounded, your vision narrows. ${ctx.name}, steady your breath.
Remember: <em>Healer</em> restores HP (Female from start; both from Level 3+). 
Stay sharp—your foe will falter if your memory holds.`,
    buttons: [{ label: 'I will endure', action: () => {} }]
  }),

  halfMonster: (ctx) => ({
    image: 'assets/images/low_monster.png',
    text:
`Your enemy staggers—half beaten! Keep your pattern true. 
Strike clean to finish the job before it regains its footing.`,
    buttons: [{ label: 'Finish this', action: () => {} }]
  }),

  // 6) Game ending beats
  victory: (ctx) => ({
    image: 'assets/images/dragon_defeated.png',
    text:
`With a final echo, the Dragon falls. Shackles of shadow crumble.
The kidnapped elf is freed—her eyes bright with thanks.
Your party stands beneath a calm sky. For now.

Score: <strong>${ctx.score}</strong> • Rounds survived: <strong>${ctx.rounds}</strong>
A new tale waits beyond the horizon…`,
    buttons: [
      { label: 'Play Again', action: () => { window.location.reload(); } },
      { label: 'Back to Title', action: () => { window.location.href = 'index.html'; } }
    ]
  }),

  defeat: (ctx) => ({
    image: 'assets/images/defeat.png',
    text:
`Your strength fades and darkness closes in.
The foe remains—waiting for your return.

Score: <strong>${ctx.score}</strong> • Rounds survived: <strong>${ctx.rounds}</strong>`,
    buttons: [
      { label: 'Retry Level', action: () => { ctx?.retry?.(); } },
      { label: 'Back to Title', action: () => { window.location.href = 'index.html'; } }
    ]
  })
};
