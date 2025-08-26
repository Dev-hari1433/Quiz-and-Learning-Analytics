import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Brain, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/gaming/StatsCard';
import { RealTimePerformanceCharts } from '@/components/analytics/RealTimePerformanceCharts';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { useRealTimeConnection } from '@/hooks/useRealTimeConnection';
import RealTimeIndicator from '@/components/ui/realtime-indicator';
import RealTimeAchievementNotification from '@/components/achievements/RealTimeAchievementNotification';

const Analytics = () => {
  const { userStats, quizHistory, loading } = useRealTimeData();
  const { isConnected, isUpdating } = useRealTimeConnection();

  if (loading && !userStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  // Show empty state for new users
  if (!userStats || (userStats.total_quizzes === 0 && userStats.research_sessions === 0)) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground text-lg">Track your learning progress and insights</p>
          </motion.div>

          <motion.div
            className="text-center gaming-card p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Data Yet!</h2>
            <p className="text-muted-foreground mb-6">
              Start taking quizzes and researching to see your analytics and progress insights here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="gaming-button-primary"
                onClick={() => window.location.href = '/generate-quiz'}
              >
                <Brain className="w-4 h-4 mr-2" />
                Take Your First Quiz
              </Button>
              <Button 
                className="gaming-button-secondary"
                onClick={() => window.location.href = '/smart-research'}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Start Researching
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTopicsProgress = () => {
    const totalSubjects = 20; // Assume 20 total subjects available
    const masteredSubjects = Math.floor((userStats?.total_quizzes || 0) / 10); // 1 subject mastered per 10 quizzes
    return Math.min(masteredSubjects, totalSubjects);
  };

  const getMonthlyQuizzes = () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return quizHistory.filter(quiz => {
      return new Date(quiz.created_at) >= oneMonthAgo;
    }).length;
  };

  const getWeeklyStudyTime = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return quizHistory
      .filter(quiz => new Date(quiz.created_at) >= oneWeekAgo)
      .reduce((total, quiz) => total + (quiz.time_spent || 0), 0);
  };

  const getCurrentAccuracy = () => {
    return (userStats?.total_questions || 0) > 0 
      ? Math.round(((userStats?.total_correct_answers || 0) / (userStats?.total_questions || 1)) * 100)
      : 0;
  };

  const getPerformanceTrend = () => {
    const recentQuizzes = quizHistory.slice(0, 5);
    const olderQuizzes = quizHistory.slice(5, 10);
    
    if (recentQuizzes.length === 0) return { trend: 'neutral', value: '0%' };
    
    const recentAvg = recentQuizzes.reduce((sum, quiz) => sum + ((quiz.correct_answers / quiz.total_questions) * 100), 0) / recentQuizzes.length;
    const olderAvg = olderQuizzes.length > 0 
      ? olderQuizzes.reduce((sum, quiz) => sum + ((quiz.correct_answers / quiz.total_questions) * 100), 0) / olderQuizzes.length
      : recentAvg;
    
    const improvement = recentAvg - olderAvg;
    const trend = improvement > 2 ? 'up' : improvement < -2 ? 'down' : 'neutral';
    const value = `${improvement > 0 ? '+' : ''}${Math.round(improvement)}%`;
    
    return { trend, value };
  };

  const performanceTrend = getPerformanceTrend();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
            <RealTimeIndicator isConnected={isConnected} isUpdating={isUpdating} />
          </div>
          <p className="text-muted-foreground text-lg">Track your learning progress and insights</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatsCard
            title="Total Quizzes"
            value={(userStats?.total_quizzes || 0).toString()}
            subtitle="All time"
            icon={Brain}
            trend="up"
            trendValue={`${getMonthlyQuizzes()} this month`}
            color="primary"
          />
          
          <StatsCard
            title="Average Score"
            value={`${getCurrentAccuracy()}%`}
            subtitle={(userStats?.total_quizzes || 0) > 0 ? "Keep improving!" : "Start your first quiz!"}
            icon={Target}
            trend={performanceTrend.trend as "up" | "down" | "neutral"}
            trendValue={performanceTrend.value}
            color="accent"
          />
          
          <StatsCard
            title="Study Time"
            value={formatTime(getWeeklyStudyTime())}
            subtitle="This week"
            icon={Clock}
            trend="up"
            trendValue={`${formatTime(userStats?.study_time || 0)} total`}
            color="secondary"
          />
          
          <StatsCard
            title="Topics Mastered"
            value={getTopicsProgress().toString()}
            subtitle="Out of 20"
            icon={TrendingUp}
            trend="up"
            trendValue={`Level ${userStats?.level || 1} reached`}
            color="primary"
          />
        </motion.div>

        {/* Performance Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <RealTimePerformanceCharts />
        </motion.div>

        {/* Insights Section */}
        <motion.div
          className="gaming-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold mb-4 text-primary">🧠 AI Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <h4 className="font-semibold text-accent mb-2">🎯 Your Progress</h4>
              <p className="text-sm text-muted-foreground">
                {(userStats?.total_quizzes || 0) > 0 
                  ? `You've completed ${userStats?.total_quizzes} quizzes with ${getCurrentAccuracy()}% accuracy. Great work!`
                  : "Start taking quizzes to see your progress and get personalized insights!"
                }
              </p>
            </div>
            <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
              <h4 className="font-semibold text-secondary mb-2">📈 XP & Level</h4>
              <p className="text-sm text-muted-foreground">
                {(userStats?.total_xp || 0) > 0 
                  ? `You're at Level ${userStats?.level} with ${userStats?.total_xp} XP. ${1000 - ((userStats?.total_xp || 0) % 1000)} XP to next level!`
                  : "Complete quizzes to earn XP and level up your learning journey!"
                }
              </p>
            </div>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">⏰ Study Stats</h4>
              <p className="text-sm text-muted-foreground">
                {(userStats?.study_time || 0) > 0 
                  ? `Total study time: ${formatTime(userStats?.study_time || 0)}. This week: ${formatTime(getWeeklyStudyTime())}`
                  : "Your study time will be tracked here as you take quizzes and learn!"
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <RealTimeAchievementNotification />
    </div>
  );
};

export default Analytics;