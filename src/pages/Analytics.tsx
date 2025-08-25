import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Brain } from 'lucide-react';
import { StatsCard } from '@/components/gaming/StatsCard';
import { RealTimePerformanceCharts } from '@/components/analytics/RealTimePerformanceCharts';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-lg">Track your learning progress and insights</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatsCard
            title="Total Quizzes"
            value="147"
            subtitle="This month"
            icon={Brain}
            trend="up"
            trendValue="+23% vs last month"
            color="primary"
          />
          
          <StatsCard
            title="Average Score"
            value="87%"
            subtitle="Excellent performance"
            icon={Target}
            trend="up"
            trendValue="+12% improvement"
            color="accent"
          />
          
          <StatsCard
            title="Study Time"
            value="24.5h"
            subtitle="This week"
            icon={Clock}
            trend="up"
            trendValue="+3.2h vs last week"
            color="secondary"
          />
          
          <StatsCard
            title="Topics Mastered"
            value="12"
            subtitle="Out of 20"
            icon={TrendingUp}
            trend="up"
            trendValue="2 new this week"
            color="primary"
          />
        </motion.div>

        {/* Performance Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <RealTimePerformanceCharts />
        </motion.div>

        {/* Insights Section */}
        <motion.div
          className="gaming-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-xl font-bold mb-4 text-primary">🧠 AI Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <h4 className="font-semibold text-accent mb-2">🎯 Strength Areas</h4>
              <p className="text-sm text-muted-foreground">
                Mathematics and Science are your strongest subjects. Keep up the excellent work!
              </p>
            </div>
            <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
              <h4 className="font-semibold text-secondary mb-2">📈 Improvement Areas</h4>
              <p className="text-sm text-muted-foreground">
                Focus on History and Literature to boost your overall performance.
              </p>
            </div>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="font-semibold text-primary mb-2">⏰ Optimal Study Time</h4>
              <p className="text-sm text-muted-foreground">
                Your best performance occurs between 2-4 PM. Schedule challenging topics then.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;