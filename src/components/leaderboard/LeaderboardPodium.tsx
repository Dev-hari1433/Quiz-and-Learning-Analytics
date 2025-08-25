import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Trophy, Medal, Star } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  level: number;
  streak: number;
  rank: number;
}

interface LeaderboardPodiumProps {
  topThree: LeaderboardEntry[];
  className?: string;
}

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ 
  topThree, 
  className = "" 
}) => {
  const getPositionHeight = (rank: number) => {
    switch (rank) {
      case 1: return 'h-32';
      case 2: return 'h-24';
      case 3: return 'h-16';
      default: return 'h-16';
    }
  };

  const getPositionIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-8 h-8 text-xp-gold neon-glow" />;
      case 2: return <Trophy className="w-7 h-7 text-xp-silver" />;
      case 3: return <Medal className="w-6 h-6 text-xp-bronze" />;
      default: return <Star className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPositionColor = (rank: number) => {
    switch (rank) {
      case 1: return 'border-xp-gold bg-gradient-to-t from-xp-gold/10 to-xp-gold/5';
      case 2: return 'border-xp-silver bg-gradient-to-t from-xp-silver/10 to-xp-silver/5';
      case 3: return 'border-xp-bronze bg-gradient-to-t from-xp-bronze/10 to-xp-bronze/5';
      default: return 'border-muted bg-muted/5';
    }
  };

  // Sort to ensure proper order (1st in center, 2nd on left, 3rd on right)
  const orderedPositions = [
    topThree.find(p => p.rank === 2) || null, // Left
    topThree.find(p => p.rank === 1) || null, // Center  
    topThree.find(p => p.rank === 3) || null, // Right
  ];

  return (
    <div className={`gaming-card p-8 ${className}`}>
      <motion.h2
        className="text-3xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🏆 Top Performers
      </motion.h2>
      
      <div className="flex items-end justify-center space-x-4 mb-8">
        {orderedPositions.map((player, index) => {
          if (!player) return <div key={index} className="w-24" />;
          
          const actualRank = player.rank;
          const delay = index * 0.2;
          
          return (
            <motion.div
              key={player.id}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay, type: "spring", stiffness: 100 }}
            >
              {/* Player Avatar & Info */}
              <motion.div
                className="relative mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl font-bold border-2 ${getPositionColor(actualRank).split(' ')[0]}`}>
                  {player.avatar || player.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Rank Icon */}
                <div className="absolute -top-2 -right-2">
                  {getPositionIcon(actualRank)}
                </div>
                
                {/* Special effects for winner */}
                {actualRank === 1 && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-xp-gold"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                )}
              </motion.div>
              
              {/* Player Name */}
              <h3 className="text-sm font-bold text-center mb-2 max-w-20 truncate">
                {player.name}
              </h3>
              
              {/* Stats */}
              <div className="text-center mb-4">
                <div className="text-lg font-bold text-primary">{player.score}</div>
                <div className="text-xs text-muted-foreground">Level {player.level}</div>
              </div>
              
              {/* Podium Base */}
              <motion.div
                className={`w-24 ${getPositionHeight(actualRank)} ${getPositionColor(actualRank)} border-2 rounded-t-lg relative overflow-hidden flex items-center justify-center`}
                initial={{ height: 0 }}
                animate={{ height: actualRank === 1 ? 128 : actualRank === 2 ? 96 : 64 }}
                transition={{ duration: 0.8, delay: delay + 0.3 }}
              >
                <div className="text-2xl font-bold opacity-50">#{actualRank}</div>
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Achievement Highlights */}
      <motion.div
        className="grid grid-cols-3 gap-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        {topThree.map((player, index) => (
          <div key={player.id} className="p-4 bg-muted/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-1">{player.name}</h4>
            <div className="text-xs text-muted-foreground">
              🔥 {player.streak} day streak
            </div>
          </div>
        ))}
      </motion.div>
      
      {/* Confetti for winner */}
      {topThree[0] && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-xp-gold rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -50, 100],
                x: [0, Math.random() * 40 - 20, Math.random() * 80 - 40],
                rotate: [0, 360],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};