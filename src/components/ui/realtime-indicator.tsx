import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealTimeIndicatorProps {
  isConnected: boolean;
  isUpdating?: boolean;
  className?: string;
}

export const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = ({
  isConnected,
  isUpdating = false,
  className
}) => {
  return (
    <motion.div
      className={cn(
        "flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium",
        isConnected 
          ? "bg-green-500/10 text-green-600 border border-green-500/20" 
          : "bg-red-500/10 text-red-600 border border-red-500/20",
        className
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {isConnected ? (
        <>
          {isUpdating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-3 h-3" />
            </motion.div>
          ) : (
            <Wifi className="w-3 h-3" />
          )}
          <span>{isUpdating ? 'Updating...' : 'Live'}</span>
          <motion.div
            className="w-1.5 h-1.5 bg-green-500 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </>
      )}
    </motion.div>
  );
};

export default RealTimeIndicator;