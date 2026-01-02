
import React from 'react';

interface DrawerWallProps {
  onDrawerClick: (num: number) => void;
  targetNumber: number | null;
  active: boolean;
}

const DrawerWall: React.FC<DrawerWallProps> = ({ onDrawerClick, targetNumber, active }) => {
  const drawers = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className={`grid grid-cols-5 md:grid-cols-10 gap-2 p-6 bg-orange-950/40 rounded-lg shadow-inner backdrop-blur-sm border-4 border-amber-900 overflow-y-auto max-h-[70vh] transition-all duration-700 ${active ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}`}>
      {drawers.map(num => (
        <button
          key={num}
          onClick={(e) => {
            e.stopPropagation();
            if (active) onDrawerClick(num);
          }}
          disabled={!active}
          className={`
            relative aspect-square flex items-center justify-center text-xs md:text-sm font-bold transition-all border
            ${num === targetNumber && active 
              ? 'bg-yellow-500 text-red-950 scale-110 z-10 shadow-lg border-yellow-200 animate-pulse' 
              : 'bg-orange-800 text-orange-200 border-orange-900 hover:bg-orange-700 active:scale-95'}
            rounded-sm shadow-sm cursor-pointer
          `}
        >
          {num}
          {/* Decorative drawer handle */}
          <div className="absolute bottom-1 w-2 h-0.5 bg-orange-400/50 rounded-full" />
        </button>
      ))}
    </div>
  );
};

export default DrawerWall;
