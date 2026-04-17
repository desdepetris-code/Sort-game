import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BallType, Target, Tube } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BALL_TYPES: BallType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink', 'white', 'black'];

export function generateLevel(level: number): { targets: Target[], upcomingTargets: BallType[], tubes: Tube[] } {
  const numTypes = Math.min(5 + Math.floor(level / 2), BALL_TYPES.length);
  const levelTypes = BALL_TYPES.slice(0, numTypes);
  
  const targets: Target[] = [];
  const upcomingTargets: BallType[] = [];
  const tubes: Tube[] = [];
  
  for (let i = 0; i < 5; i++) {
    targets.push({
      id: `target-${i}`,
      type: levelTypes[i % numTypes], // Ensure designated color for each target slot
      current: 0,
      max: 5
    });
  }
  
  // Logic updated: Source tubes now hold balls
  for (let i = 0; i < 3; i++) {
    let balls: BallType[] = [];
    const color = levelTypes[Math.floor(Math.random() * levelTypes.length)];
    for(let j = 0; j < 10; j++) balls.push(color);
    tubes.push({
      id: `tube-${i}`,
      balls: balls,
      max: 10
    });
  }
  
  return { targets, upcomingTargets: [], tubes };
}

export const BALL_CLASSES: Record<BallType, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-500',
  pink: 'bg-pink-500',
  white: 'bg-white',
  black: 'bg-neutral-800 border border-white',
};
