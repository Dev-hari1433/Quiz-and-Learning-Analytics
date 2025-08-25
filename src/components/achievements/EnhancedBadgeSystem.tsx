import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Star, Target, Zap, Award, Clock, Brain, BookOpen, Users, Crown, 
  Medal, Shield, Flame, Diamond, Gem, Rocket, Globe, Heart,
  Sparkles, Sun, Moon, Eye, Puzzle, Lock, Key, Gift, Compass, Mountain
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface EnhancedAchievement {
  id: string;
  type: 'legendary' | 'epic' | 'rare' | 'common' | 'special' | 'seasonal';
  category: 'speed' | 'accuracy' | 'streak' | 'knowledge' | 'social' | 'completion' | 'exploration' | 'mastery';
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical';
  xpReward: number;
  level: number;
  unlockedBy?: string;
  nextInSeries?: string;
  season?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  animationType?: 'bounce' | 'glow' | 'pulse' | 'sparkle' | 'rainbow';
}

interface EnhancedBadgeSystemProps {
  achievements: EnhancedAchievement[];
  userStats: {
    totalXP: number;
    level: number;
    streak: number;
    quizzesCompleted: number;
    averageScore: number;
    totalStudyTime: number;
    perfectScores: number;
    subjectsCompleted: number;
  };
}

const iconMap: { [key: string]: any } = {
  trophy: Trophy, star: Star, target: Target, zap: Zap, clock: Clock,
  brain: Brain, book: BookOpen, users: Users, crown: Crown, medal: Medal,
  shield: Shield, flame: Flame, diamond: Diamond, gem: Gem, rocket: Rocket,
  globe: Globe, heart: Heart, sparkles: Sparkles,
  sun: Sun, moon: Moon, eye: Eye, puzzle: Puzzle, lock: Lock, key: Key,
  gift: Gift, compass: Compass, mountain: Mountain
};

const typeColors = {
  legendary: {
    bg: 'bg-gradient-to-br from-orange-400 via-red-500 to-purple-600',
    border: 'border-orange-400',
    glow: 'shadow-[0_0_30px_rgba(249,115,22,0.8)] animate-pulse',
    text: 'text-white',
    particle: 'from-orange-400 to-red-500'
  },
  epic: {
    bg: 'bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600',
    border: 'border-purple-400',
    glow: 'shadow-[0_0_25px_rgba(147,51,234,0.7)]',
    text: 'text-white',
    particle: 'from-purple-500 to-indigo-600'
  },
  rare: {
    bg: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500',
    border: 'border-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]',
    text: 'text-white',
    particle: 'from-blue-500 to-cyan-500'
  },
  common: {
    bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
    border: 'border-gray-400',
    glow: 'shadow-[0_0_15px_rgba(107,114,128,0.5)]',
    text: 'text-white',
    particle: 'from-gray-400 to-gray-600'
  },
  special: {
    bg: 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-500',
    border: 'border-pink-400',
    glow: 'shadow-[0_0_25px_rgba(236,72,153,0.7)] animate-pulse',
    text: 'text-white',
    particle: 'from-pink-500 to-red-500'
  },
  seasonal: {
    bg: 'bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600',
    border: 'border-green-400',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.6)]',
    text: 'text-white',
    particle: 'from-green-400 to-emerald-500'
  }
};

const difficultyStars = {
  easy: 1,
  medium: 2,
  hard: 3,
  extreme: 4
};

