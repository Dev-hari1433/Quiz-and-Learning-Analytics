import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionUser } from '@/hooks/useSessionUser';
import { useToast } from '@/components/ui/use-toast';

interface Achievement {
  id: string;
  user_id: string;
  user_name: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  points_earned: number;
  unlocked_at: string;
}

const RealTimeAchievementNotification: React.FC = () => {
  const { sessionUser } = useSessionUser();
  const { toast } = useToast();
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [showingAchievement, setShowingAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    if (!sessionUser) return;

    // Subscribe to new achievements
    const achievementChannel = supabase
      .channel('new_achievements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${sessionUser.sessionId}`
        },
        (payload) => {
          const newAchievement = payload.new as Achievement;
          console.log('🏆 New achievement unlocked:', newAchievement);
          
          // Add to queue
          setNewAchievements(prev => [...prev, newAchievement]);
          
          // Show toast notification
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${newAchievement.achievement_name} - ${newAchievement.description}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(achievementChannel);
    };
  }, [sessionUser, toast]);

  // Process achievement queue
  useEffect(() => {
    if (newAchievements.length > 0 && !showingAchievement) {
      const nextAchievement = newAchievements[0];
      setShowingAchievement(nextAchievement);
      setNewAchievements(prev => prev.slice(1));

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowingAchievement(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [newAchievements, showingAchievement]);

  const getAchievementIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'quiz_1':
      case 'quiz_5':
        return Trophy;
      case 'accuracy_80':
      case 'accuracy_100':
        return Star;
      case 'research_5':
        return Award;
      default:
        return Zap;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'accuracy_100':
        return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
      case 'quiz_5':
      case 'research_5':
        return 'text-purple-500 bg-purple-500/20 border-purple-500/30';
      case 'accuracy_80':
        return 'text-blue-500 bg-blue-500/20 border-blue-500/30';
      default:
        return 'text-primary bg-primary/20 border-primary/30';
    }
  };

  return (
    <AnimatePresence>
      {showingAchievement && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-sm"
          initial={{ x: 400, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 400, opacity: 0, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20 
          }}
        >
          <motion.div
            className={`p-4 border rounded-lg backdrop-blur-sm ${getAchievementColor(showingAchievement.achievement_type)}`}
            animate={{
              boxShadow: [
                "0 0 0px rgba(255, 255, 255, 0)",
                "0 0 20px rgba(255, 255, 255, 0.3)",
                "0 0 0px rgba(255, 255, 255, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-start space-x-3">
              <motion.div
                className="flex-shrink-0"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.8, 
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                {React.createElement(getAchievementIcon(showingAchievement.achievement_type), {
                  className: "w-8 h-8"
                })}
              </motion.div>
              <div className="flex-1 min-w-0">
                <motion.h3 
                  className="font-bold text-lg"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Achievement Unlocked!
                </motion.h3>
                <motion.p 
                  className="font-semibold"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {showingAchievement.achievement_name}
                </motion.p>
                <motion.p 
                  className="text-sm opacity-90"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {showingAchievement.description}
                </motion.p>
                <motion.p 
                  className="text-xs font-medium mt-1"
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  +{showingAchievement.points_earned} XP
                </motion.p>
              </div>
              <motion.button
                className="flex-shrink-0 text-sm opacity-70 hover:opacity-100"
                onClick={() => setShowingAchievement(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RealTimeAchievementNotification;