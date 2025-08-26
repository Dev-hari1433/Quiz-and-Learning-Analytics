import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  points_earned: number;
  unlocked_at: string;
}

interface AchievementNotificationProps {
  achievements: Achievement[];
  onClose: () => void;
}

const getAchievementIcon = (type: string) => {
  switch (type) {
    case 'QUIZ_1':
      return <Star className="w-8 h-8 text-yellow-400" />;
    case 'QUIZ_5':
      return <Trophy className="w-8 h-8 text-gold" />;
    case 'ACCURACY_80':
      return <Sparkles className="w-8 h-8 text-blue-400" />;
    case 'ACCURACY_100':
      return <Trophy className="w-8 h-8 text-purple-400" />;
    case 'RESEARCH_5':
      return <Star className="w-8 h-8 text-green-400" />;
    default:
      return <Trophy className="w-8 h-8 text-primary" />;
  }
};

const getAchievementColor = (type: string) => {
  switch (type) {
    case 'QUIZ_1':
      return 'from-yellow-400/20 to-yellow-600/20 border-yellow-400/30';
    case 'QUIZ_5':
      return 'from-gold/20 to-yellow-600/20 border-gold/30';
    case 'ACCURACY_80':
      return 'from-blue-400/20 to-blue-600/20 border-blue-400/30';
    case 'ACCURACY_100':
      return 'from-purple-400/20 to-purple-600/20 border-purple-400/30';
    case 'RESEARCH_5':
      return 'from-green-400/20 to-green-600/20 border-green-400/30';
    default:
      return 'from-primary/20 to-accent/20 border-primary/30';
  }
};

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievements,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (achievements.length === 0) return;
    
    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Auto-close after showing all achievements
        setTimeout(onClose, 2000);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length, onClose]);

  if (achievements.length === 0) return null;

  const currentAchievement = achievements[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAchievement.id}
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            duration: 0.6 
          }}
          className={`relative max-w-md mx-4 p-8 rounded-2xl bg-gradient-to-br ${getAchievementColor(currentAchievement.achievement_type)} border-2 shadow-2xl`}
        >
          {/* Background animations */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                initial={{ 
                  x: Math.random() * 400,
                  y: Math.random() * 300,
                  opacity: 0 
                }}
                animate={{ 
                  y: -50,
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 2,
                  repeat: Infinity
                }}
              />
            ))}
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Content */}
          <div className="relative text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center"
            >
              {getAchievementIcon(currentAchievement.achievement_type)}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Achievement Unlocked!
              </h2>
              <h3 className="text-xl font-semibold text-white/90 mb-2">
                {currentAchievement.achievement_name}
              </h3>
              <p className="text-white/80 mb-4">
                {currentAchievement.description}
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white font-semibold">
                <Sparkles className="w-4 h-4 mr-1" />
                +{currentAchievement.points_earned} XP
              </div>
            </motion.div>

            {/* Progress indicator */}
            {achievements.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center space-x-2 mt-4"
              >
                {achievements.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};