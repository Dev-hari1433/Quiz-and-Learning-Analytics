import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';

const performanceData = [
  { date: '2024-01-01', score: 65, quizzes: 3, timeSpent: 45 },
  { date: '2024-01-02', score: 72, quizzes: 5, timeSpent: 68 },
  { date: '2024-01-03', score: 78, quizzes: 4, timeSpent: 52 },
  { date: '2024-01-04', score: 85, quizzes: 6, timeSpent: 78 },
  { date: '2024-01-05', score: 82, quizzes: 7, timeSpent: 85 },
  { date: '2024-01-06', score: 88, quizzes: 5, timeSpent: 64 },
  { date: '2024-01-07', score: 91, quizzes: 8, timeSpent: 95 },
];

const subjectData = [
  { subject: 'Mathematics', score: 92, color: 'hsl(217, 92%, 60%)' },
  { subject: 'Science', score: 88, color: 'hsl(142, 76%, 55%)' },
  { subject: 'History', score: 75, color: 'hsl(32, 98%, 65%)' },
  { subject: 'Literature', score: 82, color: 'hsl(280, 100%, 70%)' },
  { subject: 'Geography', score: 79, color: 'hsl(0, 84%, 60%)' },
];

const difficultyData = [
  { difficulty: 'Easy', count: 45, color: 'hsl(142, 76%, 55%)' },
  { difficulty: 'Medium', count: 32, color: 'hsl(32, 98%, 65%)' },
  { difficulty: 'Hard', count: 18, color: 'hsl(0, 84%, 60%)' },
];

const streakData = [
  { name: 'Current Streak', value: 7, fill: 'hsl(217, 92%, 60%)' },
  { name: 'Best Streak', value: 12, fill: 'hsl(142, 76%, 55%)' },
  { name: 'Average Streak', value: 5, fill: 'hsl(32, 98%, 65%)' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-card-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name === 'score' && '%'}
            {entry.name === 'timeSpent' && ' min'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const PerformanceCharts = () => {
  return (
    <div className="space-y-8">
      {/* Performance Trend */}
      <motion.div
        className="gaming-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-xl font-bold mb-6 text-primary">📈 Performance Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 92%, 60%)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(217, 92%, 60%)" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 15%)" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(210, 40%, 65%)" 
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis stroke="hsl(210, 40%, 65%)" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(217, 92%, 60%)"
              fillOpacity={1}
              fill="url(#scoreGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Performance */}
        <motion.div
          className="gaming-card p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold mb-6 text-accent">📚 Subject Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={subjectData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 15%)" />
              <XAxis type="number" stroke="hsl(210, 40%, 65%)" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="subject" 
                stroke="hsl(210, 40%, 65%)" 
                fontSize={12}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" fill="hsl(142, 76%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Difficulty Distribution */}
        <motion.div
          className="gaming-card p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold mb-6 text-secondary">🎯 Quiz Difficulty</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
              >
                {difficultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  color: 'hsl(210, 95%, 92%)',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Time vs Quizzes */}
        <motion.div
          className="gaming-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold mb-6 text-primary">⏱️ Study Time & Quiz Count</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 15%)" />
              <XAxis 
                dataKey="date"
                stroke="hsl(210, 40%, 65%)" 
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="hsl(210, 40%, 65%)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  color: 'hsl(210, 95%, 92%)',
                  fontSize: '12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="timeSpent" 
                stroke="hsl(32, 98%, 65%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(32, 98%, 65%)', strokeWidth: 2, r: 4 }}
                name="Time Spent (min)"
              />
              <Line 
                type="monotone" 
                dataKey="quizzes" 
                stroke="hsl(142, 76%, 55%)" 
                strokeWidth={2}
                dot={{ fill: 'hsl(142, 76%, 55%)', strokeWidth: 2, r: 4 }}
                name="Quizzes Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Streak Progress */}
        <motion.div
          className="gaming-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-xl font-bold mb-6 text-secondary">🔥 Learning Streaks</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={streakData}>
              <RadialBar 
                dataKey="value" 
                cornerRadius={10} 
              />
              <Legend 
                iconSize={10}
                wrapperStyle={{ 
                  color: 'hsl(210, 95%, 92%)',
                  fontSize: '12px'
                }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};