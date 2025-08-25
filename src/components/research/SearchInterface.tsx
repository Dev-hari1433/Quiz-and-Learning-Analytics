import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, ExternalLink, Loader2, FileText, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

interface SearchResult {
  title: string;
  url: string;
  content: string;
  favicon?: string;
}

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  sentiment: string;
  wordCount: number;
}

export const SearchInterface = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [textToAnalyze, setTextToAnalyze] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [apiKey, setApiKey] = useState('');

  // Mock function for Perplexity API call
  const searchWithPerplexity = async (query: string): Promise<SearchResult[]> => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Perplexity API key to use search functionality.",
        variant: "destructive",
      });
      return [];
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: 'You are a research assistant. Provide accurate, well-sourced information with clear summaries and key points.'
            },
            {
              role: 'user',
              content: `Research and summarize: ${query}. Provide sources and key insights.`
            }
          ],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 1000,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'month',
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      // Mock results for demo purposes
      return [
        {
          title: `Research Results for: ${query}`,
          url: 'https://perplexity.ai',
          content: content,
          favicon: '🔍'
        },
        {
          title: 'Related Academic Source',
          url: 'https://scholar.google.com',
          content: 'Academic papers and scholarly articles related to your query...',
          favicon: '🎓'
        },
        {
          title: 'Encyclopedia Reference',
          url: 'https://wikipedia.org',
          content: 'Comprehensive background information and definitions...',
          favicon: '📚'
        }
      ];
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Unable to perform search. Please check your API key and try again.",
        variant: "destructive",
      });
      return [];
    }
  };

  const analyzeText = async (text: string): Promise<AnalysisResult | null> => {
    if (!text.trim()) return null;

    try {
      // Simulate AI text analysis
      const words = text.split(/\s+/).length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      return {
        summary: `This text discusses ${text.substring(0, 100)}... The main theme appears to be educational content with ${words} words across ${sentences.length} sentences.`,
        keyPoints: [
          'Main concept identified from the text',
          'Supporting arguments and evidence',
          'Conclusions and implications',
          'Areas for further research'
        ],
        sentiment: 'Neutral/Educational',
        wordCount: words
      };
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze text. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const results = await searchWithPerplexity(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAnalyze = async () => {
    if (!textToAnalyze.trim()) return;
    
    setIsAnalyzing(true);
    const result = await analyzeText(textToAnalyze);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* API Key Input */}
      {!apiKey && (
        <motion.div 
          className="gaming-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-bold mb-4">🔑 Setup Required</h3>
          <p className="text-muted-foreground mb-4">
            Enter your Perplexity API key to enable AI-powered search and analysis features.
          </p>
          <div className="flex gap-4">
            <Input
              type="password"
              placeholder="Enter your Perplexity API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => {
                if (apiKey) {
                  toast({
                    title: "API Key Saved",
                    description: "You can now use search and analysis features.",
                  });
                }
              }}
              disabled={!apiKey}
            >
              Save Key
            </Button>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            AI Search
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Text Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Interface */}
          <motion.div 
            className="gaming-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Globe className="w-6 h-6 mr-2 text-primary neon-glow" />
              AI-Powered Research
            </h3>
            
            <div className="flex gap-4 mb-6">
              <Input
                placeholder="Enter your research query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !apiKey}
                className="gaming-button-primary"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </motion.div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Search Results</h3>
              {searchResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="gaming-card p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{result.favicon}</span>
                        <h4 className="font-semibold text-primary">{result.title}</h4>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(result.url, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Visit
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{result.url}</p>
                    <p className="text-sm leading-relaxed">{result.content}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analyze" className="space-y-6">
          {/* Text Analysis Interface */}
          <motion.div 
            className="gaming-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-accent" />
              Text Analysis & Summarization
            </h3>
            
            <div className="space-y-4">
              <Textarea
                placeholder="Paste your text here for AI analysis and summarization..."
                value={textToAnalyze}
                onChange={(e) => setTextToAnalyze(e.target.value)}
                className="min-h-[200px]"
              />
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !textToAnalyze.trim()}
                className="gaming-button-secondary"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Brain className="w-4 h-4 mr-2" />
                )}
                Analyze Text
              </Button>
            </div>
          </motion.div>

          {/* Analysis Results */}
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold">Analysis Results</h3>
              
              <Card className="gaming-card p-6">
                <h4 className="font-semibold text-accent mb-3">📋 Summary</h4>
                <p className="text-sm leading-relaxed mb-4">{analysisResult.summary}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-secondary mb-3">🎯 Key Points</h4>
                    <ul className="space-y-2">
                      {analysisResult.keyPoints.map((point, index) => (
                        <li key={index} className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <h5 className="font-semibold text-sm mb-1">Word Count</h5>
                      <p className="text-2xl font-bold text-primary">{analysisResult.wordCount}</p>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-lg">
                      <h5 className="font-semibold text-sm mb-1">Sentiment</h5>
                      <p className="text-lg font-semibold text-accent">{analysisResult.sentiment}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};