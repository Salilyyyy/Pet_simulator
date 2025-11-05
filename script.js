// Pet type configurations with enhanced features
const PET_TYPES = {
    cat: {
        name: 'Cat',
        emoji: '🐱',
        personality: 'Independent and playful',
        hungerDecay: 2.5,
        happinessDecay: 1.2,
        energyDecay: 0.6,
        playBonus: 20,
        feedBonus: 25,
        sleepBonus: 35,
        expMultiplier: 1.0,
        baseExpReward: 5,
        messages: {
            feed: ['Purr... that was delicious!', 'Nom nom nom!', 'Your cat enjoyed the meal!'],
            play: ['Your cat chased the toy!', 'Meow! Time to play!', 'Your cat is having fun!'],
            clean: ['Your cat looks spotless!', 'Purr... feels so clean!', 'Your cat appreciates the grooming!'],
            sleep: ['Your cat curled up and slept peacefully.', 'Zzz... sweet dreams!', 'Your cat had a nice nap!'],
            heal: ['Your cat feels much better!', 'Meow... all healed up!', 'Your cat is back to health!']
        }
    },
    dog: {
        name: 'Dog',
        emoji: '🐶',
        personality: 'Loyal and energetic',
        hungerDecay: 3,
        happinessDecay: 1.5,
        energyDecay: 0.8,
        playBonus: 30,
        feedBonus: 35,
        sleepBonus: 45,
        expMultiplier: 1.1,
        baseExpReward: 6,
        messages: {
            feed: ['Woof! That was tasty!', 'Your dog devoured the food!', 'Yummy! Your dog is happy!'],
            play: ['Your dog fetched the ball!', 'Wag wag! Play time!', 'Your dog is so excited!'],
            clean: ['Your dog smells fresh!', 'Good boy/girl! All clean!', 'Your dog looks shiny!'],
            sleep: ['Your dog slept like a puppy.', 'Zzz... dog dreams!', 'Your dog had a great rest!'],
            heal: ['Your dog is feeling better!', 'Woof! All better now!', 'Your dog is healthy again!']
        }
    },
    rabbit: {
        name: 'Rabbit',
        emoji: '🐰',
        personality: 'Cute and shy',
        hungerDecay: 2,
        happinessDecay: 0.8,
        energyDecay: 0.4,
        playBonus: 15,
        feedBonus: 20,
        sleepBonus: 30,
        expMultiplier: 0.9,
        baseExpReward: 4,
        messages: {
            feed: ['Your rabbit nibbled happily!', 'Nom nom... carrots!', 'Your rabbit enjoyed the greens!'],
            play: ['Your rabbit hopped around!', 'Twitch twitch! Play time!', 'Your rabbit is having fun!'],
            clean: ['Your rabbit looks fluffy!', 'So soft and clean!', 'Your rabbit feels cozy!'],
            sleep: ['Your rabbit slept in its burrow.', 'Zzz... bunny dreams!', 'Your rabbit had a peaceful nap!'],
            heal: ['Your rabbit feels much better!', 'All healed and hopping!', 'Your rabbit is healthy!']
        }
    },
    bird: {
        name: 'Bird',
        emoji: '🐦',
        personality: 'Free-spirited and cheerful',
        hungerDecay: 1.5,
        happinessDecay: 0.7,
        energyDecay: 0.3,
        playBonus: 25,
        feedBonus: 15,
        sleepBonus: 25,
        expMultiplier: 1.2,
        baseExpReward: 7,
        messages: {
            feed: ['Chirp! Seeds are delicious!', 'Your bird pecked at the food!', 'Yummy seeds!'],
            play: ['Your bird flew around!', 'Tweet tweet! Play time!', 'Your bird is soaring!'],
            clean: ['Your bird\'s feathers shine!', 'Pretty and clean!', 'Your bird looks magnificent!'],
            sleep: ['Your bird slept on its perch.', 'Zzz... bird dreams!', 'Your bird had a restful sleep!'],
            heal: ['Your bird feels much better!', 'Chirp! All better!', 'Your bird is healthy again!']
        }
    },
    fish: {
        name: 'Fish',
        emoji: '🐠',
        personality: 'Calm and graceful',
        hungerDecay: 1,
        happinessDecay: 0.5,
        energyDecay: 0.2,
        playBonus: 10,
        feedBonus: 10,
        sleepBonus: 20,
        expMultiplier: 0.8,
        baseExpReward: 3,
        messages: {
            feed: ['Your fish ate the flakes!', 'Swim swim... yummy!', 'Your fish is satisfied!'],
            play: ['Your fish swam happily!', 'Bubble bubble!', 'Your fish enjoyed the swim!'],
            clean: ['Your fish\'s tank is sparkling!', 'Clean and clear!', 'Your fish feels refreshed!'],
            sleep: ['Your fish rested peacefully.', 'Zzz... underwater dreams!', 'Your fish had a calm rest!'],
            heal: ['Your fish feels much better!', 'Swim swim! All better!', 'Your fish is healthy!']
        }
    },
    dragon: {
        name: 'Dragon',
        emoji: '🐉',
        personality: 'Mystical and powerful',
        hungerDecay: 4,
        happinessDecay: 2,
        energyDecay: 1,
        playBonus: 40,
        feedBonus: 50,
        sleepBonus: 60,
        expMultiplier: 1.5,
        baseExpReward: 10,
        messages: {
            feed: ['Roar! That was filling!', 'Your dragon devoured the meal!', 'Mighty feast!'],
            play: ['Your dragon breathed fire!', 'Roar! Adventure time!', 'Your dragon soared!'],
            clean: ['Your dragon\'s scales shine!', 'Majestic and clean!', 'Your dragon looks powerful!'],
            sleep: ['Your dragon slept in its lair.', 'Zzz... dragon dreams!', 'Your dragon rested mightily!'],
            heal: ['Your dragon feels much better!', 'Roar! All healed!', 'Your dragon is mighty again!']
        }
    }
};

