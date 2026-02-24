import React from 'react';
import { motion } from 'motion/react';

interface SakuraSpiritProps {
  state: 'sleeping' | 'awake' | 'radiant';
  size?: number;
}

export const SakuraSpirit = ({ state, size = 96 }: SakuraSpiritProps) => {
  const getFace = () => {
    switch (state) {
      case 'sleeping': return '😴';
      case 'awake': return '🙂';
      case 'radiant': return '🌟';
      default: return '🙂';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <motion.div 
        animate={{ 
          y: [0, -10, 0],
          scale: state === 'radiant' ? [1, 1.1, 1] : 1
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{ width: size, height: size, fontSize: size * 0.6 }}
        className="relative flex items-center justify-center"
      >
        {/* Pixel Body (CSS) */}
        <div className="absolute inset-0 bg-[var(--color-primary)] opacity-20 rounded-full blur-xl"></div>
        <div className="z-10">{getFace()}</div>
        
        {state === 'radiant' && (
          <>
            <div className="sparkle" style={{ top: '10%', left: '20%' }}></div>
            <div className="sparkle" style={{ top: '20%', right: '10%' }}></div>
            <div className="sparkle" style={{ bottom: '15%', left: '30%' }}></div>
          </>
        )}
      </motion.div>
      <div className="mt-2 text-sm font-mono uppercase tracking-widest opacity-60">
        {state}
      </div>
    </div>
  );
};
