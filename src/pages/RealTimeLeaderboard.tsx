import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Brain, Home, Medal, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardPodium } from '@/components/leaderboard/LeaderboardPodium';
import { useNavigate } from 'react-router-dom';
import { useRealTimeData } from '@/hooks/useRealTimeData';

const RealTimeLeaderboard = () => {
  const navigate = useNavigate();
  const { allUserStats, loading } = useRealTimeData();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  // Transform real user data for leaderboard display
  const transformedUsers = allUserStats.map((user, index) => ({
    id: user.id || user.user_name,
    name: user.user_name,
    avatar: getRandomAvatar(index),
    score: user.total_xp,
    level: user.level,
    streak: user.streak,
    rank: index + 1,
    totalQuizzes: user.total_quizzes,
    accuracy: user.total_questions > 0 ? Math.round((user.total_correct_answers / user.total_questions) * 100) : 0
  }));

  const topThree = transformedUsers.slice(0, 3);
  const otherPlayers = transformedUsers.slice(3);

  function getRandomAvatar(index: number): string {
    const avatars = ['👩‍💻', '👨‍🎓', '🧠', '📚', '🔬', '🎨', '⚡', '🚀', '💡', '⭐'];
    return avatars[index % avatars.length];
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-xp-gold" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-xp-silver" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-xp-bronze" />;
    return <div className="w-5 h-5 flex items-center justify-center text-xs font-bold">{rank}</div>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'border-xp-gold/30 bg-xp-gold/5';
    if (rank === 2) return 'border-xp-silver/30 bg-xp-silver/5';
    if (rank === 3) return 'border-xp-bronze/30 bg-xp-bronze/5';
    return 'border-border/30 bg-muted/20';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-primary neon-glow" />
            <span className="text-2xl font-bold">EduQuizAI</span>
          </div>
          <Button 
            variant="outline" 
            className="gaming-card"
            onClick={() => navigate('/dashboard')}
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </nav>

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Live <span className="bg-gradient-primary bg-clip-text text-transparent">Leaderboard</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time rankings updated automatically
          </p>
        </motion.div>

        {/* Show message if no users yet */}
        {transformedUsers.length === 0 ? (
          <motion.div
            className="text-center gaming-card p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Learners Yet!</h2>
            <p className="text-muted-foreground mb-6">
              Be the first to take a quiz and appear on the leaderboard!
            </p>
            <Button 
              className="gaming-button-primary"
              onClick={() => navigate('/generate-quiz')}
            >
              <Brain className="w-4 h-4 mr-2" />
              Take Your First Quiz
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {topThree.length > 0 && <LeaderboardPodium topThree={topThree} />}

            {/* Detailed Rankings */}
            <div className="gaming-card p-6">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-primary neon-glow" />
                Live Rankings ({transformedUsers.length} Learners)
              </h3>
              
              <div className="space-y-3">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-muted-foreground pb-3 border-b border-border">
                  <div className="col-span-1">Rank</div>
                  <div className="col-span-4">Learner</div>
                  <div className="col-span-2">XP Score</div>
                  <div className="col-span-2">Level</div>
                  <div className="col-span-2">Streak</div>
                  <div className="col-span-1">Accuracy</div>
                </div>

                {/* All Users */}
                {transformedUsers.map((student, index) => (
                  <motion.div
                    key={student.id}
                    className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg border ${
                      index < 3 ? getRankColor(student.rank) : 'border-border/30 bg-card/50 hover:bg-card/80'
                    } transition-colors`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="col-span-1 flex items-center justify-center">
                      {getRankIcon(student.rank)}
                    </div>
                    
                    <div className="col-span-4 flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${
                        index < 3 
                          ? 'bg-gradient-to-br from-primary/20 to-secondary/20' 
                          : 'bg-gradient-to-br from-muted/20 to-muted/40'
                      } flex items-center justify-center text-lg`}>
                        {student.avatar}
                      </div>
                      <div>
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.totalQuizzes} quizzes</div>
                      </div>
                    </div>
                    
                    <div className={`col-span-2 font-bold ${index < 3 ? 'text-primary' : ''}`}>
                      {student.score.toLocaleString()}
                    </div>
                    
                    <div className="col-span-2">
                      <div className={`px-2 py-1 rounded text-xs font-bold inline-block ${
                        index < 3 ? 'gaming-button-secondary' : 'bg-muted'
                      }`}>
                        Level {student.level}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <div className="flex items-center space-x-1">
                        <span>🔥</span>
                        <span className={index < 3 ? 'font-semibold' : ''}>{student.streak}</span>
                      </div>
                    </div>
                    
                    <div className={`col-span-1 ${index < 3 ? 'text-accent font-semibold' : 'text-muted-foreground'}`}>
                      {student.accuracy}%
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="gaming-button-primary"
              onClick={() => navigate('/generate-quiz')}
            >
              <Brain className="w-4 h-4 mr-2" />
              Take Quiz to Climb
            </Button>
            <Button 
              className="gaming-button-secondary"
              onClick={() => navigate('/smart-research')}
            >
              Research & Learn
            </Button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default RealTimeLeaderboard;