// Shop items configuration
const SHOP_ITEMS = {
    'premium-food': {
        name: 'Premium Food',
        description: 'Restores 50 hunger',
        price: 25,
        effect: { hunger: 50 },
        icon: '🍗'
    },
    'toy-ball': {
        name: 'Toy Ball',
        description: 'Boosts happiness by 40',
        price: 30,
        effect: { happiness: 40 },
        icon: '⚽'
    },
    'medicine': {
        name: 'Super Medicine',
        description: 'Restores 60 health',
        price: 40,
        effect: { health: 60 },
        icon: '💊'
    },
    'energy-drink': {
        name: 'Energy Drink',
        description: 'Restores 70 energy',
        price: 35,
        effect: { energy: 70 },
        icon: '⚡'
    }
};

// Mini-games configuration
const MINI_GAMES = {
    catch: {
        name: 'Catch Game',
        description: 'Test your pet\'s reflexes!',
        cost: 20,
        reward: { exp: 15, coins: 10 },
        difficulty: 'easy'
    },
    memory: {
        name: 'Memory Game',
        description: 'Match the patterns!',
        cost: 15,
        reward: { exp: 12, coins: 8 },
        difficulty: 'medium'
    },
    feeding: {
        name: 'Feeding Frenzy',
        description: 'Catch falling food!',
        cost: 25,
        reward: { exp: 20, coins: 15 },
        difficulty: 'hard'
    }
};

// Achievements configuration
const ACHIEVEMENTS = {
    'first-pet': {
        name: 'First Pet',
        description: 'Get your first pet companion',
        icon: '🎉',
        condition: (pet) => true, // Always unlocked when pet exists
        reward: { coins: 50 }
    },
    'level-5': {
        name: 'Level Master',
        description: 'Reach level 5',
        icon: '⭐',
        condition: (pet) => pet.level >= 5,
        reward: { coins: 100 }
    },
    'perfect-pet': {
        name: 'Perfect Care',
        description: 'Keep all stats above 90%',
        icon: '💎',
        condition: (pet) => pet.hunger >= 90 && pet.happiness >= 90 && pet.health >= 90 && pet.energy >= 90,
        reward: { coins: 200 }
    }
};

