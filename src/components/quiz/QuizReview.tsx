import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronLeft, ChevronRight, RotateCcw, Home, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuizAnswer } from '@/lib/gameState';

interface QuizReviewProps {
  answers: QuizAnswer[];
  onClose: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export const QuizReview: React.FC<QuizReviewProps> = ({
  answers,
  onClose,
  onRetry,
  onHome
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const accuracy = Math.round((correctAnswers / answers.length) * 100);

  const currentAnswer = answers[currentIndex];

  const nextQuestion = () => {
    if (currentIndex < answers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getOptionStyle = (optionIndex: number) => {
    const isSelected = optionIndex === currentAnswer.selectedAnswer;
    const isCorrect = optionIndex === currentAnswer.correctAnswer;
    
    if (isCorrect) {
      return "p-4 border-2 border-accent bg-accent/20 text-accent-foreground rounded-lg";
    } else if (isSelected && !isCorrect) {
      return "p-4 border-2 border-destructive bg-destructive/20 text-destructive-foreground rounded-lg";
    }
    return "p-4 border border-border bg-muted/20 rounded-lg opacity-60";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
            <Eye className="w-8 h-8 mr-3 text-primary neon-glow" />
            Quiz Review
          </h1>
          <p className="text-muted-foreground">
            Review your answers and learn from mistakes
          </p>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="gaming-card p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{correctAnswers}/{answers.length}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">
                {Math.round(answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length)}s
              </div>
              <div className="text-sm text-muted-foreground">Avg. Time</div>
            </div>
          </div>
        </motion.div>

        {/* Question Navigation */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Question</span>
            <Badge variant="secondary">
              {currentIndex + 1} of {answers.length}
            </Badge>
          </div>
          
          <Button
            variant="outline"
            onClick={nextQuestion}
            disabled={currentIndex === answers.length - 1}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Question Review Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="gaming-card">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-3">
                  {currentAnswer.isCorrect ? (
                    <Check className="w-6 h-6 text-accent" />
                  ) : (
                    <X className="w-6 h-6 text-destructive" />
                  )}
                  <span className={currentAnswer.isCorrect ? 'text-accent' : 'text-destructive'}>
                    {currentAnswer.isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                  <Badge variant="outline" className="ml-auto">
                    {currentAnswer.timeSpent}s
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Question */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">
                    {currentAnswer.question}
                  </h3>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentAnswer.options.map((option, index) => (
                    <motion.div
                      key={index}
                      className={getOptionStyle(index)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1">{option}</span>
                        {index === currentAnswer.correctAnswer && (
                          <Check className="w-5 h-5 text-accent" />
                        )}
                        {index === currentAnswer.selectedAnswer && index !== currentAnswer.correctAnswer && (
                          <X className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Explanation */}
                {!currentAnswer.isCorrect && (
                  <motion.div
                    className="p-4 bg-muted/30 rounded-lg border-l-4 border-accent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h4 className="font-semibold text-accent mb-2">💡 Explanation</h4>
                    <p className="text-sm text-muted-foreground">
                      The correct answer is <strong>{currentAnswer.options[currentAnswer.correctAnswer]}</strong>. 
                      Review this topic to improve your understanding.
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Question Dots Navigation */}
        <motion.div
          className="flex justify-center gap-2 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-8 h-8 rounded-full border-2 text-xs font-bold transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-primary border-primary text-primary-foreground scale-110'
                  : answer.isCorrect
                  ? 'border-accent text-accent hover:bg-accent/10'
                  : 'border-destructive text-destructive hover:bg-destructive/10'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            className="gaming-button-primary"
            onClick={onRetry}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button 
            className="gaming-button-secondary"
            onClick={onHome}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

      </div>
    </div>
  );
};