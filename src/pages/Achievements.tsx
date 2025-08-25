import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap, Award } from 'lucide-react';
import { AchievementBadge } from '@/components/gaming/AchievementBadge';
import { EnhancedBadgeSystem, EnhancedAchievement } from '@/components/achievements/EnhancedBadgeSystem';

const Achievements = () => {
  // Enhanced achievements data with all the features like Kahoot/Duolingo
  const achievements: EnhancedAchievement[] = [
    {
      id: '1',
      type: 'platinum',
      category: 'completion',
      title: 'Quiz Legend',
      description: 'Complete 100 quizzes with 90%+ accuracy',
      icon: 'crown',
      earned: true,
      earnedDate: '2024-01-15',
      rarity: 'legendary',
      xpReward: 500
    },
    {
      id: '2',
      type: 'gold',
      category: 'speed',
      title: 'Speed Demon',
      description: 'Answer 10 questions in under 5 seconds each',
      icon: 'zap',
      earned: true,
      earnedDate: '2024-01-10',
      rarity: 'epic',
      xpReward: 250
    },
    {
      id: '3',
      type: 'silver',
      category: 'streak',
      title: 'Consistent Learner',
      description: 'Maintain a 15-day learning streak',
      icon: 'target',
      earned: true,
      earnedDate: '2024-01-05',
      rarity: 'rare',
      xpReward: 150
    },
    {
      id: '4',
      type: 'bronze',
      category: 'knowledge',
      title: 'Subject Explorer',
      description: 'Complete quizzes in 5 different subjects',
      icon: 'book',
      earned: true,
      earnedDate: '2024-01-01',
      rarity: 'common',
      xpReward: 100
    },
    {
      id: '5',
      type: 'special',
      category: 'accuracy',
      title: 'Perfect Score',
      description: 'Get 100% on 3 consecutive quizzes',
      icon: 'star',
      earned: false,
      progress: 2,
      maxProgress: 3,
      rarity: 'epic',
      xpReward: 300
    },
    {
      id: '6',
      type: 'gold',
      category: 'social',
      title: 'Top Competitor',
      description: 'Reach top 10 on global leaderboard',
      icon: 'trophy',
      earned: false,
      progress: 15,
      maxProgress: 10,
      rarity: 'rare',
      xpReward: 400
    },
    {
      id: '7',
      type: 'silver',
      category: 'speed',
      title: 'Quick Thinker',
      description: 'Average response time under 8 seconds',
      icon: 'clock',
      earned: false,
      progress: 9,
      maxProgress: 8,
      rarity: 'common',
      xpReward: 120
    },
    {
      id: '8',
      type: 'bronze',
      category: 'knowledge',
      title: 'Research Master',
      description: 'Use Smart Research 20 times',
      icon: 'brain',
      earned: false,
      progress: 12,
      maxProgress: 20,
      rarity: 'common',
      xpReward: 80
    },
    {
      id: '9',
      type: 'platinum',
      category: 'completion',
      title: 'Master Learner',
      description: 'Reach level 50',
      icon: 'crown',
      earned: false,
      progress: 12,
      maxProgress: 50,
      rarity: 'legendary',
      xpReward: 1000
    },
    {
      id: '10',
      type: 'special',
      category: 'social',
      title: 'Community Helper',
      description: 'Share 5 quiz results with friends',
      icon: 'users',
      earned: false,
      progress: 0,
      maxProgress: 5,
      rarity: 'rare',
      xpReward: 200
    }
  ];

  const userStats = {
    totalXP: 4850,
    level: 12,
    streak: 7,
    quizzesCompleted: 89,
    averageScore: 87,
    totalStudyTime: 1440,
    perfectScores: 12,
    subjectsCompleted: 6
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
            <Trophy className="w-8 h-8 mr-3 text-primary neon-glow" />
            Achievements & Badges
          </h1>
          <p className="text-muted-foreground text-lg">Your learning milestones and rewards</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EnhancedBadgeSystem achievements={achievements} userStats={userStats} />
        </motion.div>

        {/* Achievement Tips */}
        <motion.div
          className="gaming-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Award className="w-6 h-6 mr-2 text-accent" />
            Pro Tips for Earning Badges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <h4 className="font-semibold text-accent mb-2">🎯 Focus on Accuracy</h4>
              <p className="text-sm text-muted-foreground">
                Take your time to read questions carefully. Accuracy badges require consistent high scores.
              </p>
            </div>
            <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
              <h4 className="font-semibold text-secondary mb-2">⚡ Speed Training</h4>
              <p className="text-sm text-muted-foreground">
                Practice with easier topics first to build up your speed before tackling harder questions.
              </p>
            </div>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">🔥 Daily Streaks</h4>
              <p className="text-sm text-muted-foreground">
                Set reminders to study daily. Even 10 minutes counts toward your learning streak!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Achievements;