class Pet {
    constructor(petType = 'cat') {
        this.petType = petType;
        this.typeData = PET_TYPES[petType];
        this.hunger = 100;
        this.happiness = 100;
        this.health = 100;
        this.energy = 100;
        this.level = 1;
        this.experience = 0;
        this.coins = 100; // Starting coins
        this.achievements = {};
        this.variant = this.generateVariant();
        this.loadState();
        this.initializeAchievements();
    }

    // Generate AI-like variation for the pet
    generateVariant() {
        return {
            size: 0.8 + Math.random() * 0.4,
            colorHue: Math.random() * 360,
            personality: Math.random(),
            specialTrait: Math.floor(Math.random() * 3)
        };
    }

    // Initialize achievements
    initializeAchievements() {
        Object.keys(ACHIEVEMENTS).forEach(key => {
            if (!this.achievements[key]) {
                this.achievements[key] = { unlocked: false, claimed: false };
            }
        });
    }

    // Calculate experience needed for next level
    getExpForNextLevel() {
        return this.level * 100; // Simple formula: level * 100 exp needed
    }

    // Add experience and handle leveling
    addExperience(amount) {
        this.experience += amount * this.typeData.expMultiplier;
        const expNeeded = this.getExpForNextLevel();

        if (this.experience >= expNeeded) {
            this.levelUp();
        }

        this.updateUI();
    }

    // Level up the pet
    levelUp() {
        this.level++;
        this.experience = 0; // Reset exp for new level
        this.coins += this.level * 10; // Bonus coins for leveling up

        // Boost all stats slightly on level up
        this.hunger = Math.min(100, this.hunger + 10);
        this.happiness = Math.min(100, this.happiness + 10);
        this.health = Math.min(100, this.health + 10);
        this.energy = Math.min(100, this.energy + 10);

        this.showMessage(`🎉 Level up! Your ${this.typeData.name} is now level ${this.level}!`);
        this.createParticles();
        this.checkAchievements();
    }

    // Add coins
    addCoins(amount) {
        this.coins += amount;
        this.updateUI();
    }