export const EnhancedBadgeSystem: React.FC<EnhancedBadgeSystemProps> = ({ achievements, userStats }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<EnhancedAchievement | null>(null);
  
  const earnedAchievements = achievements.filter(a => a.earned);
  const categories = ['all', 'speed', 'accuracy', 'streak', 'knowledge', 'social', 'completion', 'exploration', 'mastery'];
  
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const AchievementCard = ({ achievement }: { achievement: EnhancedAchievement }) => {
    const Icon = iconMap[achievement.icon] || Trophy;
    const colors = typeColors[achievement.type];
    const isEarned = achievement.earned;
    const isLocked = !isEarned && achievement.level > userStats.level;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: isEarned ? 1.05 : 1.02, rotateY: 5 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={() => setSelectedAchievement(achievement)}
        className="cursor-pointer"
      >
        <Card className={`gaming-card p-4 relative overflow-hidden ${
          isEarned ? 'opacity-100' : isLocked ? 'opacity-40' : 'opacity-70'
        } ${isEarned ? colors.glow : ''} transition-all duration-300`}>
          
          {/* Particle Animation for Legendary */}
          {isEarned && achievement.type === 'legendary' && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-1 h-1 bg-gradient-to-r ${colors.particle} rounded-full`}
                  animate={{
                    x: [0, Math.random() * 100 - 50],
                    y: [0, Math.random() * 100 - 50],
                    opacity: [1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    repeatDelay: 1
                  }}
                  style={{
                    left: '50%',
                    top: '50%'
                  }}
                />
              ))}
            </div>
          )}

          {/* Lock Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
          )}

          {/* Badge Type & Difficulty */}
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            <Badge 
              variant="secondary" 
              className={`text-xs font-bold ${colors.text} ${colors.bg} border-0`}
            >
              {achievement.type.toUpperCase()}
            </Badge>
            <div className="flex gap-0.5">
              {[...Array(difficultyStars[achievement.difficulty])].map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>

          {/* Level Requirement */}
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="text-xs">
              Lv.{achievement.level}
            </Badge>
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center space-y-3 pt-6">
            {/* Icon with Effects */}
            <motion.div 
              className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${
                isEarned ? `${colors.bg} ${colors.glow}` : 'bg-muted'
              } ${isEarned && achievement.animationType === 'bounce' ? 'animate-bounce' : ''}`}
              animate={isEarned ? {
                boxShadow: [
                  '0 0 10px rgba(59, 130, 246, 0.4)',
                  '0 0 20px rgba(59, 130, 246, 0.6)',
                  '0 0 10px rgba(59, 130, 246, 0.4)'
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className={`w-6 h-6 ${isEarned ? colors.text : 'text-muted-foreground'}`} />
            </motion.div>

            {/* Title & Description */}
            <div>
              <h3 className="font-bold text-sm mb-1">{achievement.title}</h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {achievement.description}
              </p>
            </div>

            {/* Progress Bar */}
            {!isEarned && achievement.progress !== undefined && achievement.maxProgress && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <Progress 
                  value={(achievement.progress / achievement.maxProgress) * 100} 
                  className="h-1.5"
                />
              </div>
            )}

            {/* XP Reward */}
            <div className="flex items-center justify-center gap-1 text-xs">
              <Sparkles className="w-3 h-3 text-xp-gold" />
              <span className="text-xp-gold font-semibold">+{achievement.xpReward} XP</span>
            </div>

            {/* Earned Date */}
            {achievement.earnedDate && (
              <p className="text-xs text-accent">
                {new Date(achievement.earnedDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Achievement Unlock Animation */}
          {isEarned && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.5, delay: 0.5 }}
            >
              <div className={`absolute inset-0 bg-gradient-radial from-yellow-400/20 via-transparent to-transparent`} />
            </motion.div>
          )}
        </Card>
      </motion.div>
    );
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="gaming-card p-4 text-center">
      <Icon className={`w-8 h-8 mx-auto mb-2 text-${color}`} />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <motion.div 
        className="gaming-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Achievement Hub</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <StatCard title="Total XP" value={userStats.totalXP.toLocaleString()} icon={Sparkles} color="xp-gold" />
          <StatCard title="Level" value={userStats.level} icon={Crown} color="primary" />
          <StatCard title="Badges" value={earnedAchievements.length} icon={Medal} color="accent" />
          <StatCard title="Streak" value={`${userStats.streak}d`} icon={Flame} color="secondary" />
          <StatCard title="Quizzes" value={userStats.quizzesCompleted} icon={BookOpen} color="primary" />
          <StatCard title="Perfect" value={userStats.perfectScores} icon={Target} color="accent" />
          <StatCard title="Study Time" value={`${Math.floor(userStats.totalStudyTime / 60)}h`} icon={Clock} color="secondary" />
          <StatCard title="Subjects" value={userStats.subjectsCompleted} icon={Globe} color="primary" />
        </div>

        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-sm mb-2">
            <span>Achievement Progress</span>
            <span>{earnedAchievements.length}/{achievements.length}</span>
          </div>
          <Progress value={(earnedAchievements.length / achievements.length) * 100} className="h-3" />
        </div>
      </motion.div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="gaming-card grid w-full grid-cols-4 md:grid-cols-9 mb-6">
          {categories.map((category) => (
            <TabsTrigger 
              key={category}
              value={category}
              className="text-xs capitalize"
            >
              {category === 'all' ? 'All' : category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <AnimatePresence>
                {filteredAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AchievementCard achievement={achievement} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedAchievement(null)}
          >
            <motion.div
              className="gaming-card p-6 max-w-md w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                  selectedAchievement.earned ? typeColors[selectedAchievement.type].bg : 'bg-muted'
                }`}>
                  {iconMap[selectedAchievement.icon] && 
                    React.createElement(iconMap[selectedAchievement.icon], {
                      className: `w-10 h-10 ${selectedAchievement.earned ? 'text-white' : 'text-muted-foreground'}`
                    })
                  }
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2">{selectedAchievement.title}</h3>
                  <p className="text-muted-foreground mb-4">{selectedAchievement.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold">Type</div>
                      <div className="capitalize">{selectedAchievement.type}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Difficulty</div>
                      <div className="flex items-center gap-1">
                        {[...Array(difficultyStars[selectedAchievement.difficulty])].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold">XP Reward</div>
                      <div className="text-xp-gold">+{selectedAchievement.xpReward}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Level Req.</div>
                      <div>Level {selectedAchievement.level}</div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setSelectedAchievement(null)}
                  className="gaming-button-primary w-full"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};