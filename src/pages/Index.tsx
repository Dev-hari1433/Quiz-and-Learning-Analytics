import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Trophy, Target, Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EducationScene } from '@/components/3d/EducationScene';
import { useNavigate } from 'react-router-dom';
import { useSessionUser } from '@/hooks/useSessionUser';
import NamePrompt from '@/components/NamePrompt';

const Index = () => {
  const navigate = useNavigate();
  const { sessionUser, setUserName, clearSession, isLoggedIn } = useSessionUser();

  if (!isLoggedIn) {
    return <NamePrompt onNameSubmit={setUserName} />;
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* 3D Background Scene */}
      <EducationScene />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Navigation */}
        <nav className="p-6 flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Brain className="w-8 h-8 text-primary neon-glow" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              EduQuizAI
            </span>
          </motion.div>
          
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-sm text-muted-foreground mr-4">
              Welcome, {sessionUser?.name}!
            </span>
            <Button 
              variant="outline" 
              className="gaming-card border-primary/30 hover:bg-primary/10"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={clearSession}
            >
              Change Name
            </Button>
          </motion.div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto">
            
            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                Learn Smarter with{' '}
                <span className="bg-gradient-primary bg-clip-text text-transparent neon-glow">
                  AI Power
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
                Transform your education with gamified AI quizzes, personalized feedback, 
                and immersive 3D learning experiences.
              </p>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="gaming-card p-6 text-center">
                <Zap className="w-12 h-12 text-secondary mx-auto mb-4 neon-glow" />
                <h3 className="text-lg font-bold mb-2">AI Quiz Generation</h3>
                <p className="text-sm text-muted-foreground">
                  Intelligent questions adapted to your learning style and progress
                </p>
              </div>
              
              <div className="gaming-card p-6 text-center">
                <Target className="w-12 h-12 text-accent mx-auto mb-4 neon-glow" />
                <h3 className="text-lg font-bold mb-2">Personalized Learning</h3>
                <p className="text-sm text-muted-foreground">
                  Smart recommendations and difficulty adjustment based on performance
                </p>
              </div>
              
              <div className="gaming-card p-6 text-center">
                <Trophy className="w-12 h-12 text-xp-gold mx-auto mb-4 neon-glow" />
                <h3 className="text-lg font-bold mb-2">Gamified Progress</h3>
                <p className="text-sm text-muted-foreground">
                  XP system, achievements, and leaderboards to keep you motivated
                </p>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Button 
                className="gaming-button-primary text-lg px-8 py-4 h-auto group"
                onClick={() => navigate('/dashboard')}
              >
                <Play className="w-6 h-6 mr-2" />
                Go to Dashboard
                <motion.div
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Button>
              
              <Button 
                variant="outline"
                className="gaming-card border-primary/30 hover:bg-primary/10 text-lg px-8 py-4 h-auto"
                onClick={() => navigate('/generate-quiz')}
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              className="gaming-card p-6 mt-16 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">500K+</div>
                  <div className="text-sm text-muted-foreground">Quizzes Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
        
        {/* Floating Particles Effect */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        {/* Footer */}
        
      </div>
    </div>
  );
};

export default Index;
