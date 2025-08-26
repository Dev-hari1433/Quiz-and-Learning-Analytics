import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Eye, Calendar, Clock, Trophy, Target,
  Brain, Zap, TrendingUp, AlertCircle, CheckCircle,
  XCircle, Filter, Search, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { useSessionUser } from '@/hooks/useSessionUser';
import { supabase } from '@/integrations/supabase/client';

interface QuizHistoryManagerProps {
  className?: string;
}

export const QuizHistoryManager: React.FC<QuizHistoryManagerProps> = ({ className = "" }) => {
  const { quizHistory, loading, refreshData } = useRealTimeData();
  const { sessionUser } = useSessionUser();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleDeleteQuiz = async (quizId: string) => {
    if (!sessionUser) return;
    
    setDeletingIds(prev => new Set([...prev, quizId]));
    
    try {
      // Delete from quiz_sessions
      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', quizId)
        .eq('user_name', sessionUser.name);

      if (sessionError) throw sessionError;

      // Delete related quiz_results
      const { error: resultsError } = await supabase
        .from('quiz_results')
        .delete()
        .eq('quiz_session_id', quizId)
        .eq('user_name', sessionUser.name);

      if (resultsError) throw resultsError;

      toast({
        title: "Quiz deleted",
        description: "Quiz history has been removed successfully."
      });

      // Refresh data to update UI
      await refreshData();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(quizId);
        return newSet;
      });
    }
  };

  // Filter quizzes based on search and filters
  const filteredQuizzes = quizHistory.filter(quiz => {
    const matchesSearch = quiz.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || quiz.subject === filterSubject;
    const matchesDifficulty = filterDifficulty === 'all' || quiz.difficulty === filterDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  // Get unique subjects and difficulties for filters
  const subjects = [...new Set(quizHistory.map(q => q.subject))];
  const difficulties = [...new Set(quizHistory.map(q => q.difficulty))];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent';
    if (score >= 60) return 'text-secondary';
    return 'text-destructive';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertCircle;
    return XCircle;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz history...</p>
        </div>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <Card className="gaming-card p-8 text-center">
        <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Quiz History</h3>
        <p className="text-muted-foreground">Enter your name to view quiz history</p>
      </Card>
    );
  }

  if (quizHistory.length === 0) {
    return (
      <Card className="gaming-card p-8 text-center">
        <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Quiz History Yet</h3>
        <p className="text-muted-foreground mb-6">
          Take your first quiz to see your learning progress here!
        </p>
        <Button 
          className="gaming-button-primary"
          onClick={() => window.location.href = '/generate-quiz'}
        >
          <Brain className="w-4 h-4 mr-2" />
          Generate Your First Quiz
        </Button>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats */}
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Quiz History ({filteredQuizzes.length} of {quizHistory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{quizHistory.length}</div>
              <div className="text-sm text-muted-foreground">Total Quizzes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">
                {Math.round(quizHistory.reduce((acc, q) => acc + q.score, 0) / quizHistory.length) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary">
                {quizHistory.reduce((acc, q) => acc + q.total_questions, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">
                {Math.round(quizHistory.reduce((acc, q) => acc + q.time_spent, 0) / 60)}m
              </div>
              <div className="text-sm text-muted-foreground">Study Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="gaming-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {difficulties.map(difficulty => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quiz List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredQuizzes.map((quiz, index) => {
            const ScoreIcon = getScoreIcon(quiz.score);
            const isDeleting = deletingIds.has(quiz.id);
            
            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`gaming-card hover:border-primary/50 transition-all ${
                  isDeleting ? 'opacity-50' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          <ScoreIcon className={`w-6 h-6 mt-1 ${getScoreColor(quiz.score)}`} />
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{quiz.title}</h3>
                            <p className="text-muted-foreground">{quiz.subject}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(quiz.score)}`}>
                              {quiz.score}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {quiz.correct_answers}/{quiz.total_questions}
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(quiz.created_at)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(quiz.time_spent)}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              quiz.difficulty === 'easy' ? 'text-accent' :
                              quiz.difficulty === 'medium' ? 'text-secondary' :
                              'text-destructive'
                            }`}
                          >
                            <Target className="w-3 h-3 mr-1" />
                            {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-xp-gold">
                            <Zap className="w-3 h-3 mr-1" />
                            +{quiz.correct_answers * 10} XP
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          disabled={isDeleting}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          {isDeleting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredQuizzes.length === 0 && (searchTerm || filterSubject !== 'all' || filterDifficulty !== 'all') && (
        <Card className="gaming-card p-8 text-center">
          <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Matching Quizzes</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </Card>
      )}
    </div>
  );
};