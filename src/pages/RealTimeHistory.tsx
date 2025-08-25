import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Clock, FileText, TrendingUp, CalendarDays, BarChart3, Award, Trash2 } from 'lucide-react';
import { ActivityTimeline, ActivityItem } from '@/components/history/ActivityTimeline';
import { RealTimeActivityTimeline } from '@/components/history/RealTimeActivityTimeline';
import { StatsCard } from '@/components/gaming/StatsCard';
import { GameStateManager, QuizResult } from '@/lib/gameState';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

const RealTimeHistory = () => {
  const [gameState, setGameState] = useState(GameStateManager.getInstance().getState());
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = GameStateManager.getInstance().subscribe(setGameState);
    return unsubscribe;
  }, []);

  // Convert quiz history to activity items
  const activities: ActivityItem[] = gameState.quizHistory.map(quiz => ({
    id: quiz.id,
    type: 'quiz',
    title: quiz.title,
    description: `${quiz.subject} - ${quiz.difficulty} difficulty`,
    timestamp: quiz.timestamp,
    metadata: {
      score: Math.round((quiz.correctAnswers / quiz.totalQuestions) * 100),
      duration: quiz.timeSpent,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      xpEarned: Math.round(quiz.correctAnswers * 10 * (quiz.difficulty === 'hard' ? 2 : quiz.difficulty === 'medium' ? 1.5 : 1)),
      questionsAnswered: quiz.totalQuestions,
      correctAnswers: quiz.correctAnswers
    },
    status: quiz.correctAnswers / quiz.totalQuestions >= 0.6 ? 'completed' : 'failed'
  }));

  // Add achievement milestones
  const achievementActivities: ActivityItem[] = [];
  if (gameState.level > 1) {
    for (let level = 2; level <= gameState.level; level++) {
      achievementActivities.push({
        id: `level-${level}`,
        type: 'milestone',
        title: `Level ${level} Reached!`,
        description: `Congratulations on reaching level ${level}`,
        timestamp: new Date(Date.now() - (gameState.level - level) * 24 * 60 * 60 * 1000),
        metadata: {
          xpEarned: level * 100
        },
        status: 'completed'
      });
    }
  }

  const allActivities = [...activities, ...achievementActivities].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  // Calculate summary stats
  const totalActivities = allActivities.length;
  const completedQuizzes = activities.filter(a => a.status === 'completed').length;
  const totalStudyTime = gameState.studyTime;
  const averageScore = gameState.totalQuestions > 0 
    ? Math.round((gameState.totalCorrectAnswers / gameState.totalQuestions) * 100) 
    : 0;

  const handleClearHistory = () => {
    GameStateManager.getInstance().resetData();
    toast({
      title: "History cleared",
      description: "All learning history has been reset.",
    });
  };

  if (totalActivities === 0) {
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

          {/* Empty State */}
          <motion.div 
            className="gaming-card p-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
              <HistoryIcon className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Start Your Learning Journey!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Take your first quiz or explore learning materials to see your activity history here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="gaming-button-primary"
                onClick={() => window.location.href = '/generate-quiz'}
              >
                Create Your First Quiz
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/smart-research'}
              >
                Start Smart Research
              </Button>
            </div>
          </motion.div>

          {/* Real-time Activity Feed */}
          <RealTimeActivityTimeline />
        </div>
      </div>
    );
  }

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
            trendValue={`${activities.length} quizzes`}
            color="primary"
          />
          
          <StatsCard
            title="Quizzes Completed"
            value={completedQuizzes.toString()}
            subtitle="Successfully finished"
            icon={TrendingUp}
            trend="up"
            trendValue={`${Math.round((completedQuizzes / Math.max(activities.length, 1)) * 100)}% success rate`}
            color="accent"
          />
          
          <StatsCard
            title="Study Time"
            value={`${Math.floor(totalStudyTime / 60)}h`}
            subtitle={`${totalStudyTime % 60}m total`}
            icon={Clock}
            trend="up"
            trendValue="Keep it up!"
            color="secondary"
          />
          
          <StatsCard
            title="Average Score"
            value={`${averageScore}%`}
            subtitle="Quiz performance"
            icon={BarChart3}
            trend={averageScore >= 70 ? "up" : "down"}
            trendValue={averageScore >= 70 ? "Great job!" : "Room to improve"}
            color="primary"
          />
        </motion.div>

        {/* Activity Tabs */}
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="gaming-card grid w-full grid-cols-2">
            <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
            <TabsTrigger value="realtime">Live Feed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              className="gaming-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Activity Overview</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-accent">
                    {achievementActivities.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Milestones</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">
                    {gameState.totalQuizzes}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Quizzes</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {gameState.level}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Level</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-xp-gold">
                    {gameState.totalXP}
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
              <ActivityTimeline activities={allActivities} />
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
                  <h4 className="font-semibold text-accent mb-2">🎯 Progress</h4>
                  <p className="text-sm text-muted-foreground">
                    Level {gameState.level} - Keep learning to advance further!
                  </p>
                </div>
                <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                  <h4 className="font-semibold text-secondary mb-2">📈 Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    {averageScore}% average score - {averageScore >= 80 ? 'Excellent!' : 'Keep practicing!'}
                  </p>
                </div>
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <h4 className="font-semibold text-primary mb-2">⏰ Activity</h4>
                  <p className="text-sm text-muted-foreground">
                    {totalStudyTime} minutes of focused learning time
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="realtime">
            <RealTimeActivityTimeline />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RealTimeHistory;