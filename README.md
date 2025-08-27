# Project RPG | Memory Battle Game  

(Developer: Leon Freeman)  

![screenshot](docs/screenshots/game-preview.png)  

[Live Webpage](https://leon4721.github.io/Project-RPG/)  

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

## Project Goals  

The goal of Project RPG is to build a **fantasy-themed memory game** that is:  
- Engaging, story-driven, and visually immersive.  
- Accessible and responsive across all modern devices.  
- Educational in the sense of memory training, while entertaining through RPG battles.  

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
- I want to retry a level if I fail without starting over.  
- I want to play on mobile, tablet, and desktop without losing usability.  
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

### Wireframes  
Wireframes were produced in **Balsamiq** for:  
- <details><summary>Index</summary>
<img src=/docs/wireframes/index.html.png>
</details>

- <details><summary>Game</summary>
<img src=/docs/wireframes/game.html.png>
</details>

- <details><summary>Difficulty settings</summary>
<img src=/docs/wireframes/setting.png>
</details>

- <details><summary>Story Pop Ups</summary>
<img src=/docs/wireframes/story_pop.png>
</details>

- <details><summary>Contact Us</summary>
<img src=/docs/wireframes/contact.png></details>



  
---

## Technologies Used  

### Languages  
- HTML5  
- CSS3  
- JavaScript ES6  

### Frameworks, Libraries & Tools  
- Font Awesome (icons).  
- Git & GitHub for version control and hosting.  
- GitHub Pages for deployment.  
- Lighthouse, WAVE, W3C Validators for validation.  
- Balsamiq for wireframes.  
- Remove.bg for image adjustments.  

---

## Features  

- **Character Selection** (Knight or Archer with stats).  
- **Difficulty Modes**: Easy, Medium, Hard.  
- **Monster Battles**: Goblin → Orc → Dark Mage → Skeleton Knight → Dragon.  
- **Story Cutscenes** between levels (branching after Lv4).  
- **Replay Pattern Button** for accessibility.  
- **High Score Persistence** via localStorage.  
- **Help Modal (“?”)** with instructions.  
- **Contact Page** with feedback form.  
- **404 Page** with themed dragon image.  
- **Cheat Code** (`/Elias`) to skip levels (developer testing tool).  

---

## Validation  

### HTML Validation  
- All pages validated with W3C Markup Validation Service.  
- No errors on custom code; minor warnings only from third-party CDNs.  

### CSS Validation  
- Passed W3C Jigsaw CSS Validator.  
- Only warnings related to vendor prefixes.  

### JavaScript Validation  
- Scripts tested with **JSHint**.  
- No major issues found; code uses ES6 modules cleanly.  

### Accessibility  
- Tested with WAVE → 0 errors.  
- Modals close on Escape and trap focus correctly.  
- Keyboard shortcuts (1–4) for accessibility.  

### Performance  
- Lighthouse tested.  
- Game loads quickly due to lightweight assets.  
- Scores: Performance 95+, Accessibility 100, Best Practices 100.  

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

### Testing User Stories  
| User Story | Feature | Action | Expected Result | Actual Result | Screenshot |  
|------------|---------|--------|----------------|---------------|------------|  
| Understand rules | Help Modal | Click `?` button | Instructions popup appears | Works | ![](docs/testing/help.png) |  
| Choose hero | Character Select | Click card | Character highlighted | Works | ![](docs/testing/select.png) |  
| Save score | localStorage | Finish game | Score saved to table | Works | ![](docs/testing/scores.png) |  
| Retry level | Defeat popup | Click “Retry” | Restart same level | Works | ![](docs/testing/retry.png) |  

---

## Bugs  

| Bug | Fix |  
|-----|-----|  
| Help.js loaded twice in `game.html` | Removed duplicate `<script>` tag |  
| Player portrait alt text missing | Added dynamic alt with hero name |  
| Contact return button failed when opened directly | Added fallback to `index.html` |  
| Scaling issue on iPhone SE | Added `fit.js` auto-scaler |  
| Monster images not displaying on certain levels | Corrected typo in image path |  

---

## Deployment  

### GitHub Pages  
The project was deployed via GitHub Pages:  
1. Go to repository → Settings → Pages.  
2. Select branch `main`.  
3. Site published at: [Project RPG Live](https://leon4721.github.io/Project-RPG/).  

### Forking Repository  
1. Navigate to repo → click **Fork**.  
2. Mak
