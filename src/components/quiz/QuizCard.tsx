import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Brain, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizCardProps {
  question: QuizQuestion;
  onAnswer: (isCorrect: boolean, selectedOption: number) => void;
  timeLimit?: number;
  className?: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  onAnswer,
  timeLimit = 30,
  className = ""
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isFlipped, setIsFlipped] = useState(false);

  React.useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(-1); // Auto-submit when time runs out
    }
  }, [timeLeft, showResult]);

  const handleAnswer = (optionIndex: number) => {
    if (showResult) return;
    
    setSelectedOption(optionIndex);
    setShowResult(true);
    setIsFlipped(true);
    
    const isCorrect = optionIndex === question.correctAnswer;
    setTimeout(() => onAnswer(isCorrect, optionIndex), 1000);
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) return "gaming-card hover:bg-primary/10 cursor-pointer";
    
    if (index === question.correctAnswer) {
      return "gaming-card bg-accent/20 border-accent text-accent-foreground";
    } else if (index === selectedOption) {
      return "gaming-card bg-destructive/20 border-destructive text-destructive-foreground";
    }
    return "gaming-card opacity-50";
  };

  return (
    <div className={`flip-card w-full max-w-2xl mx-auto ${isFlipped ? 'flipped' : ''} ${className}`}>
      <div className="flip-card-inner">
        {/* Front of card - Question */}
        <div className="flip-card-front">
          <motion.div
            className="gaming-card p-8 h-full min-h-[400px] flex flex-col"
            initial={{ rotateY: 0 }}
            animate={{ rotateY: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-primary neon-glow" />
                <span className="text-lg font-bold">Quiz Challenge</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-secondary" />
                <motion.span
                  className={`font-mono text-lg ${timeLeft <= 5 ? 'text-destructive pulse-glow' : 'text-secondary'}`}
                  key={timeLeft}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {timeLeft}s
                </motion.span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-muted rounded-full mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-xp"
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / timeLimit) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col justify-center">
              <motion.h3
                className="text-xl font-bold text-center mb-8 text-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {question.question}
              </motion.h3>

              {/* Options */}
              <div className="space-y-4">
                <AnimatePresence>
                  {/* GUARANTEE: Always render exactly 4 options */}
                  {Array.from({ length: 4 }, (_, index) => {
                    const option = (question.options || [])[index] || `Option ${String.fromCharCode(65 + index)}`;
                    return (
                    <motion.div
                      key={`option-${index}`}
                      className={getOptionStyle(index)}
                      onClick={() => handleAnswer(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                    >
                      <div className="p-4 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1">{option}</span>
                        {showResult && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            {index === question.correctAnswer ? (
                              <Check className="w-6 h-6 text-accent" />
                            ) : index === selectedOption ? (
                              <X className="w-6 h-6 text-destructive" />
                            ) : null}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                  }).slice(0, 4)}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Back of card - Result */}
        <div className="flip-card-back">
          <motion.div
            className="gaming-card p-8 h-full min-h-[400px] flex flex-col justify-center items-center text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              {selectedOption === question.correctAnswer ? (
                <div className="text-accent">
                  <Check className="w-16 h-16 mx-auto mb-4 neon-glow" />
                  <h3 className="text-2xl font-bold mb-2">Correct!</h3>
                  <p className="text-accent-foreground">+10 XP Earned</p>
                </div>
              ) : (
                <div className="text-destructive">
                  <X className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">
                    {selectedOption === -1 ? 'Time\'s Up!' : 'Incorrect'}
                  </h3>
                  <p className="text-muted-foreground">Better luck next time!</p>
                </div>
              )}
            </motion.div>

            {question.explanation && (
              <motion.div
                className="mt-6 p-4 bg-muted/50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h4 className="font-semibold mb-2">Explanation:</h4>
                <p className="text-sm text-muted-foreground">{question.explanation}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};