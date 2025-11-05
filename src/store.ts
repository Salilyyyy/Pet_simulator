import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Pet, GameState, PetType, PetVariant } from './types';
import { PET_TYPES, ACHIEVEMENTS } from './constants';

interface GameStore extends GameState {
  // Actions
  setCurrentScreen: (screen: 'selection' | 'game') => void;
  setActiveTab: (tab: 'home' | 'minigames' | 'shop' | 'achievements') => void;
  setMessage: (message: string) => void;
  setLoading: (loading: boolean) => void;

  // Pet management
  createPet: (petType: PetType, name?: string) => void;
  changePet: (petType: PetType) => void;
  switchToPetSelection: () => void;
  updatePet: () => void;
  checkAchievementsOnly: () => void;

  // Pet actions
  feedPet: (cost?: number) => void;
  playWithPet: (cost?: number) => void;
  cleanPet: (cost?: number) => void;
  sleepPet: () => void;
  healPet: (cost?: number) => void;

  // Shop and mini-games
  buyItem: (itemId: string) => boolean;
  playMiniGame: (gameId: string) => boolean;
  completeMiniGame: (gameId: string, score: number, moves: number) => void;

  // Utility
  generateVariant: () => PetVariant;
  getExpForNextLevel: (level: number) => number;
  addExperience: (amount: number) => void;
  levelUp: () => void;
  checkAchievements: () => void;
  saveGame: () => void;
  loadGame: () => void;
}

const generateVariant = (): PetVariant => ({
  size: 0.8 + Math.random() * 0.4,
  colorHue: Math.random() * 360,
  personality: Math.random(),
  specialTrait: Math.floor(Math.random() * 3)
});

const getExpForNextLevel = (_level: number): number => 100;

