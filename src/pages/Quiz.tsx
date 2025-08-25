import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizCard } from '@/components/quiz/QuizCard';
import { XPBar } from '@/components/gaming/XPBar';
import { useNavigate } from 'react-router-dom';

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(2840);
  const [showResults, setShowResults] = useState(false);

  // Sample quiz questions
  const questions = [
    {
      id: '1',
      question: 'What is the primary purpose of artificial intelligence in education?',
      options: [
        'To replace human teachers completely',
        'To personalize learning experiences for students',
        'To make education more expensive',
        'To eliminate the need for textbooks'
      ],
      correctAnswer: 1,
      explanation: 'AI in education aims to personalize learning by adapting to individual student needs, learning styles, and pace, making education more effective and engaging.'
    },
    {
      id: '2',
      question: 'Which learning technique is most effective for long-term retention?',
      options: [
        'Passive reading',
        'Spaced repetition',
        'Cramming before exams',
        'Watching videos only'
      ],
      correctAnswer: 1,
      explanation: 'Spaced repetition involves reviewing information at increasing intervals, which has been proven to significantly improve long-term memory retention.'
    },
    {
      id: '3',
      question: 'What is the main benefit of gamification in learning?',
      options: [
        'It makes learning less serious',
        'It increases student motivation and engagement',
        'It reduces the need for assessments',
        'It simplifies complex topics'
      ],
      correctAnswer: 1,
      explanation: 'Gamification incorporates game elements like points, badges, and leaderboards to increase intrinsic motivation and make learning more engaging and fun.'
    }
  ];

  const handleAnswer = (isCorrect: boolean, selectedOption: number) => {
    if (isCorrect) {
      setScore(score + 1);
      setXp(xp + 10);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResults(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
  };

  if (showResults) {
    const percentage = (score / questions.length) * 100;
    const getGrade = () => {
      if (percentage >= 90) return { grade: 'A+', message: 'Outstanding! 🏆', color: 'text-xp-gold' };
      if (percentage >= 80) return { grade: 'A', message: 'Excellent work! 🌟', color: 'text-accent' };
      if (percentage >= 70) return { grade: 'B', message: 'Good job! 👍', color: 'text-secondary' };
      if (percentage >= 60) return { grade: 'C', message: 'Keep practicing! 📚', color: 'text-primary' };
      return { grade: 'D', message: 'Let\'s try again! 💪', color: 'text-muted-foreground' };
    };

    const result = getGrade();

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <nav className="flex justify-between items-center mb-8">
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

          {/* Results Card */}
          <motion.div
            className="gaming-card p-12 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-4xl font-bold mb-4">Quiz Complete!</h2>
              <div className={`text-6xl font-bold mb-4 ${result.color}`}>
                {result.grade}
              </div>
              <p className="text-xl mb-6">{result.message}</p>
            </motion.div>

            <motion.div
              className="space-y-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{score}/{questions.length}</div>
                  <div className="text-sm text-muted-foreground">Correct Answers</div>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{percentage}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>
              
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <div className="text-lg font-bold text-accent">+{score * 10} XP Earned!</div>
                <div className="text-sm text-muted-foreground">Great progress on your learning journey</div>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button 
                className="gaming-button-primary"
                onClick={resetQuiz}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                className="gaming-button-secondary"
                onClick={() => navigate('/dashboard')}
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <nav className="flex justify-between items-center mb-8">
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

        {/* Progress Section */}
        <div className="mb-8 space-y-4">
          <XPBar 
            currentXP={xp}
            maxXP={3000}
            level={12}
            className="max-w-2xl mx-auto"
          />
          
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="w-full max-w-md mx-auto bg-muted rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-xp rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Quiz Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
        >
          <QuizCard
            question={questions[currentQuestion]}
            onAnswer={handleAnswer}
            timeLimit={30}
          />
        </motion.div>

        {/* Score Display */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="gaming-card p-4 inline-block">
            <div className="text-sm text-muted-foreground mb-1">Current Score</div>
            <div className="text-2xl font-bold text-primary">
              {score}/{currentQuestion + (showResults ? 0 : 1)}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Quiz;