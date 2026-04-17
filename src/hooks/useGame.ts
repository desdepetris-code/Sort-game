import { useState, useEffect, useCallback } from 'react';
import { GameState, BallType, Target, Tube, PowerUps } from '../types';
import { generateLevel } from '../lib/utils';

const initialPowerUps = {
  hammer: 1,
  wand: 1,
  shuffle: 1,
  extraSlot: 1,
};

export function useGame() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('ballGameState');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state');
      }
    }
    return {
      level: 1,
      lives: 5,
      maxLives: 5,
      lastLifeLoss: null,
      unlimitedLivesUntil: null,
      streak: 0,
      levelStartTime: 0,
      powerups: { ...initialPowerUps },
      targets: [],
      upcomingTargets: [],
      mechanismQueue: [],
      maxMechanismCapacity: 7,
      tubes: [],
      status: 'home'
    };
  });

  useEffect(() => {
    localStorage.setItem('ballGameState', JSON.stringify(state));
  }, [state]);

  const startGame = () => {
    const { targets, upcomingTargets, tubes } = generateLevel(state.level);
    setState(s => ({
      ...s,
      status: 'playing',
      levelStartTime: Date.now(),
      targets,
      upcomingTargets,
      tubes,
      mechanismQueue: []
    }));
  };

  const processQueue = useCallback(() => {
    setState(s => {
      if (s.status !== 'playing') return s;
      let newQueue = [...s.mechanismQueue];
      let newTargets = [...s.targets];
      let matchFound = false;

      // Simple queue processing for balls
      if (newQueue.length > 0) {
        const ball = newQueue[newQueue.length - 1];
        const targetIndex = newTargets.findIndex(t => t.type === ball && t.current < t.max);
        
        if (targetIndex !== -1) {
            newQueue.pop();
            newTargets[targetIndex] = { ...newTargets[targetIndex], current: newTargets[targetIndex].current + 1 };
            matchFound = true;
        }
      }

      const allFull = newTargets.every(t => t.current === t.max);
      if (allFull) return { ...s, status: 'won', targets: newTargets, mechanismQueue: newQueue };
      return { ...s, targets: newTargets, mechanismQueue: newQueue };
    });
  }, []);

  useEffect(() => {
    if (state.status === 'playing' && state.mechanismQueue.length > 0) {
      const timer = setTimeout(processQueue, 300);
      return () => clearTimeout(timer);
    }
  }, [state.mechanismQueue, state.status, processQueue]);

  const tapTube = (tubeIndex: number) => {
    setState(s => {
      if (s.status !== 'playing' || s.mechanismQueue.length >= 1) return s; // Take one at a time for manual filling
      const tube = s.tubes[tubeIndex];
      if (tube.balls.length === 0) return s;
      const newTubes = [...s.tubes];
      const popped = [...tube.balls].pop()!;
      newTubes[tubeIndex] = { ...tube, balls: [...tube.balls].slice(0, -1) };
      return { ...s, tubes: newTubes, mechanismQueue: [popped] };
    });
  };

  const nextLevel = () => {
    setState(s => {
      const { targets, upcomingTargets, tubes } = generateLevel(s.level + 1);
      return { ...s, level: s.level + 1, status: 'playing', levelStartTime: Date.now(), targets, upcomingTargets, tubes, mechanismQueue: [] };
    });
  };

  const retryLevel = () => {
    setState(s => {
      const { targets, upcomingTargets, tubes } = generateLevel(s.level);
      return { ...s, status: 'playing', levelStartTime: Date.now(), targets, upcomingTargets, tubes, mechanismQueue: [] };
    });
  };

  // Simplified powerups for ball logic
  const useHammer = () => setState(s => ({...s, mechanismQueue: []}));

  return { state, tapTube, nextLevel, retryLevel, useHammer, startGame };
}
