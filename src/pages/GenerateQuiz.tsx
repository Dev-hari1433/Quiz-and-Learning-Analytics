import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { QuizGenerator } from '@/components/quiz/QuizGenerator';

interface GeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
}

const GenerateQuiz = () => {
  const navigate = useNavigate();
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);

  const handleQuizGenerated = (questions: GeneratedQuestion[]) => {
    setGeneratedQuestions(questions);
    // Store questions in localStorage or state management
    localStorage.setItem('generatedQuiz', JSON.stringify(questions));
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
            <Brain className="w-8 h-8 mr-3 text-primary neon-glow" />
            AI Quiz Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload any document and let AI create personalized quiz questions
          </p>
        </motion.div>

        {/* Quiz Generator Component */}
        <QuizGenerator onQuizGenerated={handleQuizGenerated} />
      </div>
    </div>
  );
};

export default GenerateQuiz;