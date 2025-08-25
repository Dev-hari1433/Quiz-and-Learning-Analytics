import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Sparkles, Globe, BookOpen, Lightbulb, ExternalLink, Clock, BarChart3, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { GameStateManager } from '@/lib/gameState';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  title: string;
  url: string;
  content: string;
  favicon?: string;
}

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  wordCount: number;
  readingTime: number;
  topics: string[];
}

export const GeminiSearchInterface: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [textToAnalyze, setTextToAnalyze] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [sessionStats, setSessionStats] = useState({
    searchesPerformed: 0,
    textsAnalyzed: 0,
    timeSpent: 0,
    startTime: Date.now()
  });
  const { toast } = useToast();

  const gameState = GameStateManager.getInstance();

  useEffect(() => {
    // Track time spent in research session
    const interval = setInterval(() => {
      setSessionStats(prev => ({
        ...prev,
        timeSpent: Math.floor((Date.now() - prev.startTime) / 1000)
      }));
    }, 1000);

    return () => {
      clearInterval(interval);
      // Add study time when component unmounts
      const minutesSpent = Math.floor((Date.now() - sessionStats.startTime) / 60000);
      if (minutesSpent > 0) {
        gameState.addStudyTime(minutesSpent);
      }
    };
  }, []);
  
  const searchWithGemini = async (query: string): Promise<SearchResult[]> => {
    console.log('[GeminiSearchInterface] invoking gemini-search with query:', query);
    // Use official SDK to avoid CORS/preflight pitfalls
    const { data, error } = await supabase.functions.invoke('gemini-search', {
      body: { query, type: 'search' },
    });

    if (error) {
      console.error('[GeminiSearchInterface] gemini-search error:', error);
      // Normalize Supabase error into a readable message
      const transient =
        (error as any)?.name === 'FunctionsFetchError' ||
        (error as any)?.message?.toLowerCase?.().includes('failed to fetch') ||
        (error as any)?.status === 502 || (error as any)?.status === 503 || (error as any)?.status === 504;

      let errorMessage = 'Search failed';
      if ((error as any)?.message) errorMessage = (error as any).message;
      else if ((error as any)?.status === 500) errorMessage = 'Server error: AI service unavailable. Please check API keys.';
      else if ((error as any)?.status === 401 || (error as any)?.status === 403) errorMessage = 'Authentication failed: Invalid API key configuration.';
      else if ((error as any)?.status === 429) errorMessage = 'Rate limit exceeded: Please wait and try again.';
      else if (transient) errorMessage = 'Network error: Could not reach AI service.';
      throw new Error(errorMessage);
    }

    console.log('[GeminiSearchInterface] gemini-search data:', data);
    return data?.results || [];
  };

  const analyzeTextWithGemini = async (text: string): Promise<AnalysisResult | null> => {
    console.log('[GeminiSearchInterface] invoking gemini-search analyze with text length:', text.length);
    const { data, error } = await supabase.functions.invoke('gemini-search', {
      body: { text, type: 'analyze' },
    });

    if (error) {
      console.error('[GeminiSearchInterface] gemini analyze error:', error);
      const transient =
        (error as any)?.name === 'FunctionsFetchError' ||
        (error as any)?.message?.toLowerCase?.().includes('failed to fetch') ||
        (error as any)?.status === 502 || (error as any)?.status === 503 || (error as any)?.status === 504;

      let errorMessage = 'Analysis failed';
      if ((error as any)?.message) errorMessage = (error as any).message;
      else if ((error as any)?.status === 500) errorMessage = 'Server error: AI service unavailable. Please check API keys.';
      else if ((error as any)?.status === 401 || (error as any)?.status === 403) errorMessage = 'Authentication failed: Invalid API key configuration.';
      else if ((error as any)?.status === 429) errorMessage = 'Rate limit exceeded: Please wait and try again.';
      else if (transient) errorMessage = 'Network error: Could not reach AI service.';
      throw new Error(errorMessage);
    }

    console.log('[GeminiSearchInterface] gemini analyze data:', data);
    return data?.analysis || null;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search query to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    const searchStartTime = Date.now();
    
    try {
      const results = await searchWithGemini(searchQuery);
      setSearchResults(results);
      
      // Update session stats and game state
      setSessionStats(prev => ({
        ...prev,
        searchesPerformed: prev.searchesPerformed + 1
      }));
      
      // Calculate XP based on search complexity and results
      const searchXP = Math.min(50, searchQuery.length * 2 + results.length);
      const timeSpent = Math.floor((Date.now() - searchStartTime) / 1000);
      
      // Add research activity to game state
      gameState.addStudyTime(Math.max(1, Math.floor(timeSpent / 60)));
      
      toast({
        title: "Search completed",
        description: `Found ${results.length} comprehensive results! +${searchXP} XP earned`
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "An error occurred during search",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAnalyze = async () => {
    if (!textToAnalyze.trim()) {
      toast({
        title: "Text required",
        description: "Please enter text to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    const analysisStartTime = Date.now();
    
    try {
      const result = await analyzeTextWithGemini(textToAnalyze);
      setAnalysisResult(result);
      
      // Update session stats and game state
      setSessionStats(prev => ({
        ...prev,
        textsAnalyzed: prev.textsAnalyzed + 1
      }));
      
      // Calculate XP based on text complexity
      const analysisXP = Math.min(100, textToAnalyze.length / 10 + (result?.keyPoints.length || 0) * 5);
      const timeSpent = Math.floor((Date.now() - analysisStartTime) / 1000);
      
      // Add research activity to game state
      gameState.addStudyTime(Math.max(1, Math.floor(timeSpent / 60)));
      
      toast({
        title: "Analysis completed",
        description: `Text successfully analyzed! +${Math.round(analysisXP)} XP earned`
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Session Statistics */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gaming-card p-4"
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              <span>{sessionStats.searchesPerformed} searches</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <span>{sessionStats.textsAnalyzed} analyzed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary" />
              <span>{Math.floor(sessionStats.timeSpent / 60)}m {sessionStats.timeSpent % 60}s</span>
            </div>
          </div>
          <Badge variant="outline" className="neon-glow">
            <Brain className="w-3 h-3 mr-1" />
            Research Session Active
          </Badge>
        </div>
      </motion.div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gaming-card">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            AI Search
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Text Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <motion.div
            className="gaming-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask me anything... (e.g., 'Explain quantum physics', 'How does AI work?')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching} className="gaming-button-primary">
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary neon-glow" />
                Research Results
              </h3>
              <div className="grid gap-4">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className="gaming-card hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => window.open(result.url, '_blank', 'noopener,noreferrer')}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-xl">{result.favicon}</span>
                          <span className="flex-1 truncate">{result.title}</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground/70 truncate">
                          {result.url}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                          {result.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="analyze" className="space-y-6">
          <motion.div
            className="gaming-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-4">
              <Textarea
                placeholder="Paste your text here for AI analysis... (articles, essays, research papers, etc.)"
                value={textToAnalyze}
                onChange={(e) => setTextToAnalyze(e.target.value)}
                className="min-h-[200px] resize-none"
              />
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gaming-button-primary">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    <span>Analyze Text</span>
                  </div>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Analysis Results */}
          {analysisResult && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Analysis Results
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{analysisResult.summary}</p>
                  </CardContent>
                </Card>

                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Word Count:</span>
                      <span className="font-semibold">{analysisResult.wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reading Time:</span>
                      <span className="font-semibold">{analysisResult.readingTime} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sentiment:</span>
                      <span className={`font-semibold capitalize ${
                        analysisResult.sentiment === 'positive' ? 'text-accent' :
                        analysisResult.sentiment === 'negative' ? 'text-destructive' :
                        'text-muted-foreground'
                      }`}>
                        {analysisResult.sentiment}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="gaming-card md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Key Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="gaming-card md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
