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
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // Generate real-time activities
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      const eventTypes = [
        'quiz_completed', 'achievement_earned', 'streak_milestone', 
        'level_up', 'study_session', 'social_activity'
      ];
      
      const subjects = ['Mathematics', 'Science', 'History', 'Literature', 'Geography'];
      const achievements = [
        'Speed Demon', 'Perfect Score', 'Quick Learner', 'Dedicated Student',
        'Subject Master', 'Streak Champion', 'Social Butterfly'
      ];

      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)] as ActivityEvent['type'];
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];

      let newActivity: ActivityEvent;

      switch (randomType) {
        case 'quiz_completed':
          const score = Math.floor(Math.random() * 40) + 60; // 60-100%
          newActivity = {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: randomType,
            title: `Quiz Completed: ${randomSubject}`,
            description: `Scored ${score}% on ${randomSubject} quiz`,
            details: {
              score,
              xpGained: Math.floor(score / 10) * 10,
              timeSpent: Math.floor(Math.random() * 15) + 5,
              subject: randomSubject,
              difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)] as 'easy' | 'medium' | 'hard'
            },
            icon: 'brain',
            status: score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error'
          };
          break;

        case 'achievement_earned':
          newActivity = {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: randomType,
            title: `Achievement Unlocked!`,
            description: `Earned "${randomAchievement}" badge`,
            details: {
              achievement: randomAchievement,
              xpGained: Math.floor(Math.random() * 200) + 100
            },
            icon: 'trophy',
            status: 'success'
          };
          break;

        case 'streak_milestone':
          const streakCount = Math.floor(Math.random() * 20) + 5;
          newActivity = {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: randomType,
            title: `${streakCount}-Day Streak!`,
            description: `Maintained learning consistency for ${streakCount} days`,
            details: {
              streakCount,
              xpGained: streakCount * 10
            },
            icon: 'flame',
            status: 'success'
          };
          break;

        case 'level_up':
          const newLevel = Math.floor(Math.random() * 5) + 15;
          newActivity = {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: randomType,
            title: `Level Up!`,
            description: `Reached Level ${newLevel}`,
            details: {
              newLevel,
              xpGained: newLevel * 50
            },
            icon: 'crown',
            status: 'success'
          };
          break;

        case 'study_session':
          newActivity = {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: randomType,
            title: `Study Session: ${randomSubject}`,
            description: `Focused study session completed`,
            details: {
              subject: randomSubject,
              timeSpent: Math.floor(Math.random() * 45) + 15,
              questionsAnswered: Math.floor(Math.random() * 20) + 5,
              xpGained: Math.floor(Math.random() * 80) + 20
            },
            icon: 'bookopen',
            status: 'info'
          };
          break;

        case 'social_activity':
          newActivity = {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: randomType,
            title: `Group Study Session`,
            description: `Participated in collaborative learning`,
            details: {
              participants: Math.floor(Math.random() * 8) + 2,
              subject: randomSubject,
              xpGained: Math.floor(Math.random() * 60) + 30
            },
            icon: 'users',
            status: 'info'
          };
          break;

        default:
          return;
      }

      setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
      
      // Update metrics
      setMetrics(prev => ({
        totalTimeToday: prev.totalTimeToday + (newActivity.details.timeSpent || 0),
        questionsAnswered: prev.questionsAnswered + (newActivity.details.questionsAnswered || Math.floor(Math.random() * 5) + 1),
        currentStreak: Math.max(prev.currentStreak, newActivity.details.streakCount || prev.currentStreak),
        dailyGoalProgress: Math.min(100, prev.dailyGoalProgress + Math.random() * 5),
        weeklyGoalProgress: Math.min(100, prev.weeklyGoalProgress + Math.random() * 2),
        activeSessions: Math.floor(Math.random() * 5) + 1,
        totalSessions: prev.totalSessions + (newActivity.type === 'study_session' ? 1 : 0)
      }));
    }, 4000); // New activity every 4 seconds

    return () => clearInterval(interval);
  }, [isLiveMode]);

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

  return (
    <div className="space-y-6">
      {/* Live Controls & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="gaming-card lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Activity className={`w-5 h-5 ${isLiveMode ? 'text-accent animate-pulse' : 'text-muted-foreground'}`} />
                Real-Time Activity Feed
                {isLiveMode && (
                  <Badge variant="secondary" className="bg-accent/20 text-accent">
                    LIVE
                  </Badge>
                )}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLiveMode(!isLiveMode)}
                className="flex items-center gap-2"
              >
                {isLiveMode ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isLiveMode ? 'Pause' : 'Resume'}
              </Button>
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
              <div className="text-center py-8 text-muted-foreground">
                No activities yet. Start learning to see your progress here!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};