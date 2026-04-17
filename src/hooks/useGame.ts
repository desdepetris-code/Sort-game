import { useState, useEffect, useCallback } from 'react';
import { GameState, ButterflyType, Target, Tube, PowerUps } from '../types';
import { generateLevel } from '../lib/utils';

const LIVES_REGEN_MS = 20 * 60 * 1000;

const initialPowerUps = {
  hammer: 1,
  wand: 1,
  shuffle: 1,
  extraSlot: 1,
};

export function useGame() {
  const [state, setState] = useState<GameState>(() => {
    const saved = localStorage.getItem('butterflyGameState');
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
    localStorage.setItem('butterflyGameState', JSON.stringify(state));
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

  const hasUnlimitedLives = state.unlimitedLivesUntil && state.unlimitedLivesUntil > Date.now();

  const processQueue = useCallback(() => {
    setState(s => {
      if (s.status !== 'playing') return s;
      let newQueue = [...s.mechanismQueue];
      let newTargets = [...s.targets];
      let newUpcoming = [...s.upcomingTargets];
      let matched = false;

      for (let i = 0; i < newQueue.length; i++) {
        const type = newQueue[i];
        const targetIndex = newTargets.findIndex(t => t.type === type && t.current < t.max);
        if (targetIndex !== -1) {
          newQueue.splice(i, 1);
          newTargets[targetIndex] = { ...newTargets[targetIndex], current: newTargets[targetIndex].current + 1 };
          matched = true;
          if (newTargets[targetIndex].current === newTargets[targetIndex].max) {
            if (newUpcoming.length > 0) {
              newTargets[targetIndex] = { id: `target-${Date.now()}-${targetIndex}`, type: newUpcoming.shift()!, current: 0, max: 5 };
            }
          }
          break;
        }
      }

      if (newTargets.every(t => t.current === t.max) && newUpcoming.length === 0) return handleWin({ ...s, targets: newTargets, mechanismQueue: newQueue, upcomingTargets: newUpcoming });
      if (!matched && newQueue.length >= s.maxMechanismCapacity) return handleLoss({ ...s, targets: newTargets, mechanismQueue: newQueue, upcomingTargets: newUpcoming });
      if (matched) return { ...s, targets: newTargets, mechanismQueue: newQueue, upcomingTargets: newUpcoming };
      return s;
    });
  }, []);

  useEffect(() => {
    if (state.status === 'playing' && state.mechanismQueue.length > 0) {
      const timer = setTimeout(processQueue, 300);
      return () => clearTimeout(timer);
    }
  }, [state.mechanismQueue, state.status, processQueue]);

  const handleWin = (s: GameState): GameState => {
    const newStreak = s.streak + 1;
    let newUnlimited = s.unlimitedLivesUntil;
    let powerups = { ...s.powerups };
    if (newStreak === 10) newUnlimited = Date.now() + 60 * 60 * 1000;
    else if (newStreak === 5) newUnlimited = Date.now() + 30 * 60 * 1000;
    else if (newStreak > 1) {
      const pKeys = Object.keys(powerups) as (keyof PowerUps)[];
      powerups[pKeys[Math.floor(Math.random() * pKeys.length)]]++;
    }
    return { ...s, status: 'won', streak: newStreak, unlimitedLivesUntil: newUnlimited, powerups };
  };

  const handleLoss = (s: GameState): GameState => {
    if (Date.now() - s.levelStartTime > 86400000) return { ...s, status: 'impossible_reward' };
    const hasUnlimited = s.unlimitedLivesUntil && s.unlimitedLivesUntil > Date.now();
    return { ...s, status: 'lost', streak: 0, lives: hasUnlimited ? s.lives : Math.max(0, s.lives - 1), lastLifeLoss: (!hasUnlimited && s.lives === s.maxLives) ? Date.now() : s.lastLifeLoss };
  };

  const tapTube = (tubeIndex: number) => {
    setState(s => {
      if (s.status !== 'playing' || s.mechanismQueue.length >= s.maxMechanismCapacity) return s;
      const tube = s.tubes[tubeIndex];
      if (tube.butterflies.length === 0) return s;
      const newTubes = [...s.tubes];
      const popped = [...tube.butterflies].pop()!;
      newTubes[tubeIndex] = { ...tube, butterflies: [...tube.butterflies].slice(0, -1) };
      return { ...s, tubes: newTubes, mechanismQueue: [...s.mechanismQueue, popped] };
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
      if (s.lives <= 0 && !(s.unlimitedLivesUntil && s.unlimitedLivesUntil > Date.now())) return s;
      const { targets, upcomingTargets, tubes } = generateLevel(s.level);
      return { ...s, status: 'playing', levelStartTime: Date.now(), targets, upcomingTargets, tubes, mechanismQueue: [] };
    });
  };

  const claimImpossibleReward = () => {
    setState(s => ({ ...s, status: 'playing', unlimitedLivesUntil: Date.now() + (Date.now() - s.levelStartTime > 604800000 ? 3600000 : 600000), powerups: { ...s.powerups, wand: s.powerups.wand + 1, hammer: s.powerups.hammer + 1 }, levelStartTime: Date.now(), mechanismQueue: [] }));
  };

  const useWand = (targetIndex: number) => {
    setState(s => {
      if (s.powerups.wand <= 0 || s.status !== 'playing') return s;
      const newTargets = [...s.targets];
      newTargets[targetIndex] = { ...newTargets[targetIndex], current: newTargets[targetIndex].max };
      return { ...s, targets: newTargets, powerups: { ...s.powerups, wand: s.powerups.wand - 1 } };
    });
  };

  const useHammer = (queueIndex: number) => {
    setState(s => {
      if (s.powerups.hammer <= 0 || s.status !== 'playing') return s;
      const newQueue = [...s.mechanismQueue];
      newQueue.splice(queueIndex, 1);
      return { ...s, mechanismQueue: newQueue, powerups: { ...s.powerups, hammer: s.powerups.hammer - 1 } };
    });
  };

  const useShuffle = () => {
    setState(s => {
      if (s.powerups.shuffle <= 0 || s.status !== 'playing') return s;
      const all = s.tubes.flatMap(t => t.butterflies);
      for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
      }
      return { ...s, tubes: s.tubes.map(t => ({ ...t, butterflies: all.splice(0, t.butterflies.length) })), powerups: { ...s.powerups, shuffle: s.powerups.shuffle - 1 } };
    });
  };

  return { state, hasUnlimitedLives, tapTube, nextLevel, retryLevel, claimImpossibleReward, useWand, useHammer, useShuffle, startGame };
}
