import React from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Clock, FileText, TrendingUp, CalendarDays, BarChart3, Award } from 'lucide-react';
import { ActivityTimeline, ActivityItem } from '@/components/history/ActivityTimeline';
import { StatsCard } from '@/components/gaming/StatsCard';

const History = () => {
  // Mock activity data
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'quiz',
      title: 'Mathematics Quiz #15',
      description: 'Algebra and Calculus fundamentals',
      timestamp: new Date('2024-01-20T14:30:00'),
      metadata: {
        score: 92,
        duration: 25,
        subject: 'Mathematics',
        difficulty: 'hard',
        xpEarned: 150,
        questionsAnswered: 12,
        correctAnswers: 11
      },
      status: 'completed'
    },
    {
      id: '2',
      type: 'achievement',
      title: 'Speed Demon Unlocked!',
      description: 'Answered 10 questions under 5 seconds each',
      timestamp: new Date('2024-01-20T14:55:00'),
      metadata: {
        xpEarned: 250
      },
      status: 'completed'
    },
    {
      id: '3',
      type: 'research',
      title: 'AI Research Session',
      description: 'Explored machine learning concepts',
      timestamp: new Date('2024-01-20T10:15:00'),
      metadata: {
        duration: 45,
        subject: 'Computer Science'
      },
      status: 'completed'
    },
    {
      id: '4',
      type: 'quiz',
      title: 'Physics Quiz #8',
      description: 'Quantum mechanics and thermodynamics',
      timestamp: new Date('2024-01-19T16:20:00'),
      metadata: {
        score: 78,
        duration: 32,
        subject: 'Physics',
        difficulty: 'medium',
        xpEarned: 120,
        questionsAnswered: 15,
        correctAnswers: 12
      },
      status: 'completed'
    },
    {
      id: '5',
      type: 'study',
      title: 'History Study Session',
      description: 'World War II timeline and events',
      timestamp: new Date('2024-01-19T13:45:00'),
      metadata: {
        duration: 60,
        subject: 'History'
      },
      status: 'completed'
    },
    {
      id: '6',
      type: 'quiz',
      title: 'Chemistry Quiz #12',
      description: 'Organic chemistry reactions',
      timestamp: new Date('2024-01-19T09:30:00'),
      metadata: {
        score: 65,
        duration: 28,
        subject: 'Chemistry',
        difficulty: 'hard',
        xpEarned: 80,
        questionsAnswered: 10,
        correctAnswers: 7
      },
      status: 'failed'
    },
    {
      id: '7',
      type: 'milestone',
      title: 'Level 12 Reached!',
      description: 'Congratulations on reaching level 12',
      timestamp: new Date('2024-01-18T18:00:00'),
      metadata: {
        xpEarned: 500
      },
      status: 'completed'
    },
    {
      id: '8',
      type: 'quiz',
      title: 'Literature Quiz #6',
      description: 'Shakespeare and modern poetry',
      timestamp: new Date('2024-01-18T15:20:00'),
      metadata: {
        score: 88,
        duration: 20,
        subject: 'Literature',
        difficulty: 'medium',
        xpEarned: 130,
        questionsAnswered: 8,
        correctAnswers: 7
      },
      status: 'completed'
    }
  ];

  // Calculate summary stats
  const totalActivities = activities.length;
  const completedQuizzes = activities.filter(a => a.type === 'quiz' && a.status === 'completed').length;
  const totalStudyTime = activities.reduce((sum, a) => sum + (a.metadata.duration || 0), 0);
  const averageScore = activities
    .filter(a => a.type === 'quiz' && a.metadata.score)
    .reduce((sum, a, _, arr) => sum + (a.metadata.score! / arr.length), 0);

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
            <HistoryIcon className="w-8 h-8 mr-3 text-primary neon-glow" />
            Learning History
          </h1>
          <p className="text-muted-foreground text-lg">Track your complete learning journey</p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatsCard
            title="Total Activities"
            value={totalActivities.toString()}
            subtitle="All time"
            icon={CalendarDays}
            trend="up"
            trendValue="+5 this week"
            color="primary"
          />
          
          <StatsCard
            title="Quizzes Completed"
            value={completedQuizzes.toString()}
            subtitle="Successfully finished"
            icon={TrendingUp}
            trend="up"
            trendValue="+3 this week"
            color="accent"
          />
          
          <StatsCard
            title="Study Time"
            value={`${Math.round(totalStudyTime / 60)}h`}
            subtitle={`${totalStudyTime % 60}m total`}
            icon={Clock}
            trend="up"
            trendValue="+2.5h this week"
            color="secondary"
          />
          
          <StatsCard
            title="Average Score"
            value={`${Math.round(averageScore)}%`}
            subtitle="Quiz performance"
            icon={BarChart3}
            trend="up"
            trendValue="+5% improvement"
            color="primary"
          />
        </motion.div>

        {/* Filter Options */}
        <motion.div
          className="gaming-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-accent">
                {activities.filter(a => a.type === 'achievement').length}
              </div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-secondary">
                {activities.filter(a => a.type === 'research').length}
              </div>
              <div className="text-sm text-muted-foreground">Research Sessions</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {activities.filter(a => a.type === 'milestone').length}
              </div>
              <div className="text-sm text-muted-foreground">Milestones</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-xp-gold">
                {activities.reduce((sum, a) => sum + (a.metadata.xpEarned || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <ActivityTimeline activities={activities} />
        </motion.div>

        {/* Learning Insights */}
        <motion.div
          className="gaming-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <Award className="w-6 h-6 mr-2 text-primary neon-glow" />
            Learning Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <h4 className="font-semibold text-accent mb-2">🎯 Best Subject</h4>
              <p className="text-sm text-muted-foreground">
                Mathematics - 92% average score across 5 quizzes
              </p>
            </div>
            <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
              <h4 className="font-semibold text-secondary mb-2">📈 Improvement Area</h4>
              <p className="text-sm text-muted-foreground">
                Chemistry needs focus - try more practice quizzes
              </p>
            </div>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">⏰ Peak Performance</h4>
              <p className="text-sm text-muted-foreground">
                Afternoon sessions (2-4 PM) show 15% better scores
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default History;