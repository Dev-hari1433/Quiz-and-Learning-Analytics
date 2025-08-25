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
  const [isLive, setIsLive] = useState(true);
  const [stats, setStats] = useState<RealTimeStats>({
    currentXP: 0,
    maxXP: 1000,
    level: 1,
    todayXP: 0,
    streak: 0,
    totalQuizzes: 0,
    correctAnswers: 0,
    averageTime: "0m",
    rank: 100,
    activeLearners: 156,
    todayTime: 0,
    weeklyGoal: 0,
    monthlyGoal: 0,
    currentAccuracy: 0,
    recentPerformance: [0, 0, 0, 0, 0, 0, 0],
    topSubjects: [
      { name: 'Mathematics', score: 0, improvement: 0 },
      { name: 'Science', score: 0, improvement: 0 },
      { name: 'History', score: 0, improvement: 0 }
    ]
  });

  // Real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStats(prev => {
        const xpGain = Math.floor(Math.random() * 20) + 5;
        const timeGain = Math.floor(Math.random() * 10) + 2;
        const newAccuracy = Math.max(75, Math.min(100, prev.currentAccuracy + (Math.random() - 0.5) * 5));
        
        return {
          ...prev,
          currentXP: Math.min(prev.maxXP, prev.currentXP + xpGain),
          todayXP: prev.todayXP + xpGain,
          todayTime: prev.todayTime + timeGain,
          weeklyGoal: Math.min(100, prev.weeklyGoal + Math.random() * 3),
          monthlyGoal: Math.min(100, prev.monthlyGoal + Math.random() * 1.5),
          currentAccuracy: Math.round(newAccuracy),
          recentPerformance: [...prev.recentPerformance.slice(-6), Math.round(newAccuracy)],
          activeLearners: Math.floor(Math.random() * 50) + 130,
          rank: Math.max(1, prev.rank + (Math.random() > 0.6 ? 1 : -1)),
          topSubjects: prev.topSubjects.map(subject => ({
            ...subject,
            score: Math.max(75, Math.min(100, subject.score + (Math.random() - 0.5) * 2)),
            improvement: Math.max(-5, Math.min(20, subject.improvement + (Math.random() - 0.5) * 3))
          }))
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getPerformanceTrend = () => {
    const recent = stats.recentPerformance.slice(-2);
    if (recent.length < 2) return 'stable';
    return recent[1] > recent[0] ? 'up' : recent[1] < recent[0] ? 'down' : 'stable';
  };

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
                Alex Chen
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">Ready to level up your learning?</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge 
              variant={isLive ? "default" : "secondary"} 
              className={`flex items-center gap-2 ${isLive ? 'bg-accent animate-pulse' : ''}`}
            >
              <Activity className="w-4 h-4" />
              {isLive ? 'LIVE' : 'PAUSED'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="flex items-center gap-2"
            >
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isLive ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </motion.div>

        {/* Real-time XP Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <XPBar 
            currentXP={stats.currentXP}
            maxXP={stats.maxXP}
            level={stats.level}
            className="max-w-2xl mx-auto"
          />
        </motion.div>

        {/* Live Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <StatsCard
            title="Today's XP"
            value={stats.todayXP.toLocaleString()}
            subtitle={`+${Math.floor(stats.todayXP / 10)} from last hour`}
            icon={Zap}
            trend="up"
            trendValue="+12%"
            color="warning"
          />
          
          <StatsCard
            title="Current Accuracy"
            value={`${stats.currentAccuracy}%`}
            subtitle={`${stats.correctAnswers}/${stats.totalQuizzes} correct`}
            icon={Target}
            trend={getPerformanceTrend() === 'stable' ? 'neutral' : getPerformanceTrend() as 'up' | 'down'}
            trendValue={`${getPerformanceTrend() === 'up' ? '+' : ''}${Math.floor(Math.random() * 5)}%`}
            color="accent"
          />
          
          <StatsCard
            title="Study Streak"
            value={`${stats.streak} days`}
            subtitle="Keep it going!"
            icon={Flame}
            trend="up"
            trendValue="Personal best!"
            color="secondary"
          />
          
          <StatsCard
            title="Today's Time"
            value={formatTime(stats.todayTime)}
            subtitle="Active learning"
            icon={Clock}
            trend="up"
            trendValue="+15m this hour"
            color="secondary"
          />
          
          <StatsCard
            title="Global Rank"
            value={`#${stats.rank}`}
            subtitle="Amazing progress!"
            icon={Trophy}
            trend={stats.rank <= 5 ? 'up' : 'down'}
            trendValue={`${stats.rank <= 5 ? 'Climbed' : 'Moved'} ${Math.floor(Math.random() * 3) + 1} spots`}
            color="warning"
          />
          
          <StatsCard
            title="Active Learners"
            value={stats.activeLearners}
            subtitle="Online now"
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
                  <span>Weekly Goal</span>
                  <span>{Math.round(stats.weeklyGoal)}%</span>
                </div>
                <Progress value={stats.weeklyGoal} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {100 - Math.round(stats.weeklyGoal)}% remaining
                </p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Goal</span>
                  <span>{Math.round(stats.monthlyGoal)}%</span>
                </div>
                <Progress value={stats.monthlyGoal} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  On track for monthly target
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
                {stats.recentPerformance.map((score, index) => (
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
                ))}
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
              {stats.topSubjects.map((subject, index) => (
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
                      {Math.round(subject.score)}% accuracy
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${
                    subject.improvement > 0 ? 'text-accent' : 'text-destructive'
                  }`}>
                    {subject.improvement > 0 ? '+' : ''}{Math.round(subject.improvement)}%
                  </div>
                </motion.div>
              ))}
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