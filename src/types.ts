export type ButterflyType = 'monarch' | 'swallowtail' | 'blue-morpho' | 'painted-lady' | 'zebra-longwing' | 'copper' | 'admiral' | 'peacock';

export interface Target {
  id: string;
  type: ButterflyType;
  current: number;
  max: 5;
}

export interface Tube {
  id: string;
  butterflies: ButterflyType[];
  max: 10;
}

export interface PowerUps {
  hammer: number;
  wand: number;
  shuffle: number;
  extraSlot: number;
}

export interface GameState {
  level: number;
  lives: number;
  maxLives: 5;
  lastLifeLoss: number | null;
  unlimitedLivesUntil: number | null;
  streak: number;
  levelStartTime: number;
  powerups: PowerUps;
  
  targets: Target[];
  upcomingTargets: ButterflyType[];
  mechanismQueue: ButterflyType[];
  maxMechanismCapacity: number;
  tubes: Tube[];
  
  status: 'home' | 'playing' | 'won' | 'lost' | 'impossible_reward';
}