    // Spend coins
    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.updateUI();
            return true;
        }
        return false;
    }

    // Update pet stats over time
    update() {
        // Hunger decreases over time (pet-specific rate)
        this.hunger = Math.max(0, this.hunger - this.typeData.hungerDecay);

        // Happiness decreases over time (pet-specific rate)
        this.happiness = Math.max(0, this.happiness - this.typeData.happinessDecay);

        // Energy decreases slowly (pet-specific rate)
        this.energy = Math.max(0, this.energy - this.typeData.energyDecay);

        // Health is affected by hunger and happiness
        if (this.hunger < 20 || this.happiness < 20) {
            this.health = Math.max(0, this.health - 1);
        } else if (this.hunger > 80 && this.happiness > 80) {
            this.health = Math.min(100, this.health + 0.5);
        }

        this.checkAchievements();
        this.saveState();
        this.updateUI();
    }

    // Feed the pet (enhanced with coins and exp)
    feed(cost = 5) {
        if (!this.spendCoins(cost)) {
            this.showMessage("Not enough coins! 💰");
            return;
        }

        if (this.energy > 10) {
            this.hunger = Math.min(100, this.hunger + this.typeData.feedBonus);
            this.energy = Math.max(0, this.energy - 5);
            this.addExperience(this.typeData.baseExpReward);
            const messages = this.typeData.messages.feed;
            this.showMessage(messages[Math.floor(Math.random() * messages.length)]);
            this.createParticles();
        } else {
            this.showMessage("Your pet is too tired to eat right now.");
            this.addCoins(cost); // Refund coins
        }
        this.saveState();
        this.updateUI();
    }

    // Play with the pet (enhanced with coins and exp)
    play(cost = 10) {
        if (!this.spendCoins(cost)) {
            this.showMessage("Not enough coins! 💰");
            return;
        }

        if (this.energy > 20) {
            this.happiness = Math.min(100, this.happiness + this.typeData.playBonus);
            this.energy = Math.max(0, this.energy - 15);
            this.hunger = Math.max(0, this.hunger - 5);
            this.addExperience(this.typeData.baseExpReward + 2);
            const messages = this.typeData.messages.play;
            this.showMessage(messages[Math.floor(Math.random() * messages.length)]);
            this.createParticles();
        } else {
            this.showMessage("Your pet is too tired to play.");
            this.addCoins(cost); // Refund coins
        }
        this.saveState();
        this.updateUI();
    }

    // Clean the pet (enhanced with coins and exp)
    clean(cost = 8) {
        if (!this.spendCoins(cost)) {
            this.showMessage("Not enough coins! 💰");
            return;
        }

        this.health = Math.min(100, this.health + 10);
        this.happiness = Math.min(100, this.happiness + 5);
        this.addExperience(this.typeData.baseExpReward - 1);
        const messages = this.typeData.messages.clean;
        this.showMessage(messages[Math.floor(Math.random() * messages.length)]);
        this.createParticles();
        this.saveState();
        this.updateUI();
    }

    // Put pet to sleep (free action with exp)
    sleep() {
        this.energy = Math.min(100, this.energy + this.typeData.sleepBonus);
        this.hunger = Math.max(0, this.hunger - 10);
        this.addExperience(this.typeData.baseExpReward);
        const messages = this.typeData.messages.sleep;
        this.showMessage(messages[Math.floor(Math.random() * messages.length)]);
        this.createParticles();
        this.saveState();
        this.updateUI();
    }

    // Heal the pet (enhanced with coins and exp)
    heal(cost = 15) {
        if (!this.spendCoins(cost)) {
            this.showMessage("Not enough coins! 💰");
            return;
        }

        this.health = Math.min(100, this.health + 30);
        this.addExperience(this.typeData.baseExpReward + 1);
        const messages = this.typeData.messages.heal;
        this.showMessage(messages[Math.floor(Math.random() * messages.length)]);
        this.createParticles();
        this.saveState();
        this.updateUI();
    }

    // Use shop item
    useShopItem(itemId) {
        const item = SHOP_ITEMS[itemId];
        if (!item) return false;

        if (!this.spendCoins(item.price)) {
            this.showMessage("Not enough coins! 💰");
            return false;
        }

        // Apply item effects
        Object.keys(item.effect).forEach(stat => {
            this[stat] = Math.min(100, this[stat] + item.effect[stat]);
        });

        this.addExperience(5); // Small exp reward for shopping
        this.showMessage(`Used ${item.name}! ${item.description}`);
        this.createParticles();
        this.saveState();
        this.updateUI();
        return true;
    }

    // Play mini-game
    playMiniGame(gameId) {
        const game = MINI_GAMES[gameId];
        if (!game) return false;

        if (!this.spendCoins(game.cost)) {
            this.showMessage("Not enough coins! 💰");
            return false;
        }

        // Simulate mini-game (in a real implementation, this would be actual game logic)
        const success = Math.random() > 0.3; // 70% success rate

        if (success) {
            this.addExperience(game.reward.exp);
            this.addCoins(game.reward.coins);
            this.showMessage(`🎉 Mini-game success! +${game.reward.exp} EXP, +${game.reward.coins} coins!`);
        } else {
            this.showMessage("😅 Mini-game failed! Better luck next time!");
        }

        this.createParticles();
        this.saveState();
        this.updateUI();
        return success;
    }

    // Check and unlock achievements
    checkAchievements() {
        Object.keys(ACHIEVEMENTS).forEach(key => {
            const achievement = ACHIEVEMENTS[key];
            if (!this.achievements[key].unlocked && achievement.condition(this)) {
                this.achievements[key].unlocked = true;
                this.showAchievementUnlocked(key);
            }
        });
    }

    // Show achievement unlocked notification
    showAchievementUnlocked(achievementId) {
        const achievement = ACHIEVEMENTS[achievementId];
        this.showMessage(`🏆 Achievement Unlocked: ${achievement.name}!`);

        // Auto-claim reward
        if (achievement.reward && achievement.reward.coins) {
            this.addCoins(achievement.reward.coins);
            this.achievements[achievementId].claimed = true;
        }

        this.updateAchievementsUI();
    }

    // Create particle effects
    createParticles() {
        const petElement = document.getElementById('pet');
        const particlesContainer = document.querySelector('.pet-particles');

        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            particlesContainer.appendChild(particle);

            setTimeout(() => {
                particle.remove();
            }, 2000);
        }
    }

    // Update the UI to reflect current stats
    updateUI() {
        // Update stat bars
        document.getElementById('hunger-bar').style.width = this.hunger + '%';
        document.getElementById('hunger-value').textContent = Math.round(this.hunger);

        document.getElementById('happiness-bar').style.width = this.happiness + '%';
        document.getElementById('happiness-value').textContent = Math.round(this.happiness);

        document.getElementById('health-bar').style.width = this.health + '%';
        document.getElementById('health-value').textContent = Math.round(this.health);

        document.getElementById('energy-bar').style.width = this.energy + '%';
        document.getElementById('energy-value').textContent = Math.round(this.energy);

        // Update level and coins
        document.getElementById('pet-level').textContent = this.level;
        document.getElementById('coins-value').textContent = this.coins;

        // Update experience bar
        const expNeeded = this.getExpForNextLevel();
        const expPercent = (this.experience / expNeeded) * 100;
        document.getElementById('exp-bar').style.width = expPercent + '%';
        document.getElementById('exp-value').textContent = Math.round(this.experience);

        // Update pet name and emoji
        document.getElementById('pet-name').textContent = this.typeData.name;
        document.getElementById('pet-emoji').textContent = this.typeData.emoji;

        // Update pet mood indicator
        this.updatePetMood();

        // Update pet appearance
        this.updatePetAppearance();

        // Update achievements
        this.updateAchievementsUI();
    }

    // Update pet mood indicator
    updatePetMood() {
        const moodElement = document.getElementById('pet-mood');
        const avgStats = (this.hunger + this.happiness + this.health + this.energy) / 4;

        if (avgStats >= 80) {
            moodElement.textContent = '😊 Happy';
        } else if (avgStats >= 60) {
            moodElement.textContent = '🙂 Content';
        } else if (avgStats >= 40) {
            moodElement.textContent = '😐 Neutral';
        } else if (avgStats >= 20) {
            moodElement.textContent = '😟 Unhappy';
        } else {
            moodElement.textContent = '😢 Sad';
        }
    }

    // Update pet's visual appearance
    updatePetAppearance() {
        const petElement = document.getElementById('pet');
        const mouthElement = document.querySelector('.mouth');

        // Change mouth based on happiness
        if (this.happiness > 70) {
            mouthElement.textContent = '∪'; // Happy
        } else if (this.happiness > 30) {
            mouthElement.textContent = '─'; // Neutral
        } else {
            mouthElement.textContent = '∩'; // Sad
        }

        // Change pet color based on health and level
        let gradient;
        if (this.health < 30) {
            gradient = 'linear-gradient(45deg, #ff6b6b 0%, #4ecdc4 100%)'; // Red to teal
        } else if (this.health < 70) {
            gradient = 'linear-gradient(45deg, #ffd89b 0%, #19547b 100%)'; // Yellow to blue
        } else {
            gradient = 'linear-gradient(45deg, #ffeaa7 0%, #fab1a0 100%)'; // Light colors
        }

        // Add level-based enhancement
        if (this.level >= 5) {
            gradient = gradient.replace('45deg', '45deg, #ffd700 0%, '); // Add gold tint for high level
        }

        petElement.style.background = gradient;
    }

    // Update achievements UI
    updateAchievementsUI() {
        Object.keys(this.achievements).forEach(key => {
            const statusElement = document.getElementById(`${key}-status`);
            if (statusElement) {
                if (this.achievements[key].unlocked) {
                    statusElement.textContent = '✅ Unlocked';
                    statusElement.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
                    statusElement.style.color = 'white';
                } else {
                    statusElement.textContent = '🔒 Locked';
                    statusElement.style.background = 'rgba(0, 0, 0, 0.1)';
                    statusElement.style.color = '#718096';
                }
            }
        });
    }

    // Show message to user
    showMessage(message) {
        const messageElement = document.querySelector('.message-text');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }

    // Save pet state to localStorage
    saveState() {
        const state = {
            petType: this.petType,
            variant: this.variant,
            hunger: this.hunger,
            happiness: this.happiness,
            health: this.health,
            energy: this.energy,
            level: this.level,
            experience: this.experience,
            coins: this.coins,
            achievements: this.achievements,
            lastUpdate: Date.now()
        };
        localStorage.setItem('petState', JSON.stringify(state));
    }

    // Load pet state from localStorage
    loadState() {
        const savedState = localStorage.getItem('petState');
        if (savedState) {
            const state = JSON.parse(savedState);
            const timeDiff = Date.now() - state.lastUpdate;
            const minutesPassed = timeDiff / (1000 * 60);

            // Update pet type if saved
            if (state.petType && PET_TYPES[state.petType]) {
                this.petType = state.petType;
                this.typeData = PET_TYPES[state.petType];
            }

            // Load other properties
            if (state.variant) this.variant = state.variant;
            if (state.level) this.level = state.level;
            if (state.experience) this.experience = state.experience;
            if (state.coins !== undefined) this.coins = state.coins;
            if (state.achievements) this.achievements = state.achievements;

            // Update stats based on time passed
            this.hunger = Math.max(0, (state.hunger || 100) - minutesPassed * this.typeData.hungerDecay);
            this.happiness = Math.max(0, (state.happiness || 100) - minutesPassed * this.typeData.happinessDecay);
            this.energy = Math.max(0, (state.energy || 100) - minutesPassed * this.typeData.energyDecay);

            // Recalculate health
            if (this.hunger < 20 || this.happiness < 20) {
                this.health = Math.max(0, (state.health || 100) - minutesPassed);
            } else {
                this.health = state.health || 100;
            }
        }
    }
}