const createPet = (petType: PetType, name: string = ''): Pet => {
  const typeData = PET_TYPES[petType];
  const now = Date.now();

  return {
    name: name || typeData.name,
    petType,
    typeData,
    variant: generateVariant(),
    customization: {
      accessory: null,
      color: '#FFD700', // Default gold color
      pattern: null,
      size: 1.0
    },
    level: 1,
    experience: 0,
    coins: 100,
    achievements: Object.keys(ACHIEVEMENTS).reduce((acc, key) => ({
      ...acc,
      [key]: { unlocked: false, claimed: false }
    }), {}),
    lastUpdate: now,
    stats: {
      hunger: 100,
      happiness: 100,
      health: 100,
      energy: 100
    }
  };
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPet: null,
      currentScreen: 'selection',
      activeTab: 'home',
      message: 'Welcome to Modern Pet Simulator!',
      isLoading: false,

      // Actions
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setMessage: (message) => set({ message }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Pet management
      createPet: (petType, name) => {
        const newPet = createPet(petType, name);
        set({
          currentPet: newPet,
          currentScreen: 'game',
          message: `Welcome to your ${newPet.name}! Take good care of your companion.`
        });
        // Check achievements for new pet
        get().checkAchievements();
      },

      changePet: (petType) => {
        const newPet = createPet(petType);
        set({
          currentPet: newPet,
          message: `You've adopted a new ${newPet.name}!`
        });
      },

      switchToPetSelection: () => {
        set({
          currentScreen: 'selection',
          message: 'Choose a new pet companion!'
        });
      },

      updatePet: () => {
        const { currentPet, setMessage, switchToPetSelection } = get();
        if (!currentPet) return;

        // Simple decay: stats decrease slowly every 5 seconds
        const updatedStats = {
          hunger: Math.max(0, currentPet.stats.hunger - 1),
          happiness: Math.max(0, currentPet.stats.happiness - 1),
          energy: Math.max(0, currentPet.stats.energy - 1),
          health: currentPet.stats.health
        };

        // Health is affected by hunger and happiness
        if (updatedStats.hunger < 20 || updatedStats.happiness < 20) {
          updatedStats.health = Math.max(0, updatedStats.health - 1);
        } else if (updatedStats.hunger > 80 && updatedStats.happiness > 80) {
          updatedStats.health = Math.min(100, updatedStats.health + 0.5);
        }

        // Check if pet has died (all stats at 0)
        if (updatedStats.hunger === 0 && updatedStats.happiness === 0 && updatedStats.health === 0 && updatedStats.energy === 0) {
          setMessage(`💔 Oh no! ${currentPet.name} has passed away from neglect. Please choose a new pet companion.`);
          // Switch to pet selection screen after a short delay
          setTimeout(() => {
            switchToPetSelection();
          }, 3000);
          return; // Don't update stats for dead pet
        }

        // Ensure customization exists (migration for existing pets)
        const customization = currentPet.customization || {
          accessory: null,
          color: '#FFD700',
          pattern: null,
          size: 1.0
        };

        set({
          currentPet: {
            ...currentPet,
            stats: updatedStats,
            customization,
            lastUpdate: Date.now()
          }
        });

        get().checkAchievements();
      },

      checkAchievementsOnly: () => {
        get().checkAchievements();
      },

      // Pet actions
      feedPet: (cost = 5) => {
        const { currentPet, setMessage } = get();
        if (!currentPet) return;

        if (currentPet.coins < cost) {
          setMessage("Not enough coins! 💰");
          return;
        }

        if (currentPet.stats.energy > 10) {
          const updatedPet = {
            ...currentPet,
            coins: currentPet.coins - cost,
            stats: {
              ...currentPet.stats,
              hunger: Math.min(100, currentPet.stats.hunger + currentPet.typeData.feedBonus),
              energy: Math.max(0, currentPet.stats.energy - 5)
            }
          };

          set({ currentPet: updatedPet });
          get().addExperience(5);

          const messages = currentPet.typeData.messages.feed;
          setMessage(messages[Math.floor(Math.random() * messages.length)]);
        } else {
          setMessage("Your pet is too tired to eat right now.");
        }
      },

      playWithPet: (cost = 10) => {
        const { currentPet, setMessage } = get();
        if (!currentPet) return;

        if (currentPet.coins < cost) {
          setMessage("Not enough coins! 💰");
          return;
        }

        if (currentPet.stats.energy > 20) {
          const updatedPet = {
            ...currentPet,
            coins: currentPet.coins - cost,
            stats: {
              ...currentPet.stats,
              happiness: Math.min(100, currentPet.stats.happiness + currentPet.typeData.playBonus),
              energy: Math.max(0, currentPet.stats.energy - 15),
              hunger: Math.max(0, currentPet.stats.hunger - 5)
            }
          };

          set({ currentPet: updatedPet });
          get().addExperience(5);

          const messages = currentPet.typeData.messages.play;
          setMessage(messages[Math.floor(Math.random() * messages.length)]);
        } else {
          setMessage("Your pet is too tired to play.");
        }
      },

      cleanPet: (cost = 8) => {
        const { currentPet, setMessage } = get();
        if (!currentPet) return;

        if (currentPet.coins < cost) {
          setMessage("Not enough coins! 💰");
          return;
        }

        const updatedPet = {
          ...currentPet,
          coins: currentPet.coins - cost,
          stats: {
            ...currentPet.stats,
            health: Math.min(100, currentPet.stats.health + 10),
            happiness: Math.min(100, currentPet.stats.happiness + 5)
          }
        };

        set({ currentPet: updatedPet });
        get().addExperience(5);

        const messages = currentPet.typeData.messages.clean;
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
      },

      sleepPet: () => {
        const { currentPet, setMessage } = get();
        if (!currentPet) return;

        const updatedPet = {
          ...currentPet,
          stats: {
            ...currentPet.stats,
            energy: Math.min(100, currentPet.stats.energy + currentPet.typeData.sleepBonus),
            hunger: Math.max(0, currentPet.stats.hunger - 10)
          }
        };

        set({ currentPet: updatedPet });
        get().addExperience(5);

        const messages = currentPet.typeData.messages.sleep;
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
      },

      healPet: (cost = 15) => {
        const { currentPet, setMessage } = get();
        if (!currentPet) return;

        if (currentPet.coins < cost) {
          setMessage("Not enough coins! 💰");
          return;
        }

        const updatedPet = {
          ...currentPet,
          coins: currentPet.coins - cost,
          stats: {
            ...currentPet.stats,
            health: Math.min(100, currentPet.stats.health + 30)
          }
        };

        set({ currentPet: updatedPet });
        get().addExperience(5);

        const messages = currentPet.typeData.messages.heal;
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
      },

      // Shop and mini-games
      buyItem: (_itemId) => {
        const { currentPet, setMessage } = get();
        if (!currentPet) return false;

        // This would be implemented with SHOP_ITEMS
        setMessage("Shop functionality coming soon!");
        return false;
      },

      playMiniGame: (gameId) => {
        const { currentPet, setMessage } = get();
        if (!currentPet) return false;

        // Check if player has enough coins
        let gameCost = 20; // Default cost
        if (gameId === 'pikachu-match') gameCost = 15;
        if (gameId === 'snake-game') gameCost = 15;
        if (gameId === 'feeding-frenzy') gameCost = 25;
        if (gameId === 'catch-game') gameCost = 20;

        if (currentPet.coins < gameCost) {
          setMessage("Not enough coins! 💰");
          return false;
        }

        // Deduct coins
        set({
          currentPet: {
            ...currentPet,
            coins: currentPet.coins - gameCost
          }
        });

        setMessage(`🎮 Starting ${gameId} mini-game!`);
        return true;
      },

      completeMiniGame: (gameId, score, _moves) => {
        const { currentPet, setMessage } = get();
        if (!currentPet) return;

        // Calculate rewards based on game type and performance
        let baseReward = 20; // Default reward
        if (gameId === 'pikachu-match') baseReward = 25;
        if (gameId === 'snake-game') baseReward = 20;
        if (gameId === 'feeding-frenzy') baseReward = 30;
        if (gameId === 'catch-game') baseReward = 25;

        const performanceBonus = Math.floor(score / 10); // Bonus based on score
        const totalCoins = baseReward + performanceBonus;
        const expReward = Math.floor(score / 5) + 5;

        const updatedPet = {
          ...currentPet,
          coins: currentPet.coins + totalCoins
        };

        set({ currentPet: updatedPet });
        get().addExperience(expReward);

        setMessage(`🎉 Mini-game completed! +${expReward} EXP, +${totalCoins} coins!`);
      },

      // Utility functions
      generateVariant,
      getExpForNextLevel,

      addExperience: (amount) => {
        const { currentPet } = get();
        if (!currentPet) return;

        // For standard actions (5 XP), don't apply multiplier to ensure consistent rewards
        const multiplier = amount === 5 ? 1 : currentPet.typeData.expMultiplier;
        const newExp = currentPet.experience + amount * multiplier;
        const expNeeded = getExpForNextLevel(currentPet.level);

        if (newExp >= expNeeded) {
          get().levelUp();
        } else {
          set({
            currentPet: {
              ...currentPet,
              experience: newExp
            }
          });
        }
      },

      levelUp: () => {
        const { currentPet, setMessage } = get();
        if (!currentPet) return;

        const newLevel = currentPet.level + 1;
        const bonusCoins = newLevel * 10;

        const updatedPet = {
          ...currentPet,
          level: newLevel,
          experience: 0,
          coins: currentPet.coins + bonusCoins,
          stats: {
            hunger: Math.min(100, currentPet.stats.hunger + 10),
            happiness: Math.min(100, currentPet.stats.happiness + 10),
            health: Math.min(100, currentPet.stats.health + 10),
            energy: Math.min(100, currentPet.stats.energy + 10)
          }
        };

        set({
          currentPet: updatedPet
        });

        setMessage(`🎉 Level up! Your ${currentPet.typeData.name} is now level ${newLevel}!`);
        get().checkAchievements();
      },

      checkAchievements: () => {
        const { currentPet, setMessage } = get();
        if (!currentPet) return;

        const achievements = currentPet.achievements;
        let newAchievements: Array<{name: string, icon: string, coins: number}> = [];
        let totalCoinsReward = 0;

        // Check each achievement
        Object.entries(ACHIEVEMENTS).forEach(([key, achievement]) => {
          // Skip if already unlocked
          if (achievements[key]?.unlocked) return;

          // Check if condition is met
          if (achievement.condition(currentPet)) {
            // Mark as unlocked and claimed
            achievements[key] = { unlocked: true, claimed: true };

            // Add to rewards
            const coinsReward = achievement.reward?.coins || 0;
            totalCoinsReward += coinsReward;

            // Track for notification
            newAchievements.push({
              name: achievement.name,
              icon: achievement.icon,
              coins: coinsReward
            });
          }
        });

        // Apply rewards if any achievements were unlocked
        if (newAchievements.length > 0) {
          const updatedPet = {
            ...currentPet,
            achievements: { ...achievements },
            coins: currentPet.coins + totalCoinsReward
          };

          set({ currentPet: updatedPet });

          // Show notification for each achievement
          newAchievements.forEach(achievement => {
            const rewardText = achievement.coins > 0 ? ` (+${achievement.coins}🪙)` : '';
            setMessage(`${achievement.icon} ${achievement.name}${rewardText}!`);
          });
        }
      },

      saveGame: () => {
        // Zustand persist middleware handles this automatically
      },

      loadGame: () => {
        // Zustand persist middleware handles this automatically
      }
    }),
    {
      name: 'pet-simulator-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentPet: state.currentPet,
        currentScreen: state.currentScreen,
        activeTab: state.activeTab
      })
    }
  )
);
