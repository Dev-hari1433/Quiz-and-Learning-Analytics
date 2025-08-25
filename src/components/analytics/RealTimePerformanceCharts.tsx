import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Target, Clock, Brain, Zap, 
  Users, Trophy, Calendar, Activity, Eye, BarChart3 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface RealTimeData {
  timestamp: Date;
  accuracy: number;
  speed: number;
  xpGained: number;
  questionsAnswered: number;
}

interface SubjectPerformance {
  subject: string;
  accuracy: number;
  timeSpent: number;
  improvement: number;
  difficulty: number;
}

interface StudySession {
  date: string;
  duration: number;
  questionsAnswered: number;
  accuracy: number;
  xpGained: number;
  subjects: string[];
}

export const RealTimePerformanceCharts: React.FC = () => {
  const [realTimeData, setRealTimeData] = useState<RealTimeData[]>([]);
  const [currentStats, setCurrentStats] = useState({
    todayXP: 0,
    todayQuestions: 0,
    currentStreak: 0,
    averageSpeed: 0,
    overallAccuracy: 0,
    totalStudyTime: 0,
    rank: 0,
    activeLearners: 0
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newDataPoint: RealTimeData = {
        timestamp: now,
        accuracy: Math.floor(Math.random() * 20) + 80, // 80-100%
        speed: Math.floor(Math.random() * 10) + 15, // 15-25 seconds
        xpGained: Math.floor(Math.random() * 50) + 10,
        questionsAnswered: Math.floor(Math.random() * 5) + 1
      };

      setRealTimeData(prev => [...prev.slice(-19), newDataPoint]);
      
      // Update current stats
      setCurrentStats(prev => ({
        todayXP: prev.todayXP + newDataPoint.xpGained,
        todayQuestions: prev.todayQuestions + newDataPoint.questionsAnswered,
        currentStreak: Math.floor(Math.random() * 30) + 5,
        averageSpeed: Math.floor(Math.random() * 5) + 18,
        overallAccuracy: Math.floor(Math.random() * 10) + 88,
        totalStudyTime: prev.totalStudyTime + Math.floor(Math.random() * 5) + 2,
        rank: Math.max(1, prev.rank + (Math.random() > 0.5 ? 1 : -1)),
        activeLearners: Math.floor(Math.random() * 50) + 150
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Mock data for charts
  const weeklyProgress = [
    { day: 'Mon', xp: 320, questions: 24, accuracy: 89, time: 45 },
    { day: 'Tue', xp: 450, questions: 31, accuracy: 92, time: 62 },
    { day: 'Wed', xp: 280, questions: 18, accuracy: 85, time: 38 },
    { day: 'Thu', xp: 520, questions: 35, accuracy: 94, time: 71 },
    { day: 'Fri', xp: 380, questions: 28, accuracy: 88, time: 56 },
    { day: 'Sat', xp: 610, questions: 42, accuracy: 96, time: 89 },
    { day: 'Sun', xp: 490, questions: 33, accuracy: 91, time: 64 }
  ];

  const subjectPerformance: SubjectPerformance[] = [
    { subject: 'Mathematics', accuracy: 94, timeSpent: 180, improvement: 8, difficulty: 85 },
    { subject: 'Science', accuracy: 89, timeSpent: 145, improvement: 12, difficulty: 78 },
    { subject: 'History', accuracy: 92, timeSpent: 120, improvement: 5, difficulty: 65 },
    { subject: 'Literature', accuracy: 88, timeSpent: 98, improvement: 15, difficulty: 72 },
    { subject: 'Geography', accuracy: 91, timeSpent: 87, improvement: 9, difficulty: 68 }
  ];

  const studyPatterns = [
    { time: '6-8 AM', sessions: 12, performance: 95 },
    { time: '8-10 AM', sessions: 18, performance: 89 },
    { time: '10-12 PM', sessions: 25, performance: 92 },
    { time: '12-2 PM', sessions: 15, performance: 86 },
    { time: '2-4 PM', sessions: 22, performance: 90 },
    { time: '4-6 PM', sessions: 35, performance: 93 },
    { time: '6-8 PM', sessions: 28, performance: 91 },
    { time: '8-10 PM', sessions: 20, performance: 87 }
  ];

  const difficultyDistribution = [
    { name: 'Easy', value: 35, color: '#10B981' },
    { name: 'Medium', value: 45, color: '#F59E0B' },
    { name: 'Hard', value: 20, color: '#EF4444' }
  ];

  const StatCard = ({ title, value, change, icon: Icon, color, trend }: any) => (
    <Card className="gaming-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className={`flex items-center text-sm ${trend === 'up' ? 'text-accent' : 'text-destructive'}`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {change}
              </div>
            )}
          </div>
          <Icon className={`w-8 h-8 text-${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <StatCard 
          title="Today's XP" 
          value={currentStats.todayXP.toLocaleString()} 
          change="+12%" 
          icon={Zap} 
          color="xp-gold" 
          trend="up" 
        />
        <StatCard 
          title="Questions" 
          value={currentStats.todayQuestions} 
          change="+8%" 
          icon={Brain} 
          color="primary" 
          trend="up" 
        />
        <StatCard 
          title="Accuracy" 
          value={`${currentStats.overallAccuracy}%`} 
          change="+3%" 
          icon={Target} 
          color="accent" 
          trend="up" 
        />
        <StatCard 
          title="Streak" 
          value={`${currentStats.currentStreak}d`} 
          change="+1d" 
          icon={Calendar} 
          color="secondary" 
          trend="up" 
        />
        <StatCard 
          title="Avg Speed" 
          value={`${currentStats.averageSpeed}s`} 
          change="-2s" 
          icon={Clock} 
          color="success" 
          trend="up" 
        />
        <StatCard 
          title="Study Time" 
          value={formatTime(currentStats.totalStudyTime)} 
          change="+15m" 
          icon={Activity} 
          color="info" 
          trend="up" 
        />
        <StatCard 
          title="Rank" 
          value={`#${currentStats.rank}`} 
          change="+2" 
          icon={Trophy} 
          color="warning" 
          trend="up" 
        />
        <StatCard 
          title="Online" 
          value={currentStats.activeLearners} 
          icon={Users} 
          color="primary" 
        />
      </div>

      {/* Real-time Performance Chart */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary neon-glow" />
            Live Performance Monitoring
          </CardTitle>
          <CardDescription>Real-time accuracy and speed tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realTimeData.map((d, i) => ({ ...d, time: i }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Accuracy (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="speed" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Speed (s)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-secondary" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Study Patterns */}
        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-accent" />
              Study Pattern Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="sessions" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Performance & Difficulty Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="gaming-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Subject Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance.map((subject, index) => (
                <motion.div 
                  key={subject.subject}
                  className="p-4 bg-muted/20 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{subject.subject}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-accent">
                        {subject.improvement > 0 ? '+' : ''}{subject.improvement}%
                      </span>
                      <span className="text-muted-foreground">
                        {formatTime(subject.timeSpent)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span>{subject.accuracy}%</span>
                    </div>
                    <Progress value={subject.accuracy} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span>Difficulty Mastery</span>
                      <span>{subject.difficulty}%</span>
                    </div>
                    <Progress value={subject.difficulty} className="h-2" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="gaming-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-warning" />
              Difficulty Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {difficultyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};