// Global pet variable
let currentPet = null;

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if pet is already selected
    const savedState = localStorage.getItem('petState');
    if (savedState) {
        const state = JSON.parse(savedState);
        if (state.petType) {
            // Pet already exists, show game screen
            showGameScreen(state.petType);
        } else {
            // No pet selected, show selection screen
            showPetSelection();
        }
    } else {
        // No saved state, show selection screen
        showPetSelection();
    }
});

// Show pet selection screen
function showPetSelection() {
    document.getElementById('pet-selection').classList.remove('hidden');
    document.getElementById('game-screen').classList.add('hidden');

    // Remove existing event listeners to prevent duplicates
    document.querySelectorAll('.pet-option').forEach(option => {
        option.removeEventListener('click', handlePetSelection);
    });

    // Add event listeners for pet selection - go directly to game screen
    document.querySelectorAll('.pet-option').forEach(option => {
        option.addEventListener('click', handlePetSelection);
    });
}

// Handle pet selection
function handlePetSelection(e) {
    e.preventDefault();
    e.stopPropagation();

    const petType = this.getAttribute('data-type');
    if (petType) {
        console.log('Selected pet:', petType); // Debug log
        changePet(petType);
    }
}

// Show game screen with selected pet
function showGameScreen(petType) {
    document.getElementById('pet-selection').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    // Initialize or load pet
    currentPet = new Pet(petType);
    currentPet.updateUI();

    // Set up tab navigation
    setupTabNavigation();

    // Set up action buttons
    setupActionButtons();

    // Set up shop functionality
    setupShop();

    // Set up mini-games
    setupMiniGames();

    // Game loop - update pet every 5 seconds
    setInterval(() => {
        if (currentPet) {
            currentPet.update();
        }
    }, 5000);

    // Show welcome message
    currentPet.showMessage(`Welcome back to your ${currentPet.typeData.name}! Take good care of your companion.`);
}

