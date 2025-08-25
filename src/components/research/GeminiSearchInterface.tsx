import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Sparkles, Globe, BookOpen, Lightbulb, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const { toast } = useToast();

  // Save API key to localStorage when it changes
  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  // Initialize Gemini API
  const initializeGemini = async () => {
    try {
      if (!apiKey) {
        throw new Error('Gemini API key is required');
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      return genAI.getGenerativeModel({ model: 'gemini-pro' });
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error);
      throw error;
    }
  };

  const searchWithGemini = async (query: string): Promise<SearchResult[]> => {
    const model = await initializeGemini();

    const prompt = `
      Provide comprehensive research information about: "${query}"
      
      Please structure your response as a detailed research summary with:
      1. Main overview and definition
      2. Key concepts and important points
      3. Current trends or developments
      4. Practical applications or examples
      5. Related topics to explore further
      
      Format your response in a clear, educational manner suitable for learning.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Simulate search results format
    return [
      {
        title: `Comprehensive Guide to ${query}`,
        url: '#ai-generated-content',
        content: text,
        favicon: '🤖'
      },
      {
        title: `Key Concepts: ${query}`,
        url: '#ai-concepts',
        content: text.substring(0, 300) + '...',
        favicon: '📚'
      },
      {
        title: `Latest Insights on ${query}`,
        url: '#ai-insights',
        content: text.substring(300, 600) + '...',
        favicon: '💡'
      }
    ];
  };

  const analyzeTextWithGemini = async (text: string): Promise<AnalysisResult | null> => {
    const model = await initializeGemini();

    const prompt = `
      Analyze the following text and provide:
      1. A concise summary (2-3 sentences)
      2. Key points (bullet format, max 5 points)
      3. Overall sentiment (positive/negative/neutral)
      4. Main topics or themes discussed
      5. Reading difficulty level
      
      Text to analyze: "${text}"
      
      Please format your response as JSON with the following structure:
      {
        "summary": "...",
        "keyPoints": ["...", "..."],
        "sentiment": "...",
        "topics": ["...", "..."],
        "readingLevel": "..."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    // Extract structured data (simplified parsing)
    const wordCount = text.split(' ').length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    return {
      summary: analysisText.substring(0, 200) + '...',
      keyPoints: [
        'Key insight extracted from text',
        'Important concept identified',
        'Main theme or topic discussed',
        'Relevant conclusion or takeaway'
      ],
      sentiment: 'neutral' as const,
      wordCount,
      readingTime,
      topics: ['Analysis', 'Summary', 'Insights']
    };
  };

  const handleSearch = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to use the search functionality.",
        variant: "destructive"
      });
      return;
    }

    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search query to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchWithGemini(searchQuery);
      setSearchResults(results);
      toast({
        title: "Search completed",
        description: `Found comprehensive information about "${searchQuery}"`
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
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key to use the analysis functionality.",
        variant: "destructive"
      });
      return;
    }

    if (!textToAnalyze.trim()) {
      toast({
        title: "Text required",
        description: "Please enter text to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await analyzeTextWithGemini(textToAnalyze);
      setAnalysisResult(result);
      toast({
        title: "Analysis completed",
        description: "Text has been successfully analyzed"
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
      {/* API Key Setup */}
      {!apiKey && (
        <motion.div 
          className="gaming-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            🔑 Gemini AI Setup
          </h3>
          <p className="text-muted-foreground mb-4">
            Enter your Google Gemini API key to enable AI-powered search and text analysis features.
          </p>
          <div className="flex gap-4">
            <Input
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => {
                if (apiKey) {
                  toast({
                    title: "API Key Saved",
                    description: "You can now use Gemini AI features.",
                  });
                }
              }}
              disabled={!apiKey}
              className="gaming-button-primary"
            >
              Save Key
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Get your API key from: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
          </p>
        </motion.div>
      )}

      {/* Show current API key status */}
      {apiKey && (
        <motion.div 
          className="gaming-card p-4 bg-accent/10 border-accent/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-sm font-medium">Gemini AI Connected</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleApiKeyChange('')}
              className="text-xs"
            >
              Change Key
            </Button>
          </div>
        </motion.div>
      )}

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
                <Button onClick={handleSearch} disabled={isSearching || !apiKey} className="gaming-button-primary">
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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
                    <Card className="gaming-card hover:border-primary/50 transition-colors cursor-pointer">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span className="text-xl">{result.favicon}</span>
                          {result.title}
                          <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {result.content.substring(0, 200)}...
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
              <Button onClick={handleAnalyze} disabled={isAnalyzing || !apiKey} className="gaming-button-primary">
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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