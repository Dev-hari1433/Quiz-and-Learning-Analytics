import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, User } from 'lucide-react';

interface NamePromptProps {
  onNameSubmit: (name: string) => void;
  title?: string;
  description?: string;
}

const NamePrompt: React.FC<NamePromptProps> = ({ 
  onNameSubmit, 
  title = "Welcome to Smart AI Learning!",
  description = "Enter your name to start learning and track your progress"
}) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmit(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="gaming-card">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center"
            >
              <Brain className="w-8 h-8 text-primary neon-glow" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                    minLength={2}
                    maxLength={50}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gaming-button-primary"
                disabled={!name.trim()}
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>Start Learning</span>
                </div>
              </Button>
            </form>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg"
            >
              <h4 className="font-semibold text-sm text-primary mb-2">What you can do:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Take AI-powered quizzes</li>
                <li>• Use smart research tools</li>
                <li>• Track your progress & analytics</li>
                <li>• Earn achievements & compete</li>
                <li>• View detailed learning history</li>
              </ul>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default NamePrompt;