// Set up tab navigation
function setupTabNavigation() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.currentTarget.getAttribute('data-tab');

            // Remove active class from all tabs
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            e.currentTarget.classList.add('active');

            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            // Show selected tab content
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Set up action buttons
function setupActionButtons() {
    // Basic actions
    document.getElementById('feed-btn').addEventListener('click', () => currentPet.feed(5));
    document.getElementById('play-btn').addEventListener('click', () => currentPet.play(10));
    document.getElementById('clean-btn').addEventListener('click', () => currentPet.clean(8));
    document.getElementById('sleep-btn').addEventListener('click', () => currentPet.sleep());
    document.getElementById('heal-btn').addEventListener('click', () => currentPet.heal(15));

    // Change pet button
    document.getElementById('change-pet-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to change your pet? Your current pet\'s progress will be saved.')) {
            showPetSelection();
        }
    });

    // Customize button (placeholder for future feature)
    document.getElementById('customize-btn').addEventListener('click', () => {
        currentPet.showMessage('Pet customization coming soon! 🎨');
    });
}

// Set up shop functionality
function setupShop() {
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.currentTarget.closest('.shop-item').getAttribute('data-item');
            const success = currentPet.useShopItem(itemId);

            if (success) {
                // Add visual feedback
                e.currentTarget.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    e.currentTarget.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
}

// Set up mini-games
function setupMiniGames() {
    document.querySelectorAll('.play-game-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const gameId = e.currentTarget.getAttribute('data-game');
            const success = currentPet.playMiniGame(gameId);

            if (success) {
                // Add visual feedback
                e.currentTarget.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    e.currentTarget.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
}

// Select a pet type
function selectPet(petType) {
    // Clear any existing pet data for new selection
    const savedState = localStorage.getItem('petState');
    if (savedState) {
        const state = JSON.parse(savedState);
        if (state.petType !== petType) {
            // Different pet type selected, create new pet
            localStorage.removeItem('petState');
        }
    }

    showGameScreen(petType);
}

// Change pet directly to game screen
function changePet(petType) {
    // Clear existing pet data
    localStorage.removeItem('petState');

    // Show game screen with new pet
    showGameScreen(petType);
}

// Add some utility functions for enhanced gameplay
function createFloatingText(text, x, y, color = '#ffd700') {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.style.position = 'fixed';
    floatingText.style.left = x + 'px';
    floatingText.style.top = y + 'px';
    floatingText.style.color = color;
    floatingText.style.fontWeight = 'bold';
    floatingText.style.fontSize = '1.2em';
    floatingText.style.pointerEvents = 'none';
    floatingText.style.zIndex = '1000';
    floatingText.style.animation = 'floatUp 2s ease-out forwards';

    document.body.appendChild(floatingText);

    setTimeout(() => {
        floatingText.remove();
    }, 2000);
}

// Add CSS animation for floating text
const style = document.createElement('style');
style.textContent = `
@keyframes floatUp {
    0% {
        transform: translateY(0px);
        opacity: 1;
    }
    100% {
        transform: translateY(-50px);
        opacity: 0;
    }
}
`;
document.head.appendChild(style);
