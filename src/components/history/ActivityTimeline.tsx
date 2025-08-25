import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trophy, Target, Brain, BookOpen, TrendingUp, CheckCircle, XCircle, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export interface ActivityItem {
  id: string;
  type: 'quiz' | 'study' | 'achievement' | 'milestone' | 'research';
  title: string;
  description: string;
  timestamp: Date;
  metadata: {
    score?: number;
    duration?: number; // in minutes
    subject?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    xpEarned?: number;
    questionsAnswered?: number;
    correctAnswers?: number;
  };
  status: 'completed' | 'in_progress' | 'failed';
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  showFilters?: boolean;
}

const getActivityIcon = (type: string) => {
  const icons = {
    quiz: Brain,
    study: BookOpen,
    achievement: Trophy,
    milestone: Target,
    research: BookOpen
  };
  return icons[type as keyof typeof icons] || Brain;
};

const getStatusColor = (status: string) => {
  const colors = {
    completed: 'text-accent border-accent bg-accent/10',
    in_progress: 'text-secondary border-secondary bg-secondary/10',
    failed: 'text-destructive border-destructive bg-destructive/10'
  };
  return colors[status as keyof typeof colors] || colors.completed;
};

const getDifficultyColor = (difficulty: string) => {
  const colors = {
    easy: 'bg-accent text-accent-foreground',
    medium: 'bg-secondary text-secondary-foreground',
    hard: 'bg-destructive text-destructive-foreground'
  };
  return colors[difficulty as keyof typeof colors] || colors.easy;
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = activity.timestamp.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, ActivityItem[]>);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const ActivityCard = ({ activity }: { activity: ActivityItem }) => {
    const Icon = getActivityIcon(activity.type);
    const statusColor = getStatusColor(activity.status);

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* Timeline connector */}
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
        
        <Card className="gaming-card p-4 ml-16 relative">
          {/* Activity Icon */}
          <div className={`absolute -left-16 top-4 w-12 h-12 rounded-full border-2 ${statusColor} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>

          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{activity.title}</h3>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatTime(activity.timestamp)}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-2">
              {activity.metadata.subject && (
                <Badge variant="outline">{activity.metadata.subject}</Badge>
              )}
              {activity.metadata.difficulty && (
                <Badge className={getDifficultyColor(activity.metadata.difficulty)}>
                  {activity.metadata.difficulty.toUpperCase()}
                </Badge>
              )}
              {activity.metadata.duration && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(activity.metadata.duration)}
                </Badge>
              )}
            </div>

            {/* Quiz Results */}
            {activity.type === 'quiz' && activity.metadata.score !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Score: {activity.metadata.score}%</span>
                  <span>
                    {activity.metadata.correctAnswers}/{activity.metadata.questionsAnswered} correct
                  </span>
                </div>
                <Progress value={activity.metadata.score} className="h-2" />
                
                {activity.metadata.xpEarned && (
                  <div className="flex items-center gap-1 text-sm text-xp-gold">
                    <Zap className="w-4 h-4" />
                    +{activity.metadata.xpEarned} XP
                  </div>
                )}
              </div>
            )}

            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-sm">
              {activity.status === 'completed' && (
                <>
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span className="text-accent">Completed</span>
                </>
              )}
              {activity.status === 'failed' && (
                <>
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span className="text-destructive">Incomplete</span>
                </>
              )}
              {activity.status === 'in_progress' && (
                <>
                  <Clock className="w-4 h-4 text-secondary" />
                  <span className="text-secondary">In Progress</span>
                </>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedActivities)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([date, dayActivities]) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              <div className="h-px flex-1 bg-border" />
              <Badge variant="secondary">{dayActivities.length} activities</Badge>
            </div>

            {/* Activities */}
            <div className="space-y-6">
              {dayActivities
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
            </div>
          </motion.div>
        ))}
    </div>
  );
};