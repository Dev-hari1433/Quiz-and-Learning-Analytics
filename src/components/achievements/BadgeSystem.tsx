import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Target, Zap, Award, Clock, Brain, BookOpen, Users, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export interface Achievement {
  id: string;
  type: 'platinum' | 'gold' | 'silver' | 'bronze' | 'special';
  category: 'speed' | 'accuracy' | 'streak' | 'knowledge' | 'social' | 'completion';
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'target' | 'zap' | 'clock' | 'brain' | 'book' | 'users' | 'crown';
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
}

interface BadgeSystemProps {
  achievements: Achievement[];
  userStats: {
    totalXP: number;
    level: number;
    streak: number;
    quizzesCompleted: number;
    averageScore: number;
  };
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  target: Target,
  zap: Zap,
  clock: Clock,
  brain: Brain,
  book: BookOpen,
  users: Users,
  crown: Crown,
};

const typeColors = {
  platinum: {
    bg: 'bg-gradient-to-br from-slate-200 to-slate-400',
    border: 'border-slate-300',
    glow: 'shadow-[0_0_20px_rgba(148,163,184,0.6)]',
    text: 'text-slate-700'
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
    border: 'border-yellow-400',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.6)]',
    text: 'text-yellow-800'
  },
  silver: {
    bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
    border: 'border-gray-400',
    glow: 'shadow-[0_0_15px_rgba(156,163,175,0.5)]',
    text: 'text-gray-700'
  },
  bronze: {
    bg: 'bg-gradient-to-br from-orange-400 to-orange-600',
    border: 'border-orange-500',
    glow: 'shadow-[0_0_15px_rgba(251,146,60,0.5)]',
    text: 'text-orange-800'
  },
  special: {
    bg: 'bg-gradient-to-br from-purple-400 to-pink-500',
    border: 'border-purple-500',
    glow: 'shadow-[0_0_25px_rgba(168,85,247,0.7)]',
    text: 'text-white'
  }
};

const rarityColors = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-orange-400'
};

export const BadgeSystem: React.FC<BadgeSystemProps> = ({ achievements, userStats }) => {
  const earnedAchievements = achievements.filter(a => a.earned);
  const unearned = achievements.filter(a => !a.earned);
  const totalProgress = (earnedAchievements.length / achievements.length) * 100;

  const categories = ['speed', 'accuracy', 'streak', 'knowledge', 'social', 'completion'];
  
  const getCategoryIcon = (category: string) => {
    const icons = {
      speed: Zap,
      accuracy: Target,
      streak: Clock,
      knowledge: Brain,
      social: Users,
      completion: Trophy
    };
    return icons[category as keyof typeof icons] || Trophy;
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const Icon = iconMap[achievement.icon];
    const colors = typeColors[achievement.type];
    const isEarned = achievement.earned;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: isEarned ? 1.05 : 1.02, rotateY: 5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className={`gaming-card p-6 relative overflow-hidden ${
          isEarned ? 'opacity-100' : 'opacity-60 grayscale'
        }`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent" />
          </div>

          {/* Badge Type Indicator */}
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className={`text-xs font-bold ${colors.text} ${colors.bg} ${colors.border}`}
            >
              {achievement.type.toUpperCase()}
            </Badge>
          </div>

          {/* Rarity Gem */}
          {achievement.rarity && (
            <div className="absolute top-2 left-2">
              <div className={`w-3 h-3 rounded-full ${rarityColors[achievement.rarity]} animate-pulse`} />
            </div>
          )}

          {/* Main Content */}
          <div className="relative z-10 text-center space-y-4">
            {/* Icon with Glow Effect */}
            <motion.div 
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                isEarned ? `${colors.bg} ${colors.glow}` : 'bg-muted'
              }`}
              animate={isEarned ? { 
                boxShadow: [
                  '0 0 10px rgba(59, 130, 246, 0.4)',
                  '0 0 30px rgba(59, 130, 246, 0.6)',
                  '0 0 10px rgba(59, 130, 246, 0.4)'
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className={`w-8 h-8 ${isEarned ? colors.text : 'text-muted-foreground'}`} />
            </motion.div>

            {/* Title & Description */}
            <div>
              <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
              
              {achievement.earnedDate && (
                <p className="text-xs text-accent">
                  Earned: {new Date(achievement.earnedDate).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Progress Bar for Unearned */}
            {!isEarned && achievement.progress !== undefined && achievement.maxProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <Progress 
                  value={(achievement.progress / achievement.maxProgress) * 100} 
                  className="h-2"
                />
              </div>
            )}

            {/* XP Reward */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <Star className="w-4 h-4 text-xp-gold" />
              <span className="text-xp-gold font-semibold">+{achievement.xpReward} XP</span>
            </div>
          </div>

          {/* Achievement Animation */}
          {isEarned && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-radial from-accent/20 via-transparent to-transparent" />
            </motion.div>
          )}
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Overall Progress */}
      <motion.div 
        className="gaming-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Achievement Progress</h2>
          <div className="max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span>{earnedAchievements.length}/{achievements.length}</span>
            </div>
            <Progress value={totalProgress} className="h-3" />
            <p className="text-sm text-muted-foreground">
              {Math.round(totalProgress)}% complete
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-xp-gold">{userStats.totalXP}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userStats.level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{userStats.streak}</div>
              <div className="text-sm text-muted-foreground">Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{earnedAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Badges</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Achievement Categories */}
      <div className="space-y-6">
        {categories.map((category, categoryIndex) => {
          const categoryAchievements = achievements.filter(a => a.category === category);
          if (categoryAchievements.length === 0) return null;
          
          const CategoryIcon = getCategoryIcon(category);
          
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <div className="gaming-card p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 capitalize">
                  <CategoryIcon className="w-6 h-6 text-primary neon-glow" />
                  {category} Achievements
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence>
                    {categoryAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <AchievementCard achievement={achievement} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};