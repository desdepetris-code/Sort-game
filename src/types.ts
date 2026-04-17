export type BallType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'cyan' | 'pink' | 'white' | 'black';

export interface Target {
  id: string;
  type: BallType;
  current: number;
  max: 5;
}

export interface Tube {
  id: string;
  balls: BallType[];
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
  upcomingTargets: BallType[];
  mechanismQueue: BallType[];
  maxMechanismCapacity: number;
  tubes: Tube[];
  
  status: 'home' | 'playing' | 'won' | 'lost' | 'impossible_reward';
}
