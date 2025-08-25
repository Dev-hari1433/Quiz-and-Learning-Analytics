import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Target, Zap, TrendingUp, Clock, Users, Trophy, Star,
  Activity, Calendar, Flame, Award, BookOpen, Globe, Crown,
  Play, Pause, BarChart3, LineChart, PieChart, TrendingDown
} from 'lucide-react';
import { XPBar } from '@/components/gaming/XPBar';
import { StatsCard } from '@/components/gaming/StatsCard';
import { AchievementBadge } from '@/components/gaming/AchievementBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { useSessionUser } from '@/hooks/useSessionUser';

interface RealTimeStats {
  currentXP: number;
  maxXP: number;
  level: number;
  todayXP: number;
  streak: number;
  totalQuizzes: number;
  correctAnswers: number;
  averageTime: string;
  rank: number;
  activeLearners: number;
  todayTime: number;
  weeklyGoal: number;
  monthlyGoal: number;
  currentAccuracy: number;
  recentPerformance: number[];
  topSubjects: { name: string; score: number; improvement: number }[];
}

export const RealTimeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { userStats, quizHistory, loading, error } = useRealTimeData();
  const { sessionUser } = useSessionUser();

  if (loading && !userStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Dashboard Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="gaming-button-primary">
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Calculate real stats from user data
  const currentXP = (userStats?.total_xp || 0) % 1000;
  const maxXP = 1000;
  const level = userStats?.level || 1;
  const todayXP = getTodayXP();
  const currentAccuracy = (userStats?.total_questions || 0) > 0 
    ? Math.round(((userStats?.total_correct_answers || 0) / (userStats?.total_questions || 1)) * 100) 
    : 0;
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const averageTime = formatTime(getAverageQuizTime());
  const recentPerformance = getRecentPerformance();
  const topSubjects = getTopSubjects();

  function getTodayXP(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return quizHistory
      .filter(quiz => new Date(quiz.created_at) >= today)
      .reduce((total, quiz) => total + (quiz.correct_answers * 10), 0);
  }

  function getAverageQuizTime(): number {
    if (quizHistory.length === 0) return 0;
    return quizHistory.reduce((sum, quiz) => sum + (quiz.time_spent || 0), 0) / quizHistory.length;
  }

  function getRecentPerformance(): number[] {
    return quizHistory
      .slice(0, 7)
      .map(quiz => Math.round((quiz.correct_answers / quiz.total_questions) * 100))
      .reverse();
  }

  function getTopSubjects() {
    const subjectStats: { [key: string]: { total: number, correct: number, count: number } } = {};
    
    quizHistory.forEach(quiz => {
      if (!subjectStats[quiz.subject]) {
        subjectStats[quiz.subject] = { total: 0, correct: 0, count: 0 };
      }
      subjectStats[quiz.subject].total += quiz.total_questions;
      subjectStats[quiz.subject].correct += quiz.correct_answers;
      subjectStats[quiz.subject].count += 1;
    });

    return Object.entries(subjectStats)
      .map(([name, stats]) => ({
        name,
        score: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        improvement: 0 // Could be calculated from historical data
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

  const achievements = [
    {
      type: 'gold' as const,
      title: 'Quiz Master',
      description: 'Complete 50 quizzes',
      icon: 'trophy' as const,
      earned: true
    },
    {
      type: 'silver' as const,
      title: 'Speed Demon',
      description: 'Answer in under 10 seconds',
      icon: 'zap' as const,
      earned: true
    },
    {
      type: 'bronze' as const,
      title: 'Consistent Learner',
      description: 'Maintain 5-day streak',
      icon: 'target' as const,
      earned: true
    },
    {
      type: 'special' as const,
      title: 'AI Whisperer',
      description: 'Perfect score on AI topics',
      icon: 'star' as const,
      earned: false
    }
  ];



  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header with Live Status */}
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, 
              <span className="gaming-button-secondary px-3 py-1 rounded-lg ml-3">
                {sessionUser?.name || 'Learner'}
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">Ready to level up your learning?</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge 
              variant="default"
              className="flex items-center gap-2 bg-accent animate-pulse"
            >
              <Activity className="w-4 h-4" />
              LIVE
            </Badge>
          </div>
        </motion.div>

        {/* Real-time XP Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <XPBar 
            currentXP={currentXP}
            maxXP={maxXP}
            level={level}
            className="max-w-2xl mx-auto"
          />
        </motion.div>

        {/* Live Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <StatsCard
            title="Today's XP"
            value={todayXP.toLocaleString()}
            subtitle={(userStats?.total_quizzes || 0) > 0 ? "Keep learning!" : "Start your first quiz!"}
            icon={Zap}
            trend="up"
            trendValue={`${userStats?.total_xp || 0} total`}
            color="warning"
          />
          
          <StatsCard
            title="Current Accuracy"
            value={`${currentAccuracy}%`}
            subtitle={`${userStats?.total_correct_answers || 0}/${userStats?.total_questions || 0} correct`}
            icon={Target}
            trend={currentAccuracy >= 70 ? 'up' : currentAccuracy === 0 ? 'neutral' : 'down'}
            trendValue={currentAccuracy >= 70 ? 'Great!' : currentAccuracy === 0 ? 'Start learning' : 'Keep practicing'}
            color="accent"
          />
          
          <StatsCard
            title="Study Streak"
            value={`${userStats?.streak || 0} days`}
            subtitle={(userStats?.streak || 0) > 0 ? "Keep it going!" : "Start your streak!"}
            icon={Flame}
            trend={(userStats?.streak || 0) > 0 ? 'up' : 'neutral'}
            trendValue={(userStats?.streak || 0) > 0 ? "Active" : "Build your streak"}
            color="secondary"
          />
          
          <StatsCard
            title="Study Time"
            value={formatTime(userStats?.study_time || 0)}
            subtitle="Total learning time"
            icon={Clock}
            trend="up"
            trendValue={`Level ${level}`}
            color="secondary"
          />
          
          <StatsCard
            title="Current Level"
            value={`${level}`}
            subtitle={`${userStats?.total_xp || 0} XP earned`}
            icon={Trophy}
            trend="up"
            trendValue={`${1000 - currentXP} XP to next level`}
            color="warning"
          />
          
          <StatsCard
            title="Total Quizzes"
            value={userStats?.total_quizzes || 0}
            subtitle="Completed"
            icon={Users}
            color="primary"
          />
        </div>

        {/* Goals & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Goals Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Level Progress</span>
                  <span>{Math.round((currentXP / maxXP) * 100)}%</span>
                </div>
                <Progress value={(currentXP / maxXP) * 100} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {maxXP - currentXP} XP to level {level + 1}
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Quiz Accuracy</span>
                  <span>{currentAccuracy}%</span>
                </div>
                <Progress value={currentAccuracy} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {(userStats?.total_quizzes || 0) > 0 ? 'Keep improving!' : 'Take your first quiz!'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-accent" />
                Performance Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-24 gap-1">
                {recentPerformance.length > 0 ? recentPerformance.map((score, index) => (
                  <motion.div
                    key={index}
                    className="bg-primary/20 rounded-t flex-1 flex items-end justify-center"
                    style={{ height: `${(score / 100) * 100}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(score / 100) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="text-xs font-bold text-primary mb-1">
                      {score}
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center text-muted-foreground flex-1">
                    Take quizzes to see your performance trend
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>7 days ago</span>
                <span>Today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-secondary" />
                Top Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topSubjects.length > 0 ? topSubjects.map((subject, index) => (
                <motion.div 
                  key={subject.name}
                  className="flex items-center justify-between p-2 bg-muted/20 rounded"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div>
                    <div className="font-semibold text-sm">{subject.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {subject.score}% accuracy
                    </div>
                  </div>
                  <div className="text-sm font-bold text-accent">
                    Active
                  </div>
                </motion.div>
              )) : (
                <div className="text-center text-muted-foreground py-4">
                  Complete quizzes to see your top subjects
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="gaming-card p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6">Continue Your Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            
            <Button className="gaming-button-primary p-6 h-auto flex-col space-y-2"
              onClick={() => navigate('/generate-quiz')}>
              <Brain className="w-8 h-8 neon-glow" />
              <span className="font-bold">Generate Quiz</span>
              <span className="text-xs opacity-80">Upload documents & create AI quizzes</span>
            </Button>
            
            <Button className="gaming-button-secondary p-6 h-auto flex-col space-y-2"
              onClick={() => navigate('/analytics')}>
              <TrendingUp className="w-8 h-8" />
              <span className="font-bold">Analytics</span>
              <span className="text-xs opacity-80">Track your real-time progress</span>
            </Button>
            
            <Button className="gaming-button-primary p-6 h-auto flex-col space-y-2"
              onClick={() => navigate('/leaderboard')}>
              <Users className="w-8 h-8 neon-glow" />
              <span className="font-bold">Leaderboard</span>
              <span className="text-xs opacity-80">Challenge friends</span>
            </Button>
            
          </div>
        </motion.div>

        {/* Achievements Section */}
        <div className="space-y-6">
          <motion.h2
            className="text-3xl font-bold text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Recent Achievements
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
              >
                <AchievementBadge {...achievement} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <motion.div
          className="gaming-card p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-primary neon-glow" />
            AI Recommendations (Real-time)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div 
              className="p-4 bg-muted/50 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="font-semibold mb-2">📈 Trending Subject</h4>
              <p className="text-sm text-muted-foreground">Mathematics is showing strong improvement. Continue with advanced topics!</p>
            </motion.div>
            <motion.div 
              className="p-4 bg-muted/50 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="font-semibold mb-2">⚡ Optimal Study Time</h4>
              <p className="text-sm text-muted-foreground">Your peak performance is at 4-6 PM. Schedule difficult topics then!</p>
            </motion.div>
            <motion.div 
              className="p-4 bg-muted/50 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <h4 className="font-semibold mb-2">🎯 Focus Area</h4>
              <p className="text-sm text-muted-foreground">Spend more time on Science topics to balance your overall performance.</p>
            </motion.div>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
};

export default RealTimeDashboard;