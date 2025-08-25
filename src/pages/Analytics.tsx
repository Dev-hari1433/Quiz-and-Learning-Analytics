import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Brain } from 'lucide-react';
import { StatsCard } from '@/components/gaming/StatsCard';
import { RealTimePerformanceCharts } from '@/components/analytics/RealTimePerformanceCharts';
import { GameStateManager } from '@/lib/gameState';

const Analytics = () => {
  const [gameState, setGameState] = useState(GameStateManager.getInstance().getState());

  useEffect(() => {
    const gameManager = GameStateManager.getInstance();
    const unsubscribe = gameManager.subscribe(setGameState);
    return unsubscribe;
  }, []);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTopicsProgress = () => {
    const totalSubjects = 20; // Assume 20 total subjects available
    const masteredSubjects = Math.floor(gameState.totalQuizzes / 10); // 1 subject mastered per 10 quizzes
    return Math.min(masteredSubjects, totalSubjects);
  };

  const getMonthlyQuizzes = () => {
    const monthlyQuizzes = gameState.quizHistory.filter(quiz => {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return quiz.timestamp >= oneMonthAgo;
    }).length;
    return monthlyQuizzes;
  };

  const getWeeklyStudyTime = () => {
    const weeklyTime = gameState.quizHistory
      .filter(quiz => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return quiz.timestamp >= oneWeekAgo;
      })
      .reduce((total, quiz) => total + quiz.timeSpent, 0);
    return weeklyTime;
  };

  const getCurrentAccuracy = () => {
    return gameState.totalQuestions > 0 
      ? Math.round((gameState.totalCorrectAnswers / gameState.totalQuestions) * 100)
      : 0;
  };

  const getPerformanceTrend = () => {
    const recentQuizzes = gameState.quizHistory.slice(0, 5);
    const olderQuizzes = gameState.quizHistory.slice(5, 10);
    
    if (recentQuizzes.length === 0) return { trend: 'neutral', value: '0%' };
    
    const recentAvg = recentQuizzes.reduce((sum, quiz) => sum + (quiz.correctAnswers / quiz.totalQuestions * 100), 0) / recentQuizzes.length;
    const olderAvg = olderQuizzes.length > 0 
      ? olderQuizzes.reduce((sum, quiz) => sum + (quiz.correctAnswers / quiz.totalQuestions * 100), 0) / olderQuizzes.length
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
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
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
            value={gameState.totalQuizzes.toString()}
            subtitle="All time"
            icon={Brain}
            trend="up"
            trendValue={`${getMonthlyQuizzes()} this month`}
            color="primary"
          />
          
          <StatsCard
            title="Average Score"
            value={`${getCurrentAccuracy()}%`}
            subtitle={gameState.totalQuizzes > 0 ? "Keep improving!" : "Start your first quiz!"}
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
            trendValue={`${formatTime(gameState.studyTime)} total`}
            color="secondary"
          />
          
          <StatsCard
            title="Topics Mastered"
            value={getTopicsProgress().toString()}
            subtitle="Out of 20"
            icon={TrendingUp}
            trend="up"
            trendValue={`Level ${gameState.level} reached`}
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
                {gameState.totalQuizzes > 0 
                  ? `You've completed ${gameState.totalQuizzes} quizzes with ${getCurrentAccuracy()}% accuracy. Great work!`
                  : "Start taking quizzes to see your progress and get personalized insights!"
                }
              </p>
            </div>
            <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
              <h4 className="font-semibold text-secondary mb-2">📈 XP & Level</h4>
              <p className="text-sm text-muted-foreground">
                {gameState.totalXP > 0 
                  ? `You're at Level ${gameState.level} with ${gameState.totalXP} XP. ${1000 - (gameState.totalXP % 1000)} XP to next level!`
                  : "Complete quizzes to earn XP and level up your learning journey!"
                }
              </p>
            </div>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">⏰ Study Stats</h4>
              <p className="text-sm text-muted-foreground">
                {gameState.studyTime > 0 
                  ? `Total study time: ${formatTime(gameState.studyTime)}. This week: ${formatTime(getWeeklyStudyTime())}`
                  : "Your study time will be tracked here as you take quizzes and learn!"
                }
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;