import React from 'react';
import { QuizHistoryManager } from '@/components/history/QuizHistoryManager';

const History = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <QuizHistoryManager />
      </div>
    </div>
  );
};

export default History;