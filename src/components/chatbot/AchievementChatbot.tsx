import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface AchievementChatbotProps {
  userStats?: {
    totalXP: number;
    level: number;
    streak: number;
    quizzesCompleted: number;
    averageScore: number;
    totalStudyTime: number;
    perfectScores: number;
    subjectsCompleted: number;
  };
}

const AchievementChatbot: React.FC<AchievementChatbotProps> = ({ userStats }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Achievement Assistant. Ask me about badges, progress, or how to unlock new achievements! 🏆",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Achievement-specific responses
    if (message.includes('badge') || message.includes('achievement')) {
      return `You currently have ${userStats?.level || 1} level and ${userStats?.totalXP || 0} XP! Keep completing quizzes to unlock more badges. Focus on accuracy and consistency to earn rare achievements! 🎯`;
    }
    
    if (message.includes('streak')) {
      const streak = userStats?.streak || 0;
      if (streak >= 7) {
        return `Amazing! You have a ${streak}-day streak! 🔥 You've already unlocked the Consistent Learner badge. Keep it up!`;
      } else {
        return `You currently have a ${streak}-day streak. Reach 7 days to unlock the Consistent Learner badge! Study daily to maintain your momentum! 📚`;
      }
    }
    
    if (message.includes('level') || message.includes('xp')) {
      const level = userStats?.level || 1;
      const xp = userStats?.totalXP || 0;
      return `You're currently level ${level} with ${xp} XP! Complete more quizzes to gain XP and level up. Each quiz gives you XP based on your performance! ⚡`;
    }
    
    if (message.includes('perfect') || message.includes('100%')) {
      const perfectScores = userStats?.perfectScores || 0;
      return `You have ${perfectScores} perfect scores! Get 3 perfect scores to unlock the "Perfect Score" achievement. Take your time and read questions carefully! ⭐`;
    }
    
    if (message.includes('speed') || message.includes('fast')) {
      return `To unlock the Speed Demon badge, maintain an average response time under 5 seconds! Practice with easier topics first to build speed, then tackle harder questions! 🚀`;
    }
    
    if (message.includes('subject') || message.includes('topic')) {
      const subjects = userStats?.subjectsCompleted || 0;
      return `You've completed quizzes in ${subjects} different subjects! Complete quizzes in 5 different subjects to unlock the Subject Explorer badge! 🌟`;
    }
    
    if (message.includes('accuracy') || message.includes('score')) {
      const accuracy = userStats?.averageScore || 0;
      return `Your current accuracy is ${accuracy}%. Maintain 80%+ accuracy over 20 quizzes to unlock the High Achiever badge! Focus on understanding rather than speed! 🎯`;
    }
    
    if (message.includes('help') || message.includes('how')) {
      return `Here are some tips: 📝\n• Study daily to maintain streaks\n• Read questions carefully for accuracy\n• Try different subjects for variety\n• Practice regularly to improve speed\n• Aim for perfect scores when possible!`;
    }
    
    if (message.includes('tip') || message.includes('advice')) {
      const tips = [
        "Focus on accuracy over speed - many badges require high accuracy! 🎯",
        "Study daily to build your streak - even 10 minutes counts! 🔥",
        "Try quizzes in different subjects to unlock the Subject Explorer badge! 📚",
        "Take your time on harder questions to maintain your accuracy! ⏰",
        "Review your mistakes to improve your performance! 📈"
      ];
      return tips[Math.floor(Math.random() * tips.length)];
    }
    
    // Default responses
    const responses = [
      "That's a great question! For specific achievement tips, try asking about badges, streaks, or accuracy! 🤔",
      "I'm here to help with achievements! Ask me about unlocking badges, improving your level, or building streaks! 🏆",
      "Need help with a specific achievement? Ask me about perfect scores, speed, subjects, or your current progress! 💪",
      "I can help you understand how to unlock different badges! What specific achievement are you working towards? 🎯"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot thinking delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-card border border-border rounded-lg shadow-xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">Achievement Assistant</span>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                size="icon"
                variant="ghost"
                className="w-8 h-8 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 h-64">
              <div className="space-y-3">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-lg ${
                        message.isBot
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.isBot && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        {!message.isBot && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about achievements..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AchievementChatbot;