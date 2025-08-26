import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap, Award } from 'lucide-react';
import { AchievementBadge } from '@/components/gaming/AchievementBadge';
import { EnhancedBadgeSystem, EnhancedAchievement } from '@/components/achievements/EnhancedBadgeSystem';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { useRealTimeConnection } from '@/hooks/useRealTimeConnection';
import RealTimeIndicator from '@/components/ui/realtime-indicator';
import RealTimeAchievementNotification from '@/components/achievements/RealTimeAchievementNotification';
import AchievementChatbot from '@/components/chatbot/AchievementChatbot';

const Achievements = () => {
  const { userStats, quizHistory, loading } = useRealTimeData();
  const { isConnected, isUpdating } = useRealTimeConnection();

  if (loading && !userStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  // Calculate achievements based on real user data
  const calculateAchievements = (): EnhancedAchievement[] => {
    const currentAccuracy = (userStats?.total_questions || 0) > 0 
      ? Math.round(((userStats?.total_correct_answers || 0) / (userStats?.total_questions || 1)) * 100) 
      : 0;
    const subjectCount = [...new Set(quizHistory.map(quiz => quiz.subject))].length;
    const perfectScores = quizHistory.filter(quiz => quiz.correct_answers === quiz.total_questions).length;
    const averageTime = quizHistory.length > 0 
      ? quizHistory.reduce((sum, quiz) => sum + ((quiz.time_spent || 0) / quiz.total_questions), 0) / quizHistory.length 
      : 0;

    return [
      {
        id: '1',
        type: 'legendary',
        category: 'completion',
        title: 'Quiz Legend',
        description: 'Complete 100 quizzes with 90%+ accuracy',
        icon: 'crown',
        earned: (userStats?.total_quizzes || 0) >= 100 && currentAccuracy >= 90,
        earnedDate: (userStats?.total_quizzes || 0) >= 100 && currentAccuracy >= 90 ? new Date().toISOString().split('T')[0] : undefined,
        rarity: 'legendary',
        xpReward: 500,
        level: 25,
        difficulty: 'extreme',
        progress: Math.min(userStats?.total_quizzes || 0, 100),
        maxProgress: 100
      },
      {
        id: '2',
        type: 'epic',
        category: 'speed',
        title: 'Speed Demon',
        description: 'Average response time under 5 seconds',
        icon: 'zap',
        earned: averageTime < 5 && (userStats?.total_quizzes || 0) >= 10,
        earnedDate: averageTime < 5 && (userStats?.total_quizzes || 0) >= 10 ? new Date().toISOString().split('T')[0] : undefined,
        rarity: 'epic',
        xpReward: 250,
        level: 15,
        difficulty: 'hard',
        progress: Math.max(0, 10 - Math.round(averageTime)),
        maxProgress: 10
      },
      {
        id: '3',
        type: 'rare',
        category: 'streak',
        title: 'Consistent Learner',
        description: 'Maintain a 7-day learning streak',
        icon: 'target',
        earned: (userStats?.streak || 0) >= 7,
        earnedDate: (userStats?.streak || 0) >= 7 ? new Date().toISOString().split('T')[0] : undefined,
        rarity: 'rare',
        xpReward: 150,
        level: 10,
        difficulty: 'medium',
        progress: userStats?.streak || 0,
        maxProgress: 7
      },
      {
        id: '4',
        type: 'common',
        category: 'knowledge',
        title: 'Subject Explorer',
        description: 'Complete quizzes in 5 different subjects',
        icon: 'book',
        earned: subjectCount >= 5,
        earnedDate: subjectCount >= 5 ? new Date().toISOString().split('T')[0] : undefined,
        rarity: 'common',
        xpReward: 100,
        level: 5,
        difficulty: 'easy',
        progress: subjectCount,
        maxProgress: 5
      },
      {
        id: '5',
        type: 'special',
        category: 'accuracy',
        title: 'Perfect Score',
        description: 'Get 100% on 3 quizzes',
        icon: 'star',
        earned: perfectScores >= 3,
        earnedDate: perfectScores >= 3 ? new Date().toISOString().split('T')[0] : undefined,
        rarity: 'epic',
        xpReward: 300,
        level: 8,
        difficulty: 'hard',
        progress: perfectScores,
        maxProgress: 3
      },
      {
        id: '6',
        type: 'common',
        category: 'completion',
        title: 'First Steps',
        description: 'Complete your first quiz',
        icon: 'trophy',
        earned: (userStats?.total_quizzes || 0) >= 1,
        earnedDate: (userStats?.total_quizzes || 0) >= 1 ? new Date().toISOString().split('T')[0] : undefined,
        rarity: 'common',
        xpReward: 50,
        level: 1,
        difficulty: 'easy',
        progress: Math.min(userStats?.total_quizzes || 0, 1),
        maxProgress: 1
      },
      {
        id: '7',
        type: 'common',
        category: 'completion',
        title: 'Quiz Enthusiast',
        description: 'Complete 10 quizzes',
        icon: 'brain',
        earned: (userStats?.total_quizzes || 0) >= 10,
        earnedDate: (userStats?.total_quizzes || 0) >= 10 ? new Date().toISOString().split('T')[0] : undefined,
        rarity: 'common',
        xpReward: 100,
        level: 3,
        difficulty: 'easy',
        progress: Math.min(userStats?.total_quizzes || 0, 10),
        maxProgress: 10
      },
      {
        id: '8',
        type: 'rare',
        category: 'accuracy',
        title: 'High Achiever',
        description: 'Maintain 80%+ accuracy over 20 quizzes',
        icon: 'star',
        earned: (userStats?.total_quizzes || 0) >= 20 && currentAccuracy >= 80,
        earnedDate: (userStats?.total_quizzes || 0) >= 20 && currentAccuracy >= 80 ? new Date().toISOString().split('T')[0] : undefined,
        rarity: 'rare',
        xpReward: 200,
        level: 8,
        difficulty: 'medium',
        progress: (userStats?.total_quizzes || 0) >= 20 ? currentAccuracy : (userStats?.total_quizzes || 0),
        maxProgress: (userStats?.total_quizzes || 0) >= 20 ? 80 : 20
      },
      {
        id: '9',
        type: 'epic',
        category: 'mastery',
        title: 'Level Master',
        description: 'Reach level 10',
        icon: 'crown',
        earned: (userStats?.level || 1) >= 10,
        earnedDate: (userStats?.level || 1) >= 10 ? new Date().toISOString().split('T')[0] : undefined,
        rarity: 'epic',
        xpReward: 500,
        level: 10,
        difficulty: 'hard',
        progress: userStats?.level || 1,
        maxProgress: 10
      },
      {
        id: '10',
        type: 'common',
        category: 'exploration',
        title: 'XP Collector',
        description: 'Earn 1000 XP',
        icon: 'zap',
        earned: (userStats?.total_xp || 0) >= 1000,
        earnedDate: (userStats?.total_xp || 0) >= 1000 ? new Date().toISOString().split('T')[0] : undefined,
        rarity: 'common',
        xpReward: 100,
        level: 5,
        difficulty: 'easy',
        progress: Math.min(userStats?.total_xp || 0, 1000),
        maxProgress: 1000
      }
    ];
  };

  const achievements = calculateAchievements();

  const badgeUserStats = {
    totalXP: userStats?.total_xp || 0,
    level: userStats?.level || 1,
    streak: userStats?.streak || 0,
    quizzesCompleted: userStats?.total_quizzes || 0,
    averageScore: (userStats?.total_questions || 0) > 0 ? Math.round(((userStats?.total_correct_answers || 0) / (userStats?.total_questions || 1)) * 100) : 0,
    totalStudyTime: userStats?.study_time || 0,
    perfectScores: quizHistory.filter(quiz => quiz.correct_answers === quiz.total_questions).length,
    subjectsCompleted: [...new Set(quizHistory.map(quiz => quiz.subject))].length
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
          <div className="flex items-center justify-center space-x-4 mb-2">
            <h1 className="text-4xl font-bold flex items-center">
              <Trophy className="w-8 h-8 mr-3 text-primary neon-glow" />
              Achievements & Badges
            </h1>
            <RealTimeIndicator isConnected={isConnected} isUpdating={isUpdating} />
          </div>
          <p className="text-muted-foreground text-lg">Your learning milestones and rewards</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <EnhancedBadgeSystem achievements={achievements} userStats={badgeUserStats} />
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

        {/* Achievement Chatbot */}
        <AchievementChatbot userStats={badgeUserStats} />
      </div>
      <RealTimeAchievementNotification />
    </div>
  );
};

export default Achievements;