import React from 'react';
import { motion } from 'framer-motion';
import { Search, BookOpen, Globe, Lightbulb } from 'lucide-react';
import { GeminiSearchInterface } from '@/components/research/GeminiSearchInterface';

const SmartResearch = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
            <Search className="w-8 h-8 mr-3 text-primary neon-glow" />
            Smart Research
          </h1>
          <p className="text-muted-foreground text-lg">AI-powered research assistance & text analysis</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GeminiSearchInterface />
        </motion.div>

        {/* Features Overview */}
        <motion.div 
          className="gaming-card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-center mb-8">Research Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-4">
              <Globe className="w-12 h-12 text-primary neon-glow mx-auto" />
              <h3 className="text-lg font-semibold">AI Web Search</h3>
              <p className="text-muted-foreground text-sm">
                Powered by Google Gemini AI for accurate, comprehensive information retrieval
              </p>
            </div>
            <div className="text-center space-y-4">
              <BookOpen className="w-12 h-12 text-accent mx-auto" />
              <h3 className="text-lg font-semibold">Text Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Summarize large texts, extract key points, and analyze content
              </p>
            </div>
            <div className="text-center space-y-4">
              <Lightbulb className="w-12 h-12 text-secondary mx-auto" />
              <h3 className="text-lg font-semibold">Smart Insights</h3>
              <p className="text-muted-foreground text-sm">
                Get contextual learning recommendations and study materials
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SmartResearch;