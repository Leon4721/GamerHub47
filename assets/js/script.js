  // Game state
        let sequence = [];
        let playerSequence = [];
        let round = 0;
        let score = 0;
        let playerHealth = 100;
        let monsterHealth = 100;
        let level = 1;
        let gameStarted = false;

        // DOM elements
        const buttons = document.querySelectorAll('.game-button');
        const feedback = document.getElementById('feedback');
        const monsterName = document.getElementById('monster-name');
        const monsterLevel = document.getElementById('monster-level');
        const monsterDisplay = document.querySelector('.monster-display');
        const playerHPBar = document.getElementById('player-health');
        const monsterHPBar = document.getElementById('monster-health');
        const playerHealthValue = document.getElementById('player-health-value');
        const monsterHealthValue = document.getElementById('monster-health-value');
        const roundDisplay = document.getElementById('round-display');
        const scoreDisplay = document.getElementById('score-display');
        const levelDisplay = document.getElementById('level-display');
        const startBtn = document.getElementById('start-btn');
        const redoBtn = document.getElementById('redo-btn');

        // Monster data with increasing difficulty and unique images
        const monsters = [
            { 
                name: "Goblin", 
                level: 1, 
                image: "assets/images/goblin.png",
                speed: 800,
                health: 100
            },
            { 
                name: "Orc", 
                level: 2, 
                image: "assets/images/orc.png",
                speed: 700,
                health: 120
            },
            { 
                name: "Dark Mage", 
                level: 3, 
                image: "assets/images/darkmage.png", .
                
                speed: 600,
                health: 150
            },
            { 
                name: "Skeleton King", 
                level: 4, 
                image: "assets/images/skight.png",
                speed: 500,
                health: 200
            },
            { 
                name: "Dragon", 
                level: 5, 
                image:"assets/images/dragon.png",
                speed: 400,
                health: 250
            }
        ];

        // Create monster card element
        function createMonsterCard(monster) {
            const card = document.createElement('div');
            card.className = 'monster-card appear';
            card.style.backgroundImage = `url(${monster.image})`;
            card.style.display = 'block';
            return card;
        }

        // Initialize game
        function initGame() {
            sequence = [];
            playerSequence = [];
            round = 0;
            score = 0;
            playerHealth = 100;
            level = 1;
            
            // Set first monster
            setMonster(level - 1);
            updateDisplays();
            
            feedback.textContent = "Press Start Battle to begin your adventure!";
            gameStarted = false;
        }

        // Set monster based on level
        function setMonster(index) {
            const monster = monsters[index];
            monsterName.textContent = monster.name;
            monsterLevel.textContent = monster.level;
            monsterHealth = monster.health;
            levelDisplay.textContent = monster.level;
            
            // Clear previous card and create new one
            monsterDisplay.innerHTML = '';
            const card = createMonsterCard(monster);
            monsterDisplay.appendChild(card);
        }

        // Update all displays
        function updateDisplays() {
            playerHPBar.style.width = playerHealth + "%";
            monsterHPBar.style.width = (monsterHealth / monsters[level-1].health * 100) + "%";
            playerHealthValue.textContent = playerHealth + "%";
            monsterHealthValue.textContent = Math.round((monsterHealth / monsters[level-1].health) * 100) + "%";
            roundDisplay.textContent = round;
            scoreDisplay.textContent = score;
            levelDisplay.textContent = level;
        }

        // Start battle
        function startBattle() {
            if (gameStarted) return;
            
            gameStarted = true;
            feedback.textContent = "Battle begins! Defeat the Goblin!";
            
            setTimeout(() => {
                nextRound();
            }, 1500);
        }

        // Replay sequence
        function replaySequence() {
            if (gameStarted && sequence.length > 0) {
                feedback.textContent = "Replaying the pattern...";
                showSequence();
            }
        }

        // Move to next round
        function nextRound() {
            if (!gameStarted) return;
            
            playerSequence = [];
            round++;
            roundDisplay.textContent = round;
            
            // Add a new attack to the sequence
            sequence.push(nextAttack());
            
            feedback.textContent = `Memorize the attack pattern! Round ${round}`;
            showSequence();
        }

        // Generate random attack
        function nextAttack() {
            const choices = ['archer', 'mage', 'warrior', 'healer'];
            return choices[Math.floor(Math.random() * choices.length)];
        }

        // Show sequence to player
        function showSequence() {
            const monster = monsters[level-1];
            let delay = 600;
            
            sequence.forEach((cls, index) => {
                setTimeout(() => {
                    highlightButton(cls);
                    
                    // Add sound effect based on attack type
                    const sound = new Audio();
                    sound.volume = 0.3;
                    
                    switch(cls) {
                        case 'archer': sound.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAAAAA='; break;
                        case 'mage': sound.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAAAAA='; break;
                        case 'warrior': sound.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAAAAA='; break;
                        case 'healer': sound.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAAAAA='; break;
                    }
                    
                    sound.play().catch(e => console.log("Audio play error:", e));
                    
                }, delay * (index + 1));
            });
            
            // After sequence, allow player input
            setTimeout(() => {
                if (gameStarted) {
                    feedback.textContent = "Your turn! Repeat the pattern.";
                }
            }, delay * (sequence.length + 1));
        }

        // Highlight button
        function highlightButton(cls) {
            const btn = document.getElementById(cls);
            btn.classList.add('active');
            
            setTimeout(() => {
                btn.classList.remove('active');
            }, 400);
        }

        // Handle player input
        function handlePlayerInput(cls) {
            if (!gameStarted) return;
            
            playerSequence.push(cls);
            highlightButton(cls);
            
            // Check if input is correct
            if (!checkPlayerInput()) {
                // Player made a mistake
                const damage = 10 + (level * 2); // Damage increases with level
                playerHealth -= damage;
                updateDisplays();
                
                feedback.textContent = `❌ Wrong move! ${monsters[level-1].name} hits you for ${damage} damage!`;
                
                if (playerHealth <= 0) {
                    playerHealth = 0;
                    gameStarted = false;
                    feedback.textContent = "💀 You were defeated! Game over.";
                    return;
                }
                
                // After a delay, restart the round
                setTimeout(() => {
                    playerSequence = [];
                    feedback.textContent = "Try again...";
                    showSequence();
                }, 2000);
                
                return;
            }
            
            // Check if sequence is complete
            if (playerSequence.length === sequence.length) {
                // Successful sequence
                let healAmount = 0;
                let damageAmount = 0;
                
                // Calculate damage and healing
                sequence.forEach(attack => {
                    if (attack === 'healer') {
                        healAmount += 10 + (level * 2); // Healing increases with level
                    } else {
                        damageAmount += 10 + (level * 2); // Damage increases with level
                    }
                });
                
                // Apply healing (capped at 100)
                playerHealth = Math.min(playerHealth + healAmount, 100);
                
                // Apply damage to monster
                monsterHealth -= damageAmount;
                score += damageAmount;
                
                // Update displays
                updateDisplays();
                
                if (monsterHealth <= 0) {
                    // Monster defeated
                    monsterHealth = 0;
                    
                    // Play defeat animation
                    const card = document.querySelector('.monster-card');
                    card.classList.remove('appear');
                    card.classList.add('defeat');
                    
                    feedback.textContent = `🏆 ${monsters[level-1].name} defeated!`;
                    score += 100 * level; // Bonus for defeating monster
                    
                    // Advance to next level
                    setTimeout(() => {
                        if (level < monsters.length) {
                            level++;
                            setMonster(level - 1);
                            playerHealth = 100; // Full health for next battle
                            sequence = [];
                            round = 0;
                            updateDisplays();
                            
                            feedback.textContent = `Advanced to level ${level}! Facing ${monsters[level-1].name}!`;
                            
                            // Start next battle after delay
                            setTimeout(() => {
                                nextRound();
                            }, 2500);
                        } else {
                            // Game completed
                            gameStarted = false;
                            feedback.textContent = "🎉 CONGRATULATIONS! You defeated all monsters and won the game!";
                        }
                    }, 2000);
                } else {
                    // Continue to next round
                    let message = "✅ Perfect! ";
                    
                    if (healAmount > 0) {
                        message += `You healed ${healAmount} HP. `;
                    }
                    
                    message += `You dealt ${damageAmount} damage!`;
                    feedback.textContent = message;
                    
                    setTimeout(() => {
                        nextRound();
                    }, 1500);
                }
            }
        }

        // Check player input
        function checkPlayerInput() {
            const index = playerSequence.length - 1;
            return playerSequence[index] === sequence[index];
        }

        // Event listeners
        startBtn.addEventListener('click', startBattle);
        redoBtn.addEventListener('click', replaySequence);
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => handlePlayerInput(btn.id));
        });
        
        document.addEventListener('keydown', (e) => {
            if (!gameStarted) return;
            if (e.key === '1') handlePlayerInput('archer');
            if (e.key === '2') handlePlayerInput('mage');
            if (e.key === '3') handlePlayerInput('warrior');
            if (e.key === '4') handlePlayerInput('healer');
        });

        // Initialize the game
        initGame();
