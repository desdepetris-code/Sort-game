import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Zap, RefreshCw, Hammer, Wand2, Play, Trophy, Bug } from 'lucide-react';
import { useGame } from './hooks/useGame';
import { BUTTERFLY_CLASSES } from './lib/utils';
import { ButterflyType } from './types';

export default function App() {
  const { 
    state, hasUnlimitedLives, tapTube, nextLevel, retryLevel, 
    claimImpossibleReward, useWand, useHammer, useShuffle, startGame 
  } = useGame();

  React.useEffect(() => {
    console.log("App component rendered. State:", state);
  }, [state]);

  const renderButterfly = (type: ButterflyType, key: string, className = '') => (
    <motion.div
      key={key}
      layoutId={key}
      className={`w-8 h-8 rounded-full flex items-center justify-center ${className}`}
    >
      <Bug className={`w-6 h-6 fill-current ${BUTTERFLY_CLASSES[type]}`} />
    </motion.div>
  );

  if (state.status === 'home') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col text-white">
        <header className="p-4 flex justify-between items-center bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <span className="font-bold">{state.lives}</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center gap-6">
          <h1 className="text-4xl font-bold">Butterfly Sort</h1>
          <div className="text-xl">Level {state.level}</div>
          <button onClick={startGame} className="py-4 px-12 bg-purple-600 rounded-full font-bold text-2xl hover:bg-purple-500 flex items-center gap-2">
            <Play className="w-6 h-6" /> Play
          </button>
        </main>

        <nav className="p-4 bg-slate-800 flex justify-center">
          <button className="flex flex-col items-center gap-1 hover:text-purple-400">
            <div className="p-2 bg-slate-700/50 rounded-full"><Trophy className="w-6 h-6" /></div>
            <span className="text-xs">Store</span>
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-slate-800/50 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">Lvl {state.level}</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full">
            <Heart className={`w-5 h-5 ${hasUnlimitedLives ? 'text-pink-400 fill-pink-400' : 'text-red-500 fill-red-500'}`} />
            <span className="font-bold">{hasUnlimitedLives ? '∞' : state.lives}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={useShuffle} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 relative">
            <RefreshCw className="w-5 h-5 text-blue-400" />
            <span className="absolute -top-1 -right-1 bg-blue-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{state.powerups.shuffle}</span>
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col p-4 w-full items-center">
        {/* Targets (Circles) - 123 top, 45 bottom */}
        <div className="grid grid-cols-3 gap-4 mb-4">
            {state.targets.slice(0, 3).map(t => (
                <div key={t.id} className="w-16 h-16 rounded-full border-4 border-slate-700 flex items-center justify-center relative">
                    {Array.from({ length: t.current }).map((_, j) => (
                        <div key={j} className="absolute inset-0 flex items-center justify-center">
                            {renderButterfly(t.type, `${t.id}-${j}`, 'w-10 h-10')}
                        </div>
                    ))}
                </div>
            ))}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
            {state.targets.slice(3, 5).map(t => (
                <div key={t.id} className="w-16 h-16 rounded-full border-4 border-slate-700 flex items-center justify-center relative">
                   {Array.from({ length: t.current }).map((_, j) => (
                        <div key={j} className="absolute inset-0 flex items-center justify-center">
                            {renderButterfly(t.type, `${t.id}-${j}`, 'w-10 h-10')}
                        </div>
                   ))}
                </div>
            ))}
        </div>

        {/* Butterfly Mechanism under targets */}
        <div className="my-8 w-full max-w-sm h-20 bg-slate-800 rounded-full flex items-center p-2 gap-2">
            {state.mechanismQueue.map((t, i) => (
                <div key={`queue-${i}`} className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                   <Bug className={`w-8 h-8 fill-current ${BUTTERFLY_CLASSES[t]}`} />
                </div>
            ))}
        </div>

        {/* Bottom Tubes (Sources) */}
        <div className="flex justify-center gap-4 mt-auto">
          {state.tubes?.map((tube, i) => (
            <div key={tube?.id} onClick={() => tapTube(i)} className="w-16 h-48 bg-slate-800 rounded-lg p-2 flex flex-col-reverse gap-2">
              {tube?.butterflies?.map((type, j) => (
                <Bug key={`tube-${j}`} className={`w-10 h-10 fill-current ${BUTTERFLY_CLASSES[type]}`} />
              ))}
            </div>
          ))}
        </div>
      </main>
      
      {/* Modals */}
      <AnimatePresence>
        {state.status === 'won' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div className="bg-slate-800 p-8 rounded-3xl border border-white/10 text-center max-w-sm w-full shadow-2xl">
              <h2 className="text-3xl font-bold mb-2">Level Cleared!</h2>
              <button onClick={nextLevel} className="w-full py-4 bg-purple-600 rounded-xl font-bold text-lg hover:bg-purple-500">Next Level</button>
            </motion.div>
          </motion.div>
        )}
        {state.status === 'lost' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div className="bg-slate-800 p-8 rounded-3xl border border-white/10 text-center max-w-sm w-full shadow-2xl">
              <h2 className="text-3xl font-bold mb-2">Out of Moves!</h2>
              <button onClick={retryLevel} className="w-full py-4 bg-red-600 rounded-xl font-bold text-lg hover:bg-red-500">Try Again</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
