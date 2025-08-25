import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Brain, Home, Medal, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeaderboardPodium } from '@/components/leaderboard/LeaderboardPodium';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
  const navigate = useNavigate();

  // Sample leaderboard data
  const topStudents = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: '👩‍💻',
      score: 2850,
      level: 15,
      streak: 21,
      rank: 1,
      totalQuizzes: 89,
      accuracy: 94
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      avatar: '👨‍🎓',
      score: 2720,
      level: 14,
      streak: 18,
      rank: 2,
      totalQuizzes: 76,
      accuracy: 91
    },
    {
      id: '3',
      name: 'Alex Chen',
      avatar: '🧠',
      score: 2680,
      level: 12,
      streak: 7,
      rank: 3,
      totalQuizzes: 65,
      accuracy: 89
    },
    {
      id: '4',
      name: 'Emma Thompson',
      avatar: '📚',
      score: 2550,
      level: 13,
      streak: 12,
      rank: 4,
      totalQuizzes: 71,
      accuracy: 87
    },
    {
      id: '5',
      name: 'David Kim',
      avatar: '🔬',
      score: 2480,
      level: 11,
      streak: 9,
      rank: 5,
      totalQuizzes: 58,
      accuracy: 86
    },
    {
      id: '6',
      name: 'Sophie Wilson',
      avatar: '🎨',
      score: 2420,
      level: 12,
      streak: 15,
      rank: 6,
      totalQuizzes: 63,
      accuracy: 84
    },
    {
      id: '7',
      name: 'James Park',
      avatar: '⚡',
      score: 2380,
      level: 10,
      streak: 6,
      rank: 7,
      totalQuizzes: 55,
      accuracy: 83
    }
  ];

  const topThree = topStudents.slice(0, 3);
  const otherPlayers = topStudents.slice(3);

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
            Global <span className="bg-gradient-primary bg-clip-text text-transparent">Leaderboard</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            See how you rank against learners worldwide
          </p>
        </motion.div>

        {/* Top 3 Podium */}
        <LeaderboardPodium topThree={topThree} />

        {/* Detailed Rankings */}
        <div className="gaming-card p-6">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-primary neon-glow" />
            Top Performers
          </h3>
          
          <div className="space-y-3">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-muted-foreground pb-3 border-b border-border">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Player</div>
              <div className="col-span-2">Score</div>
              <div className="col-span-2">Level</div>
              <div className="col-span-2">Streak</div>
              <div className="col-span-1">Accuracy</div>
            </div>

            {/* Top 3 in list view */}
            {topThree.map((student, index) => (
              <motion.div
                key={student.id}
                className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg border ${getRankColor(student.rank)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="col-span-1 flex items-center justify-center">
                  {getRankIcon(student.rank)}
                </div>
                
                <div className="col-span-4 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg">
                    {student.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{student.name}</div>
                    <div className="text-xs text-muted-foreground">{student.totalQuizzes} quizzes</div>
                  </div>
                </div>
                
                <div className="col-span-2 font-bold text-primary">
                  {student.score.toLocaleString()}
                </div>
                
                <div className="col-span-2">
                  <div className="gaming-button-secondary px-2 py-1 rounded text-xs font-bold inline-block">
                    Level {student.level}
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center space-x-1">
                    <span>🔥</span>
                    <span className="font-semibold">{student.streak}</span>
                  </div>
                </div>
                
                <div className="col-span-1 text-accent font-semibold">
                  {student.accuracy}%
                </div>
              </motion.div>
            ))}

            {/* Rest of the players */}
            {otherPlayers.map((student, index) => (
              <motion.div
                key={student.id}
                className="grid grid-cols-12 gap-4 items-center p-4 rounded-lg border border-border/30 bg-card/50 hover:bg-card/80 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: (index + 3) * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <div className="col-span-1 flex items-center justify-center">
                  {getRankIcon(student.rank)}
                </div>
                
                <div className="col-span-4 flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center text-lg">
                    {student.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{student.name}</div>
                    <div className="text-xs text-muted-foreground">{student.totalQuizzes} quizzes</div>
                  </div>
                </div>
                
                <div className="col-span-2 font-bold">
                  {student.score.toLocaleString()}
                </div>
                
                <div className="col-span-2">
                  <div className="bg-muted px-2 py-1 rounded text-xs font-semibold inline-block">
                    Level {student.level}
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center space-x-1">
                    <span>🔥</span>
                    <span>{student.streak}</span>
                  </div>
                </div>
                
                <div className="col-span-1 text-muted-foreground">
                  {student.accuracy}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>

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
              onClick={() => navigate('/quiz')}
            >
              <Brain className="w-4 h-4 mr-2" />
              Take Quiz to Climb
            </Button>
            <Button 
              className="gaming-button-secondary"
              onClick={() => navigate('/dashboard')}
            >
              View Your Progress
            </Button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Leaderboard;
