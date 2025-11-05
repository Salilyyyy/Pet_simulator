export interface PetStats {
  hunger: number;
  happiness: number;
  health: number;
  energy: number;
}

export interface PetVariant {
  size: number;
  colorHue: number;
  personality: number;
  specialTrait: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  claimed: boolean;
  condition: (pet: Pet) => boolean;
  reward?: {
    coins?: number;
    exp?: number;
  };
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  effect: Partial<PetStats>;
  icon: string;
}

export interface MiniGame {
  id: string;
  name: string;
  description: string;
  cost: number;
  reward: {
    exp: number;
    coins: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface PetTypeData {
  name: string;
  emoji: string;
  personality: string;
  hungerDecay: number;
  happinessDecay: number;
  energyDecay: number;
  playBonus: number;
  feedBonus: number;
  sleepBonus: number;
  expMultiplier: number;
  baseExpReward: number;
  messages: {
    feed: string[];
    play: string[];
    clean: string[];
    sleep: string[];
    heal: string[];
  };
}

export interface PetCustomization {
  accessory: string | null; // hat, bow, glasses, etc.
  color: string; // primary color
  pattern: string | null; // stripes, spots, etc.
  size: number; // scale multiplier
}

export interface Pet {
  name: string;
  petType: string;
  typeData: PetTypeData;
  variant: PetVariant;
  customization: PetCustomization;
  level: number;
  experience: number;
  coins: number;
  achievements: Record<string, { unlocked: boolean; claimed: boolean }>;
  lastUpdate: number;
  stats: PetStats;
}

export interface GameState {
  currentPet: Pet | null;
  currentScreen: 'selection' | 'game';
  activeTab: 'home' | 'minigames' | 'shop' | 'achievements';
  message: string;
  isLoading: boolean;
}

export type PetType = 'cat' | 'dog' | 'rabbit' | 'bird' | 'fish' | 'dragon';
