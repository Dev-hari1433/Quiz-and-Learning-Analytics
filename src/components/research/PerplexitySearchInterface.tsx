import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, BookOpen, Lightbulb, ExternalLink, Key, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface SearchResult {
  title: string;
  url: string;
  content: string;
  snippet: string;
}

export const PerplexitySearchInterface: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showApiDialog, setShowApiDialog] = useState(false);
  const { toast } = useToast();

  // Load API key from localStorage
  React.useEffect(() => {
    const savedKey = localStorage.getItem('perplexity_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem('perplexity_api_key', key);
    setApiKey(key);
    setShowApiDialog(false);
    toast({
      title: "API Key Saved",
      description: "Your Perplexity API key has been saved securely."
    });
  };

  const searchWithPerplexity = async (query: string): Promise<SearchResult[]> => {
    if (!apiKey) {
      throw new Error('Please set your Perplexity API key first');
    }

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
            content: 'You are a helpful research assistant. Provide comprehensive, accurate information with sources when possible.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: true,
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Perplexity API key.');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || 'No response received';

    // Format as search results
    return [
      {
        title: `Research Results: ${query}`,
        url: 'https://perplexity.ai',
        content: content,
        snippet: content.substring(0, 200) + '...'
      },
      {
        title: `Key Insights: ${query}`,
        url: 'https://perplexity.ai',
        content: content.substring(200, 500) + '...',
        snippet: content.substring(200, 300) + '...'
      },
      {
        title: `Deep Dive: ${query}`,
        url: 'https://perplexity.ai',
        content: content.substring(500) || 'Additional analysis and context...',
        snippet: content.substring(500, 600) + '...' || 'Further details available...'
      }
    ];
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

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your Perplexity API key to use this feature.",
        variant: "destructive"
      });
      setShowApiDialog(true);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchWithPerplexity(searchQuery);
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

  const testApiKey = async (testKey: string) => {
    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a test.'
            }
          ],
          max_tokens: 10
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  };

  const handleApiKeySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newApiKey = formData.get('apiKey') as string;

    if (!newApiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Perplexity API key.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Testing API Key...",
      description: "Please wait while we verify your API key."
    });

    const isValid = await testApiKey(newApiKey);
    
    if (isValid) {
      saveApiKey(newApiKey);
    } else {
      toast({
        title: "Invalid API Key",
        description: "The API key you entered is not valid. Please check and try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Perplexity AI Search</h2>
        <p className="text-muted-foreground">
          Get real-time, accurate information from the web with AI-powered search
        </p>
      </div>

      {/* Search Interface */}
      <motion.div
        className="gaming-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask anything... (e.g., 'Latest developments in AI', 'Climate change solutions 2024')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configure Perplexity API</DialogTitle>
                  <DialogDescription>
                    Enter your Perplexity API key to enable AI-powered search. 
                    Get your key from{' '}
                    <a 
                      href="https://www.perplexity.ai/settings/api" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary hover:underline"
                    >
                      perplexity.ai/settings/api
                    </a>
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleApiKeySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      name="apiKey"
                      type="password"
                      placeholder="pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      defaultValue={apiKey}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      <Key className="w-4 h-4 mr-2" />
                      Save API Key
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowApiDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching} 
              className="gaming-button-primary"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {!apiKey && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning">
                ⚠️ No API key configured. Click the settings button to add your Perplexity API key.
              </p>
            </div>
          )}
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
            <Globe className="w-5 h-5 text-primary neon-glow" />
            Search Results
          </h3>
          <div className="grid gap-4">
            {searchResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="gaming-card hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Globe className="w-5 h-5 text-primary" />
                      {result.title}
                      <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                      {result.snippet}
                    </p>
                    <details className="group">
                      <summary className="cursor-pointer text-primary hover:text-primary/80 text-sm font-medium">
                        Show full content
                      </summary>
                      <div className="mt-3 p-3 bg-muted/20 rounded text-sm leading-relaxed">
                        {result.content}
                      </div>
                    </details>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};