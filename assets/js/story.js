export const storyBeats = {
  postSelect: {
    image: 'assets/images/arthiel_intro.png',
    text: `You are Arathiel Moonpiercer, High Warrior of the Silverwood Elves and bearer of the mystic Spear of Lúthien.
Last dusk, orc raiders under Gharazak’s banner stole your betrothed, Elenion.
Now, every thrust of your spear must bring her back.`,
    buttons: [{ label: 'Begin Adventure', action: () => {} }]
  },
  level3: {
    image: 'assets/images/malzor_reveal.png',
    text: `Behind the orc warband’s savage raids lies a darker hand...`,
    buttons: [{ label: 'Continue', action: () => {} }]
  },
  level4: {
    image: 'assets/images/obsidian_spire.png',
    text: `Malzor’s wards block your path. Do you…`,
    buttons: [
      { label: 'Shatter the wards', action: () => {} },
      { label: 'Sneak the catacombs', action: () => {} }
    ]
  },
  level5: (ctx) => {
    const base = ctx.path === 'assault'
      ? "You burst into Malzor’s inner sanctum..."
      : "In the ossuary beneath the spire...";
    const outcome = ctx.performance === 'high'
      ? "Your blade hums with Elven light..."
      : "Malzor’s magic splinters your spear...";
    return {
      image: 'assets/images/throne_of_bone.png',
      text: `${base} ${outcome}
Whether victorious or battered, you know the Dragon’s shadow stirs.`,
      buttons: [{ label: 'To Glory', action: () => {} }]
    };
  }
};
