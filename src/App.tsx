import React from 'react';
import { motion } from 'motion/react';
import { Heart, Play } from 'lucide-react';
import { useGame } from './hooks/useGame';
import { BALL_CLASSES } from './lib/utils';
import { BallType } from './types';

export default function App() {
  const { state, tapTube, startGame } = useGame();

  const renderBall = (type: BallType, className = '') => (
    <div className={`w-8 h-8 rounded-full ${BALL_CLASSES[type]} ${className}`} />
  );

  if (state.status === 'home') {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col text-white">
        <header className="p-4 flex justify-between items-center bg-neutral-800">
          <div className="flex items-center gap-2"><Heart className="text-red-500 fill-red-500" /> {state.lives}</div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center gap-6">
          <h1 className="text-4xl font-bold">Ball Sort</h1>
          <button onClick={startGame} className="py-4 px-12 bg-indigo-600 rounded-full font-bold text-2xl hover:bg-indigo-500 flex items-center gap-2"><Play /> Play</button>
        </main>
      </div>
    );
  }

  // The 'Box' container
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center p-4">
      <div className="w-full max-w-lg bg-neutral-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 border border-neutral-700">
        
        {/* Targets (5 Designated Color Circles) */}
        <div className="grid grid-cols-5 gap-2">
            {state.targets.map((t) => (
                <div key={t.id} className="aspect-square rounded-full border-4 border-neutral-700 bg-neutral-900 flex items-center justify-center overflow-hidden relative">
                    <div className={`absolute inset-0 opacity-30 ${BALL_CLASSES[t.type]}`} />
                    <div className="flex flex-wrap gap-1 justify-center p-1">
                        {Array.from({length: t.current}).map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full ${BALL_CLASSES[t.type]}`} />
                        ))}
                    </div>
                </div>
            ))}
        </div>

        {/* Spinning Ring */}
        <div className="relative w-full aspect-square flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} className="w-48 h-48 border-8 border-dashed border-neutral-600 rounded-full absolute" />
            <div className="flex justify-center">
                {state.mechanismQueue.map((t, i) => (
                    <div key={i} className="p-1">{renderBall(t, 'w-10 h-10')}</div>
                ))}
            </div>
        </div>

        {/* Source Tubes (Balls) */}
        <div className="grid grid-cols-3 gap-2 bg-neutral-900 p-4 rounded-xl">
            {state.tubes.map((tube, i) => (
                <div key={tube.id} onClick={() => tapTube(i)} className="h-40 bg-neutral-950 rounded flex flex-col-reverse items-center justify-start gap-1 p-1">
                    {tube.balls.map((type, j) => renderBall(type, 'w-8 h-8'))}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
