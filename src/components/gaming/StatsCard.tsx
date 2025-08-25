import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  trendValue,
  color = 'primary',
  className = ""
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'secondary': return 'text-secondary border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10';
      case 'accent': return 'text-accent border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10';
      case 'success': return 'text-green-400 border-green-400/20 bg-gradient-to-br from-green-400/5 to-green-400/10';
      case 'warning': return 'text-yellow-400 border-yellow-400/20 bg-gradient-to-br from-yellow-400/5 to-yellow-400/10';
      default: return 'text-primary border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-accent';
    if (trend === 'down') return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <motion.div
      className={`gaming-card p-6 ${getColorClass()} ${className}`}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <motion.div
            className="text-3xl font-bold mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {value}
          </motion.div>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trendValue && (
            <div className={`flex items-center mt-2 text-sm ${getTrendColor()}`}>
              <span className="mr-1">{getTrendIcon()}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        <motion.div
          className="neon-glow"
          whileHover={{ rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-8 h-8" />
        </motion.div>
      </div>
    </motion.div>
  );
};