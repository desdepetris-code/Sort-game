import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ButterflyType, Target, Tube } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BUTTERFLY_TYPES: ButterflyType[] = ['monarch', 'swallowtail', 'blue-morpho', 'painted-lady', 'zebra-longwing', 'copper', 'admiral', 'peacock'];

export function generateLevel(level: number): { targets: Target[], upcomingTargets: ButterflyType[], tubes: Tube[] } {
  const numTypes = Math.min(3 + Math.floor(level / 5), BUTTERFLY_TYPES.length);
  const levelTypes = BUTTERFLY_TYPES.slice(0, numTypes);
  
  const targets: Target[] = [];
  const upcomingTargets: ButterflyType[] = [];
  const tubes: Tube[] = [];
  
  for (let i = 0; i < 5; i++) {
    targets.push({
      id: `target-${i}`,
      type: levelTypes[Math.floor(Math.random() * levelTypes.length)],
      current: 0,
      max: 5
    });
  }
  
  for (let i = 0; i < 5; i++) {
    upcomingTargets.push(levelTypes[Math.floor(Math.random() * levelTypes.length)]);
  }
  
  const allButterflies: ButterflyType[] = [];
  targets.forEach(t => {
    for (let i = 0; i < t.max; i++) {
      allButterflies.push(t.type);
    }
  });
  
  upcomingTargets.forEach(c => {
    for (let i = 0; i < 5; i++) {
      allButterflies.push(c);
    }
  });
  
  // Shuffle
  for (let i = allButterflies.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allButterflies[i], allButterflies[j]] = [allButterflies[j], allButterflies[i]];
  }
  
  for (let i = 0; i < 5; i++) {
    tubes.push({
      id: `tube-${i}`,
      butterflies: [],
      max: 10
    });
  }
  
  allButterflies.forEach((b, index) => {
    const tubeIndex = index % 5;
    if (tubes[tubeIndex].butterflies.length < 10) {
      tubes[tubeIndex].butterflies.push(b);
    }
  });
  
  return { targets, upcomingTargets, tubes };
}

export const BUTTERFLY_CLASSES: Record<ButterflyType, string> = {
  monarch: 'text-orange-500',
  swallowtail: 'text-yellow-400',
  'blue-morpho': 'text-blue-500',
  'painted-lady': 'text-red-500',
  'zebra-longwing': 'text-black',
  copper: 'text-amber-700',
  admiral: 'text-purple-600',
  peacock: 'text-cyan-500',
};
