import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Calendar, Target, Zap, Brain, BookOpen, Trophy, 
  TrendingUp, Star, Users, Activity, Play, Pause, Award,
  CheckCircle, XCircle, AlertCircle, Info, Flame, Crown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { useSessionUser } from '@/hooks/useSessionUser';

interface ActivityEvent {
  id: string;
  timestamp: Date;
  type: 'quiz_completed' | 'achievement_earned' | 'streak_milestone' | 'level_up' | 'study_session' | 'social_activity';
  title: string;
  description: string;
  details: {
    score?: number;
    xpGained?: number;
    timeSpent?: number;
    subject?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    participants?: number;
    achievement?: string;
    newLevel?: number;
    streakCount?: number;
    questionsAnswered?: number;
  };
  icon: string;
  status: 'success' | 'warning' | 'info' | 'error';
}

interface StudyMetrics {
  totalTimeToday: number;
  questionsAnswered: number;
  currentStreak: number;
  dailyGoalProgress: number;
  weeklyGoalProgress: number;
  activeSessions: number;
  totalSessions: number;
}

export const RealTimeActivityTimeline: React.FC = () => {
  const { userStats, quizHistory, researchHistory, loading } = useRealTimeData();
  const { sessionUser } = useSessionUser();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [metrics, setMetrics] = useState<StudyMetrics>({
    totalTimeToday: 0,
    questionsAnswered: 0,
    currentStreak: 0,
    dailyGoalProgress: 0,
    weeklyGoalProgress: 0,
    activeSessions: 0,
    totalSessions: 0
  });
  const [filter, setFilter] = useState<string>('all');

  // Convert real Supabase data to activities
  useEffect(() => {
    const realActivities: ActivityEvent[] = [];

    // Convert quiz history to activities
    quizHistory.forEach(quiz => {
      realActivities.push({
        id: quiz.id,
        timestamp: new Date(quiz.created_at),
        type: 'quiz_completed',
        title: `Quiz Completed: ${quiz.subject}`,
        description: `Scored ${quiz.score}% on ${quiz.subject} quiz`,
        details: {
          score: quiz.score,
          xpGained: quiz.correct_answers * 10 + (quiz.score >= 80 ? 20 : 0),
          timeSpent: Math.floor(quiz.time_spent / 60), // Convert seconds to minutes
          subject: quiz.subject,
          difficulty: quiz.difficulty as 'easy' | 'medium' | 'hard',
          questionsAnswered: quiz.total_questions
        },
        icon: 'brain',
        status: quiz.score >= 80 ? 'success' : quiz.score >= 60 ? 'warning' : 'error'
      });
    });

    // Convert research history to activities
    researchHistory.forEach(research => {
      realActivities.push({
        id: research.id,
        timestamp: new Date(research.created_at),
        type: 'study_session',
        title: `Research Session: ${research.activity_type}`,
        description: research.query_text ? `Researched: ${research.query_text.substring(0, 50)}...` : 'AI Research completed',
        details: {
          timeSpent: Math.floor(research.time_spent / 60), // Convert seconds to minutes
          xpGained: research.results_count * 5,
          subject: research.activity_type
        },
        icon: 'bookopen',
        status: 'info'
      });
    });

    // Add achievement activities based on user stats
    if (userStats?.achievements && userStats.achievements.length > 0) {
      userStats.achievements.forEach(achievement => {
        realActivities.push({
          id: `achievement-${achievement}`,
          timestamp: new Date(), // We don't have exact timestamp, use current
          type: 'achievement_earned',
          title: 'Achievement Unlocked!',
          description: `Earned "${achievement}" badge`,
          details: {
            achievement,
            xpGained: 100
          },
          icon: 'trophy',
          status: 'success'
        });
      });
    }

    // Add level up activities
    if (userStats?.level && userStats.level > 1) {
      realActivities.push({
        id: `level-${userStats.level}`,
        timestamp: new Date(),
        type: 'level_up',
        title: 'Level Up!',
        description: `Reached Level ${userStats.level}`,
        details: {
          newLevel: userStats.level,
          xpGained: userStats.level * 50
        },
        icon: 'crown',
        status: 'success'
      });
    }

    // Add streak milestone
    if (userStats?.streak && userStats.streak >= 3) {
      realActivities.push({
        id: `streak-${userStats.streak}`,
        timestamp: new Date(),
        type: 'streak_milestone',
        title: `${userStats.streak}-Day Streak!`,
        description: `Maintained learning consistency for ${userStats.streak} days`,
        details: {
          streakCount: userStats.streak,
          xpGained: userStats.streak * 10
        },
        icon: 'flame',
        status: 'success'
      });
    }

    // Sort by timestamp (newest first) and take latest 20
    const sortedActivities = realActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    setActivities(sortedActivities);

    // Calculate real metrics from data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayQuizzes = quizHistory.filter(quiz => new Date(quiz.created_at) >= today);
    const todayResearch = researchHistory.filter(research => new Date(research.created_at) >= today);
    
    const todayTime = [
      ...todayQuizzes.map(q => Math.floor(q.time_spent / 60)),
      ...todayResearch.map(r => Math.floor(r.time_spent / 60))
    ].reduce((sum, time) => sum + time, 0);
    
    const todayQuestions = todayQuizzes.reduce((sum, quiz) => sum + quiz.total_questions, 0);
    
    setMetrics({
      totalTimeToday: todayTime,
      questionsAnswered: todayQuestions,
      currentStreak: userStats?.streak || 0,
      dailyGoalProgress: Math.min(100, (todayTime / 60) * 100), // Assume 1 hour daily goal
      weeklyGoalProgress: Math.min(100, ((userStats?.study_time || 0) / 420) * 100), // Assume 7 hours weekly goal
      activeSessions: todayQuizzes.length + todayResearch.length,
      totalSessions: quizHistory.length + researchHistory.length
    });
  }, [quizHistory, researchHistory, userStats]);

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      brain: Brain,
      trophy: Trophy,
      flame: Flame,
      crown: Crown,
      bookopen: BookOpen,
      users: Users,
      target: Target,
      zap: Zap,
      star: Star
    };
    return icons[iconName] || Activity;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-accent';
      case 'warning': return 'text-secondary';
      case 'error': return 'text-destructive';
      default: return 'text-primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return XCircle;
      default: return Info;
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Show loading state
  if (loading && activities.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your activity history...</p>
        </div>
      </div>
    );
  }

  // Show empty state for new users
  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center gaming-card p-8 max-w-lg">
          <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Welcome to Your Learning Journey!</h2>
          <p className="text-muted-foreground mb-6">
            Your activity history will appear here once you start taking quizzes and using Smart Research.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="gaming-button-primary" onClick={() => window.location.href = '/generate-quiz'}>
              <Brain className="w-4 h-4 mr-2" />
              Take Your First Quiz
            </Button>
            <Button className="gaming-button-secondary" onClick={() => window.location.href = '/smart-research'}>
              <BookOpen className="w-4 h-4 mr-2" />
              Start Researching
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
            <Activity className="w-8 h-8 mr-3 text-primary neon-glow" />
            Activity History
          </h1>
          <p className="text-muted-foreground text-lg">Track your learning progress and achievements</p>
        </motion.div>

        <div className="space-y-6">
          {/* Live Controls & Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="gaming-card lg:col-span-3">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Your Learning Activity
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      REAL DATA
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{formatTime(metrics.totalTimeToday)}</div>
                    <div className="text-sm text-muted-foreground">Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{metrics.questionsAnswered}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">{metrics.currentStreak}d</div>
                    <div className="text-sm text-muted-foreground">Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">{metrics.activeSessions}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-lg">Goals Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Daily Goal</span>
                    <span>{Math.round(metrics.dailyGoalProgress)}%</span>
                  </div>
                  <Progress value={metrics.dailyGoalProgress} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Weekly Goal</span>
                    <span>{Math.round(metrics.weeklyGoalProgress)}%</span>
                  </div>
                  <Progress value={metrics.weeklyGoalProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Activity Timeline
              </CardTitle>
              
              {/* Filter Tabs */}
              <Tabs value={filter} onValueChange={setFilter} className="w-full">
                <TabsList className="gaming-card grid w-full grid-cols-7">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="quiz_completed">Quizzes</TabsTrigger>
                  <TabsTrigger value="achievement_earned">Achievements</TabsTrigger>
                  <TabsTrigger value="streak_milestone">Streaks</TabsTrigger>
                  <TabsTrigger value="level_up">Level Up</TabsTrigger>
                  <TabsTrigger value="study_session">Study</TabsTrigger>
                  <TabsTrigger value="social_activity">Social</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {filteredActivities.map((activity, index) => {
                    const Icon = getIcon(activity.icon);
                    const StatusIcon = getStatusIcon(activity.status);
                    
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-4 p-4 bg-muted/20 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        {/* Timeline dot and line */}
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${
                            activity.status === 'success' ? 'from-accent to-accent/80' :
                            activity.status === 'warning' ? 'from-secondary to-secondary/80' :
                            activity.status === 'error' ? 'from-destructive to-destructive/80' :
                            'from-primary to-primary/80'
                          }`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          {index < filteredActivities.length - 1 && (
                            <div className="w-0.5 h-8 bg-border/50 mt-2" />
                          )}
                        </div>

                        {/* Activity content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {activity.title}
                                <StatusIcon className={`w-4 h-4 ${getStatusColor(activity.status)}`} />
                              </h4>
                              <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>

                          {/* Activity details */}
                          <div className="flex flex-wrap gap-2">
                            {activity.details.score && (
                              <Badge variant="outline" className="text-xs">
                                Score: {activity.details.score}%
                              </Badge>
                            )}
                            {activity.details.xpGained && (
                              <Badge variant="outline" className="text-xs text-xp-gold">
                                +{activity.details.xpGained} XP
                              </Badge>
                            )}
                            {activity.details.timeSpent && (
                              <Badge variant="outline" className="text-xs">
                                {formatTime(activity.details.timeSpent)}
                              </Badge>
                            )}
                            {activity.details.subject && (
                              <Badge variant="outline" className="text-xs">
                                {activity.details.subject}
                              </Badge>
                            )}
                            {activity.details.difficulty && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  activity.details.difficulty === 'hard' ? 'text-destructive' :
                                  activity.details.difficulty === 'medium' ? 'text-secondary' :
                                  'text-accent'
                                }`}
                              >
                                {activity.details.difficulty}
                              </Badge>
                            )}
                            {activity.details.participants && (
                              <Badge variant="outline" className="text-xs">
                                {activity.details.participants} participants
                              </Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {filteredActivities.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your learning journey to see your progress here!
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button 
                        className="gaming-button-primary"
                        onClick={() => window.location.href = '/generate-quiz'}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Take a Quiz
                      </Button>
                      <Button 
                        className="gaming-button-secondary"
                        onClick={() => window.location.href = '/smart-research'}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Start Research
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};