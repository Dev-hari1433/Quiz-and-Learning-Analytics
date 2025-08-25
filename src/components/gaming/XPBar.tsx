import React from 'react';
import { motion } from 'framer-motion';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  className?: string;
}

export const XPBar: React.FC<XPBarProps> = ({ 
  currentXP, 
  maxXP, 
  level, 
  className = "" 
}) => {
  const percentage = (currentXP / maxXP) * 100;

  return (
    <div className={`gaming-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className="gaming-button-secondary px-3 py-1 rounded-full text-sm font-bold">
            Level {level}
          </div>
          <span className="text-muted-foreground text-sm">
            {currentXP} / {maxXP} XP
          </span>
        </div>
        <div className="text-accent font-semibold text-sm">
          {Math.round(percentage)}%
        </div>
      </div>
      
      <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-xp rounded-full relative"
          style={{ width: `${percentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
        </motion.div>
        
        {/* Glow effect */}
        <div 
          className="absolute top-0 h-full bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 rounded-full blur-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};