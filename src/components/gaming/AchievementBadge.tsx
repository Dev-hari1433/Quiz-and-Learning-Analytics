import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Target } from 'lucide-react';

interface AchievementBadgeProps {
  type: 'gold' | 'silver' | 'bronze' | 'special';
  title: string;
  description: string;
  icon?: 'trophy' | 'star' | 'zap' | 'target';
  earned?: boolean;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  type,
  title,
  description,
  icon = 'trophy',
  earned = false,
  className = ""
}) => {
  const getColorClass = () => {
    switch (type) {
      case 'gold': return 'text-xp-gold';
      case 'silver': return 'text-xp-silver';
      case 'bronze': return 'text-xp-bronze';
      case 'special': return 'text-neon-purple';
      default: return 'text-muted-foreground';
    }
  };

  const getIconComponent = () => {
    switch (icon) {
      case 'star': return Star;
      case 'zap': return Zap;
      case 'target': return Target;
      default: return Trophy;
    }
  };

  const IconComponent = getIconComponent();
  const colorClass = getColorClass();

  return (
    <motion.div
      className={`gaming-card p-4 relative ${earned ? 'pulse-glow' : 'opacity-50'} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {earned && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Star className="w-3 h-3 text-accent-foreground" />
          </motion.div>
        </div>
      )}
      
      <div className="flex items-center space-x-3">
        <div className={`neon-glow ${colorClass}`}>
          <IconComponent className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      {type === 'special' && earned && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-purple/10 via-neon-cyan/10 to-neon-purple/10"
          animate={{ 
            background: [
              "linear-gradient(45deg, hsl(280 100% 70% / 0.1), hsl(180 100% 70% / 0.1))",
              "linear-gradient(45deg, hsl(180 100% 70% / 0.1), hsl(280 100% 70% / 0.1))"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
      )}
    </motion.div>
  );
};