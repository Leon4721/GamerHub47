# Project two  

# Rythm and Sigil RPG | Memory Battle Game  

(Developer: Leon Freeman)  

![screenshot](docs/amr.png)  

[Live Webpage](https://leon4721.github.io/GamerHub47/)  

---

## Table of Contents  

1. [Project Goals](#project-goals)  
   1. [User Goals](#user-goals)  
   2. [Site Owner Goals](#site-owner-goals)  
2. [User Experience](#user-experience)  
   1. [Target Audience](#target-audience)  
   2. [User Requirements & Expectations](#user-requirements--expectations)  
   3. [User Stories](#user-stories)  
3. [Design](#design)  
   1. [Colour Scheme](#colour-scheme)  
   2. [Fonts](#fonts)  
   3. [Structure](#structure)  
   4. [Wireframes](#wireframes)  
4. [Technologies Used](#technologies-used)  
   1. [Languages](#languages)  
   2. [Frameworks, Libraries & Tools](#frameworks-libraries--tools)  
5. [Features](#features)  
6. [Validation](#validation)  
   1. [HTML Validation](#html-validation)  
   2. [CSS Validation](#css-validation)  
   3. [JavaScript Validation](#javascript-validation)  
   4. [Accessibility](#accessibility)  
   5. [Performance](#performance)  
7. [Testing](#testing)  
   1. [Device Testing](#device-testing)  
   2. [Browser Compatibility](#browser-compatibility)  
   3. [Testing User Stories](#testing-user-stories)  
8. [Bugs](#bugs)  
9. [Deployment](#deployment)  
10. [Credits](#credits)  
11. [Acknowledgements](#acknowledgements)  

---
### Project Rationale Rhythm & Sigil

Developed by CD Projekt Noir

Introduction

Rhythm & Sigil is an interactive RPG-inspired memory battle game that fuses the mechanics of rhythm and pattern recall with the immersive storytelling of fantasy role-playing games. Drawing creative influence from Baldur’s Gate 3, Skyrim, Elden Ring and RuneScape, the game distills the essence of large-scale RPG combat into a streamlined, accessible browser experience.

The project was conceived as both a creative homage to the RPG genre and a personal exploration of inclusivity within fantasy storytelling. Too often, fantasy worlds underrepresent minority groups or present them in narrow ways. Rhythm & Sigil addresses this gap by featuring a diverse cast of heroes, including strong representation of POC characters, so that players of different cultural backgrounds can see themselves reflected in a genre that has historically lacked this inclusivity.

This approach ensures that the game is not only fun and immersive but also socially meaningful — a reminder that fantasy worlds should be as diverse as the real one.

## Game Lore

At the start of Rhythm & Sigil, the player steps into the role of a chosen hero. As Galihad, the male Knight, your bride-to-be has been stolen by goblin raiders. As Eva, the female Elf warrior, it is your tribal sister who has been taken. What begins as a personal rescue quickly reveals a deeper evil at work.

- The goblins are not acting alone—they serve a cunning Dark Mage, whose forbidden sorcery binds both goblins and orcs to her will. Each battle draws you closer to her fortress, where illusions and traps mask the true scale of her corruption. What feels like a rescue mission becomes a desperate fight against spreading darkness.

- From facing endless waves of goblins, to dueling orc warlords, the journey culminates in a confrontation with the dreaded Skeleton Knight, a fallen champion reanimated by necromancy. Defeating him reveals the Mage’s ultimate weapon—an ancient dragon, a living force of elemental fire and destruction.

- This unfolding narrative transforms a simple quest of love and loyalty into a true RPG epic, where the player discovers that every choice carries weight, every victory uncovers hidden truths, and only courage can overcome the rising tide of shadow.

## Project Goals  

The goal of "R & S" (Rhythm & Sigil) is to build a **fantasy-themed memory game** that is:  
- Engaging, story-driven, and visually immersive.  
- Accessible and responsive across modern devices.  
- Educational in the sense of memory training, while entertaining through story driven battles.  

### User Goals  
- Play a quick and fun RPG game with clear rules.  
- Progress through multiple levels and monsters.  
- Choose a hero and difficulty level.  
- Track personal high scores across play sessions.  
- Access the game on desktop, tablet, and mobile.  

### Site Owner Goals  
- Demonstrate strong web development skills (HTML, CSS, JS modules).  
- Deliver a professional, polished, and accessible product.  
- Ensure replay value through **branching storylines** and difficulty modes.  
- Provide direct contact and feedback opportunities.  
- Offer a 404 page for broken links to maintain user flow.  

---

## User Experience  

### Target Audience  
- Casual players who enjoy **quick browser games**.  
- Fans of **fantasy RPGs** and storytelling.  
- Players who enjoy **pattern recognition and memory challenges**.  
- Students or educators looking for a **fun brain-training activity**.  

### User Requirements & Expectations  
- Rules explained quickly and clearly.  
- Smooth, responsive experience across devices.  
- Clear feedback on actions (damage, healing, defeat, victory).  
- Accessibility via both **mouse click and keyboard controls**.  
- Options for replaying and difficulty choice.  

### User Stories  

#### Site User  
- I want to choose a hero and difficulty mode before starting.  
- I want to understand how to play using a help modal.  
- I want clear health bars and scores so I can track progress.  
- I want immersive story cutscenes to feel invested.  
- I want my high scores saved so I can try to beat them.    
- I want to play on mobile, tablet, and desktop.  
- I want to contact the developer for support or feedback.  

#### Site Owner  
- I want players to find the game easy to learn but challenging to master.  
- I want to provide an engaging narrative to enhance replayability.  
- I want all code validated and error-free.  
- I want to demonstrate accessibility and performance best practice.  
- I want a 404 error page instead of browser default.  

---

## Design  

### Colour Scheme  
We chose a dark-fantasy base with gold accents because it echoes classic RPG visual language: torchlit dungeons, treasure glint, “legendary” rarity frames. Green for player HP and red/orange for enemy damage mirrors D&D, Diablo, Baldur’s Gate, and MMO HUDs. Blue (arcane/mage), purple (archer/BeastMastery), red (warrior/strength), and Green (healer/druid) map to long-standing class color conventions, so actions are instantly readable—even for players coming from rhythm/improv memory games like Simon. High-contrast grey highlights call out each pattern without confusion. The palette also meets accessibility needs (contrast and label redundancy), keeping the screen legible on small devices while preserving an RPG atmosphere.

The Color Pallet used was made on [adobe.com](https://color.adobe.com/create/color-wheel/)
<img src=/docs/cwheel.jpeg></details>

- **Dark fantasy palette** with gold highlights.  
- Player HP: green gradient.  
- Monster HP: red/orange gradient.  
- Modal backgrounds: semi-transparent black for immersion.  
- Accent gold (#ffcc00) for buttons and key highlights.  

### Fonts  
- `Segoe UI` for clean readability.  
- Bold headings with fantasy feel using strong shadows.  

### Structure  
The website consists of 4 main pages:  
1. **Index Page** – Character selection and difficulty modal.  
2. **Game Page** – Main battle screen, help modal, and story modal.  
3. **Contact Page** – Feedback form with validation.  
4. **404 Page** – Fantasy-themed error page with return link.
  
The site is organised so players can learn fast and move smoothly between key views. Core UI patterns (title area, HUD, action strip, floating help/contact) remain consistent to reduce cognitive load.

Screens & overlays included:

Title / Character Select
Players enter a hero name, browse character cards, and start their journey. The page also exposes quick audio controls and a floating contact link. A shared Story overlay can appear here after selection to set the scene.

Main Battle
The playfield displays a compact HUD with Level/Mode (circular badge) plus Round/Score, flanked by matching Player and Monster frames with semantic health bars. Primary controls (Start Battle and Replay Pattern) sit above a 2×2 action grid (Archer/Mage/Warrior/Healer) with printed key hints (1–4). A floating “?” opens the How-to-Play dialog; Story scenes can also overlay between levels. A persistent Contact button is available.

How-to-Play (modal overlay)
Available on the battle screen via the “?” button, this modal explains the sequence/response loop, keyboard controls, healing rules, and tips. It supports Esc to close, backdrop click, and focus return for accessibility.

Story (modal overlay)
Narrative cards (image, text, choice buttons) punctuate progression—after levels, at forks, on victory/defeat—and are shared between the title and game pages for consistency.

Contact
A dedicated page provides a styled form with client validation, a honeypot field, polite status updates, a confirm/error modal, and a smart Return action (back or home). EmailJS integration is wired for sending.

404 Error Page
A themed not-found screen keeps players inside the experience and offers a clear route back to the Home page. 

Shared elements across screens:

Top audio controls for SFX and music (toggle states, visible slash when music is off).

Responsive container sizing and aspect-ratio cards to keep all critical UI on-screen on mobile without scrolling.

This structure keeps navigation predictable: players start at Character Select, battle through the Main screen with help/story overlays as needed, reach out via Contact if required, and land on a friendly 404 if they stray.

### Wireframes  
Wireframes were produced in **Balsamiq** for:  PC , Ipad Pro , and Iphone SE

- <details><summary>Index / Character Selection</summary>
<img src=/docs/wireframes/index.html.png>
</details>

- <details><summary>Game</summary>
<img src=/docs/wireframes/game.html.png>
</details>

- <details><summary>Difficulty settings</summary>
<img src=/docs/wireframes/setting.png>
</details>

- <details><summary>Story Pop-Ups</summary>
<img src=/docs/wireframes/story_pop.png>
</details>

- <details><summary>Contact Us</summary>
<img src=/docs/wireframes/contact.png></details>

- <details><summary>How to Play</summary>
<img src=/docs/wireframes/htplay.png></details>

  
---

## Technologies Used

### Languages & Core APIs
- **HTML5** — semantic structure, modal markup, forms.
- **CSS3** — responsive layout (Flexbox/Grid), media queries, transitions.
- **JavaScript (ES6+)** — game logic, event handling, DOM updates.
- **Web Storage (localStorage)** — persist name, character, audio/music, first-visit flag.
- **HTML5 Audio API** — sound effects/music playback and toggles.

### Libraries & Services
- **EmailJS** — client-side email delivery for the Contact form (with success/fail handling).
- **Font Awesome (CDN)** — iconography (e.g., help “?” icon, UI controls).

### Tooling & Hosting
- **Git + GitHub** — version control and collaboration.
- **GitHub Pages** — static site hosting and deployment.
- **Chrome DevTools** — performance/viewport testing and debugging.

### Accessibility & Quality
- **ARIA attributes & keyboard support** — accessible toggles, focus states, and modal behavior.
- **WCAG-aligned color semantics** — HP/status bars with meaningful colors.
- **Validation & Testing** — HTML/CSS validation and cross-device/browser checks.

### Assets
- **Raster images (PNG/JPG) & SVG** — portraits, UI icons, and decorative graphics.


### Frameworks, Libraries & Tools  
- [Am I Responsive](http://ami.responsivedesign.is/) was used to create the multi-device mock-up you can see at the start of this README.md file.
- [Balsamiq](https://balsamiq.com/) to create the wireframes for the project
- [Bootstrap v5.1.3](https://getbootstrap.com/)
- [EmailJS](https://www.emailjs.com) used to send email from the contact form
- [Favicon.io](https://favicon.io) for making the site favicon
- [Font Awesome](https://fontawesome.com/) - Icons from Font Awesome were used throughout the site
- [Git](https://git-scm.com/) was used for version control within VSCode to push the code to GitHub
- [GitHub](https://github.com/) was used as a remote repository to store project code
- [Google Fonts](https://fonts.google.com/)
- [adobe](https://color.adobe.com/create/color-wheel) was used to for color wheels and design. 
- [Chrome dev tools](https://developers.google.com/web/tools/chrome-devtools) were used for debugging of the code and check site for responsiveness
- [WC3 Validator](https://validator.w3.org/), [Jigsaw W3 Validator](https://jigsaw.w3.org/css-validator/), [JShint](https://jshint.com/), [Wave Validator](https://wave.webaim.org/), [Lighthouse](https://developers.google.com/web/tools/lighthouse/) and [Am I Responsive](http://ami.responsivedesign.is/) were all used to validate the website


---

## Features  

- **Name Entry & Character Selection**  
  Players begin by entering their name and choosing a hero.   

- <details><summary>Character Selection</summary>
<img src="/docs/features/name.png ">
</details>
---

- **Difficulty Modes**  
  Three levels of challenge are available:  
  - **Easy**: A gentle introduction with slower sequences for first-time players.  
  - **Medium**: Faster pace with longer memory chains, adding pressure.  
  - **Hard**: Demands precision and endurance, with rapid cues and complex patterns.  
  Each round escalates in difficulty, creating an RPG-style sense of progression.  
  
- <details><summary>Difficulty Modes</summary>
<img src="/docs/features/diffi.png ">
</details>
---

- **Controls**  
  Two core controls guide the flow of the game:  
  - *Start Battle* begins each new sequence.  
  - *Replay Pattern* allows the user to replay the current sequence before attempting it.  
  These controls make the game accessible, especially for beginners learning the rhythm.  

   
- <details><summary>Game Controls</summary>
<img src="/docs/features/buttons.png">
</details>
---

- **Four Actions**  
  The game uses four RPG-inspired actions: **Archer, Mage, Warrior, and Healer**.  
  - Each action has a large touch button, designed for mobile and tablet players.  
  - Keyboard shortcuts (**1–4**) mirror the actions, ensuring cross-platform accessibility.  

- <details><summary>Action Buttons</summary>
<img src="/docs/features/triggers.png">
</details>
---

- **Highlight on Cues**  
  Visual highlights appear on action buttons when a cue is triggered. Repeated cues are handled clearly, ensuring no ambiguity when buttons repeat in a sequence. This enhances fairness and user confidence during gameplay.  

  ![Cue Highlights](docs/features/cues.png)  
- <details><summary>Cue Highlights</summary>
<img src="/docs/features/glow2.png">
</details>
<img src="/docs/features/glow.png">
</details>

---

- **HUD (Heads-Up Display)**  
  The HUD displays essential game information:  
  - Current **Level/Mode**  
  - **Round number**  
  - **Score tracker**  
  - **Hero and Enemy HP bars**, with semantic colors (green = healthy, yellow = warning, red = critical)  
  This ensures players always know their status at a glance.  

  ![Game HUD](docs/features/hud.png)  
- <details><summary>Game HUD</summary>
<img src="/docs/features/scores.png">
</details>
<img src="/docs/features/hbars.png">
</details>
---

- **How-to-Play Modal**  
  A tutorial modal explains the rules and controls:  
  - Opens automatically on the first visit.  
  - Accessible anytime via the “?” button.  
  - Provides clear, step-by-step instructions with visual cues.  
  This ensures the game is beginner-friendly while supporting replayability.  

- <details><summary>How to Play</summary>
<img src="/docs/features/how1.png">
</details>
<img src="/docs/features/how2.png">
</details>
---

- **Audio & Music Toggles**  
  Players can toggle **Sound Effects** and **Background Music** independently.  
  - Icon states change to show whether audio is on or off.  
  - Preferences are saved in **localStorage**, so settings persist between sessions.  
  This gives users control over immersion without disrupting gameplay.  
 
- <details><summary>Audio Toggles</summary>
<img src="/docs/features/musoff.png">
</details>
<img src="/docs/features/muson.png>
</details>
---

- **Contact Page**  
  A fully styled form lets players send feedback or queries.  
  - Fields for **name, email, and message**.  
  - Integrated with **EmailJS** for message delivery.  
  - Displays **submission confirmation**, reassuring players their message was sent.  
  Designed to be responsive and accessible.  

- <details><summary>Contact Page</summary>
<img src="/docs/features/mail.png">
</details>
<img src="/docs/features/mail2.png">
</details>
---

- **Custom 404 Page**  
  An RPG-themed error page keeps immersion intact if users reach a non-existent link.  
  - Features fantasy artwork (hero vs dragon).  
  - Provides a **clear route back to the Home page**.  
  This prevents confusion and ensures users remain within the RPG experience.  

- <details><summary>404</summary>
<img src="/docs/features/404.png">
</details>

---

- **Cheat Code**  
  A hidden cheat code (`/Elias`) allows level skipping.  
  - Implemented as a developer testing tool.  
  - Useful for quickly checking later story cutscenes and difficulty progression.  
  While not part of normal gameplay, it demonstrates robust debugging and testing support.  



---

## Validation  

### HTML Validation  
- All pages validated with W3C Markup Validation Service.  
- No errors on custom code; minor warnings only from third-party CDNs.  
<details>
  <summary>Index</summary>
  <img src="docs/validation/html/index.html.png">
</details>

<details>
  <summary>Game</summary>
  <img src="docs/validation/html/game.html.png">
</details>

<details>
  <summary>Contact</summary>
  <img src="docs/validation/html/contact.html .png">
</details> 

<details>
  <summary>404</summary>
  <img src="docs/validation/html/404.html.png">
</details>


### CSS Validation  
- Passed W3C Jigsaw CSS Validator.  
- Only warnings related to vendor prefixes.  

<details>
  <summary>Style</summary>
  <img src="docs/validation/css/style.css.png">
</details>

<details>
  <summary>Style 2</summary>
  <img src="docs/validation/css/Style2.css.png">
</details>

<details>
  <summary>Help</summary>
  <img src="docs/validation/css/help.css.pngg">
</details>

<details>
  <summary>Fit</summary>
  <img src="docs/validation/css/fit.css.png">
</details>


### JavaScript Validation  
- Scripts tested with **JSHint**.  
- No major issues found

<details>
  <summary>audio</summary>
  <img src="docs/validation/js/audio.png>
</details>

<details>
  <summary>contatc.js</summary>
  <img src="docs/validation/js/contact.png">
</details>

<details>
  <summary>errors.js</summary>
  <img src="docs/validation/js/errors.png">
</details>

<details>
  <summary>fit.js</summary>
  <img src="docs/validation/js/fit.png">
</details>

<details>
  <summary>help.js</summary>
  <img src="docs/validation/js/help.png>
</details>

<details>
  <summary>script.js</summary>
  <img src="docs/validation/js/Script.js.png">
</details>

<details>
  <summary>script2.js</summary>
  <img src="docs/validation/js/script2.png">
</details>

<details>
  <summary>story.js</summary>
  <img src="docs/validation/js/story.png">
</details>

<details>
  <summary>ui.js</summary>
  <img src="docs/validation/js/ui.png">
</details>

<details>
  <summary>audio-hooks.js</summary>
  <img src="docs/validation/js/audiohooks.png">
</details>

<details>
  <summary>a11y.js</summary>
  <img src="docs/validation/js/a11y.png">
</details>


### Accessibility  
- Tested with WAVE → 0 errors.  
- Modals close on Escape and trap focus correctly.  
- Keyboard shortcuts (1–4) for accessibility.  

<details>
  <summary>Index</summary>
  <img src="docs/validation/wave/index.png">
</details>

<details>
  <summary>Game</summary>
  <img src="docs/validation/wave/game.png">
</details>

<details>
  <summary>Contact</summary>
  <img src="docs/validation/wave/contact.png">
</details>

<details>
  <summary>404</summary>
  <img src="docs/validation/wave/404.png">
</details>

### Performance  
- Lighthouse tested.  
  
  <details>
  <summary>Index</summary>
  <img src="docs/validation/lighthouse/index.png">
</details>

  <details>
  <summary>Game</summary>
  <img src="docs/validation/lighthouse/game.png">
</details>

  <details>
  <summary>Contact</summary>
  <img src="docs/validation/lighthouse/contact.png">
</details

  <details>
  <summary>404</summary>
  <img src="docs/validation/lighthouse/404.png">
</details>
---

## Testing  

### Device Testing  
Tested using Chrome DevTools and real devices:  
- iPhone SE, iPhone 15, Samsung Galaxy S21, iPad Pro.  
- Windows 10 (Chrome/Edge/Firefox).  
- MacBook Air (Safari).  

### Browser Compatibility  
- Google Chrome ✔  
- Mozilla Firefox ✔  
- Microsoft Edge ✔  
- Safari ✔  

## Testing User Stories

### Site User

| User Story | Feature | Action | Expected Result | Actual Result | Screenshot |  
|------------|---------|--------|----------------|---------------|------------|  
| Understand rules | Help Modal | Click `?` button | Instructions popup appears | Works |<img src="docs/user-Story-testing/htoplay.png"> |  
| Choose hero | Character Select | Click card | Character highlighted | Works | <img src="docs/user-Story-testing/cselectiion.png"> |  
| Choose difficulty | Difficulty Select | Pick Easy/Normal/Hard | Mode is highlighted and stored | Works | <img src="docs/user-Story-testing/diff.png"> |  
| Track progress | HUD (HP bars, Score, Level) | Start a battle | HP bars update; score & round increment | Works |<img src="docs/user-Story-testing/scoretrack.png">|  
| Feel invested | Story Cutscenes | Reach story milestone | Narrative modal with text & image appears | Works | <img src="docs/user-Story-testing/story.png">|   
| Retry level | Defeat popup | Click `Retry` | Restart same level | Works | <img src="docs/user-Story-testing/retry.png"> |  
| Mobile friendly | Responsive Layout | Open on phone/tablet/desktop | Layout adapts, touch targets usable | Works |<img src="docs/user-Story-testing/cselectiion.png"> |  
| Contact developer | Contact Form (EmailJS) | Submit form | Confirmation shown & email sent | work| <img src="docs/user-Story-testing/msgsent.png"> |  
| Audio control | Audio & Music Toggles | Toggle icons | States persist, ARIA updated | Works | <img src="docs/user-Story-testing/audiom.png">|  
| Custom 404 | `/404.html` | Visit invalid route | Branded 404 page with link home | Works | <img src="docs/user-Story-testing/404.png">|
| Replay pattern | Controls | Click `Replay Pattern` | Pattern replays correctly | Works | <img src="docs/user-Story-testing/repeat.png"> |    



---

## 🐞 Bugs & Fixes  

| Bug | Fix |  
|-----|-----|  
| **Help.js loaded twice in `game.html`** | Removed duplicate `<script>` tag |  
| **Player portrait alt text missing** | Added dynamic `alt` attribute populated with hero name |  
| **Contact return button failed when opened directly** | Implemented fallback redirect to `index.html` |  
| **Scaling issue on iPhone SE** | Added `fit.js` auto-scaler for responsive resizing |  
| **Monster images not displaying on certain levels** | Corrected file path typo in monster image references |  


## Deployment  

### GitHub Pages  

The website was deployed using **GitHub Pages** by following these steps:  

1. In the GitHub repository, navigate to the **Settings** tab.  
2. In the left-hand menu, select **Pages**.  
3. Under *Source*, select **Branch: main**.  
4. Once saved, GitHub will refresh and the live site will be published from the repository.  
5. The link to the live site will appear:  
👉 [Live Site – Rhythm & Sigil RPG](https://leon4721.github.io/GamerHub47/)  

---

### Forking the GitHub Repository  

1. Navigate to the repository on GitHub.  
2. In the top-right corner, click the **Fork** button.  
3. This creates a copy of the repository under your own GitHub account for experimentation or contribution.  

---

### Making a Local Clone  

1. Navigate to the repository on GitHub.  
2. Click the green **Code** button above the file list.  
3. Copy the URL provided under **HTTPS**.  
4. Open Git Bash and change the current working directory to the location where you want the clone.  
5. Type git clone and paste the URL from the clipboard ($ git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY)
6. Press Enter to create your local clone
# Credits  

### Images & Assets  
- Character portraits created/edited by **Leon Freeman** using a mix of AI generation and open-license sources.  
- Background images sourced from **Unsplash** and edited for a fantasy aesthetic.  
- Fantasy icons & HUD elements from **Font Awesome**.  
- Dragon, Skeleton Knight and Orc artwork adapted from royalty-free fantasy stock and modified to match the project’s visual theme.  

### Code  
- Modal accessibility structure adapted from **Bootstrap v5.1.3** documentation.  
- Email integration guided by **EmailJS official docs & template editor**.  
- Game loop and memory-sequence logic inspired by classic *Simon* game logic but rebuilt for RPG immersion.  
- CSS gradient buttons and text-shadow styles inspired by resources on **w3schools** and **CSS Gradient Generator**.  
- Debugging support from **Chrome DevTools**, **JSHint**, and **WC3 Validators**.  

### Tools  
- **Balsamiq** – wireframing.  
- **Favicon.io** – for favicon creation.  
- **Remove.bg** – background cleanup for character art.  
- **Am I Responsive** – multi-device preview mockups.  
- **Adobe Color** – palette refinement.  

---

## Acknowledgements  

- Huge thanks to **Code Institute** for the project framework and grading rubrics that guided the scope of development.  
- Gratitude to **family & friends** who tested the game on phones and tablets, providing valuable feedback on scaling, responsiveness, and play balance.  
- Appreciation to the online **RPG communities** (Reddit, Discord servers) who inspired narrative direction and inclusivity focus.  
- Special credit to my partner **Candice** for testing, creative brainstorming, and encouragement throughout the project.  