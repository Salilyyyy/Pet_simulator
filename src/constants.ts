import { PetTypeData, ShopItem, MiniGame, Achievement } from './types';

export const PET_TYPES: Record<string, PetTypeData> = {
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

export const SHOP_ITEMS: Record<string, ShopItem> = {
  'premium-food': {
    id: 'premium-food',
    name: 'Premium Food',
    description: 'Restores 50 hunger',
    price: 25,
    effect: { hunger: 50 },
    icon: '🍗'
  },
  'toy-ball': {
    id: 'toy-ball',
    name: 'Toy Ball',
    description: 'Boosts happiness by 40',
    price: 30,
    effect: { happiness: 40 },
    icon: '⚽'
  },
  'medicine': {
    id: 'medicine',
    name: 'Super Medicine',
    description: 'Restores 60 health',
    price: 40,
    effect: { health: 60 },
    icon: '💊'
  },
  'energy-drink': {
    id: 'energy-drink',
    name: 'Energy Drink',
    description: 'Restores 70 energy',
    price: 35,
    effect: { energy: 70 },
    icon: '⚡'
  }
};

export const MINI_GAMES: Record<string, MiniGame> = {
  catch: {
    id: 'catch',
    name: 'Catch Game',
    description: 'Test your pet\'s reflexes!',
    cost: 20,
    reward: { exp: 15, coins: 10 },
    difficulty: 'easy'
  },
  memory: {
    id: 'memory',
    name: 'Memory Game',
    description: 'Match the patterns!',
    cost: 15,
    reward: { exp: 12, coins: 8 },
    difficulty: 'medium'
  },
  feeding: {
    id: 'feeding',
    name: 'Feeding Frenzy',
    description: 'Catch falling food!',
    cost: 25,
    reward: { exp: 20, coins: 15 },
    difficulty: 'hard'
  }
};

export const ACHIEVEMENTS: Record<string, Achievement> = {
  'first-pet': {
    id: 'first-pet',
    name: 'First Pet',
    description: 'Get your first pet companion',
    icon: '🎉',
    unlocked: false,
    claimed: false,
    condition: (_pet) => true,
    reward: { coins: 50 }
  },
  'level-5': {
    id: 'level-5',
    name: 'Level Master',
    description: 'Reach level 5',
    icon: '⭐',
    unlocked: false,
    claimed: false,
    condition: (pet) => pet.level >= 5,
    reward: { coins: 100 }
  },
  'level-10': {
    id: 'level-10',
    name: 'Pet Champion',
    description: 'Reach level 10',
    icon: '🏆',
    unlocked: false,
    claimed: false,
    condition: (pet) => pet.level >= 10,
    reward: { coins: 200 }
  },
  'level-15': {
    id: 'level-15',
    name: 'Pet Legend',
    description: 'Reach level 15',
    icon: '👑',
    unlocked: false,
    claimed: false,
    condition: (pet) => pet.level >= 15,
    reward: { coins: 300 }
  },
  'level-20': {
    id: 'level-20',
    name: 'Pet Supreme',
    description: 'Reach level 20',
    icon: '🌟',
    unlocked: false,
    claimed: false,
    condition: (pet) => pet.level >= 20,
    reward: { coins: 500 }
  },
  'perfect-pet': {
    id: 'perfect-pet',
    name: 'Perfect Care',
    description: 'Keep all stats above 90%',
    icon: '💎',
    unlocked: false,
    claimed: false,
    condition: (pet) => pet.stats.hunger >= 90 && pet.stats.happiness >= 90 && pet.stats.health >= 90 && pet.stats.energy >= 90,
    reward: { coins: 200 }
  },
  'wealthy-owner': {
    id: 'wealthy-owner',
    name: 'Wealthy Owner',
    description: 'Accumulate 1000 coins',
    icon: '💰',
    unlocked: false,
    claimed: false,
    condition: (pet) => pet.coins >= 1000,
    reward: { coins: 100 }
  },
  'experienced-pet': {
    id: 'experienced-pet',
    name: 'Experienced Pet',
    description: 'Earn 5000 total XP',
    icon: '🎓',
    unlocked: false,
    claimed: false,
    condition: (pet) => (pet.level - 1) * 100 + pet.experience >= 5000,
    reward: { coins: 150 }
  }
};
