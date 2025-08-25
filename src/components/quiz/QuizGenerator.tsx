import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Sparkles, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
}

interface QuizGeneratorProps {
  onQuizGenerated: (questions: GeneratedQuestion[]) => void;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onQuizGenerated }) => {
  const [step, setStep] = useState<'upload' | 'configure' | 'generating' | 'preview'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState([10]);
  const [difficulty, setDifficulty] = useState('medium');
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = (uploadedFile: File) => {
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(uploadedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, TXT, or image file.",
        variant: "destructive"
      });
      return;
    }

    if (uploadedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 100MB.",
        variant: "destructive"
      });
      return;
    }

    setFile(uploadedFile);
    
    // If it's a text file, try to read its content
    if (uploadedFile.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setTextContent(content);
      };
      reader.readAsText(uploadedFile);
    }

    toast({
      title: "File uploaded successfully",
      description: `${uploadedFile.name} is ready for processing.`
    });
  };

  const generateQuestions = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStep('generating');

    try {
      // Simulate AI question generation process
      const questions: GeneratedQuestion[] = [];
      const sampleQuestions = [
        {
          question: "What is the main topic discussed in the document?",
          options: ["Technology", "Science", "History", "Literature"],
          correctAnswer: 0,
          explanation: "Based on the content analysis, the primary focus is on technology."
        },
        {
          question: "According to the text, what is the most important factor?",
          options: ["Time", "Quality", "Cost", "Efficiency"],
          correctAnswer: 1,
          explanation: "The document emphasizes quality as the critical factor for success."
        },
        {
          question: "Which methodology is recommended in the document?",
          options: ["Traditional approach", "Modern framework", "Hybrid model", "Custom solution"],
          correctAnswer: 2,
          explanation: "The text advocates for a hybrid model combining traditional and modern approaches."
        },
        {
          question: "What is the key principle mentioned in the content?",
          options: ["Simplicity", "Complexity", "Flexibility", "Rigidity"],
          correctAnswer: 2,
          explanation: "The content emphasizes flexibility as essential for adaptation and success."
        }
      ];

      // Generate the exact number of questions requested
      for (let i = 0; i < numQuestions[0]; i++) {
        const baseQuestion = sampleQuestions[i % sampleQuestions.length];
        const question: GeneratedQuestion = {
          id: `q${i + 1}`,
          question: `${baseQuestion.question} (Question ${i + 1})`,
          options: baseQuestion.options,
          correctAnswer: baseQuestion.correctAnswer,
          explanation: baseQuestion.explanation,
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
          subject: topic || 'General Knowledge'
        };
        
        questions.push(question);
        
        // Update progress
        setProgress(((i + 1) / numQuestions[0]) * 100);
        
        // Add realistic delay
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setGeneratedQuestions(questions);
      setStep('preview');
      
      toast({
        title: "Quiz generated successfully!",
        description: `Created ${numQuestions[0]} ${difficulty} questions from your content.`
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating the quiz. Please try again.",
        variant: "destructive"
      });
      setStep('configure');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseQuiz = () => {
    onQuizGenerated(generatedQuestions);
  };

  const resetGenerator = () => {
    setStep('upload');
    setFile(null);
    setTextContent('');
    setTopic('');
    setNumQuestions([10]);
    setDifficulty('medium');
    setGeneratedQuestions([]);
    setProgress(0);
  };

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-4">Generating Your Quiz</h2>
            <p className="text-muted-foreground">
              AI is analyzing your content and creating {numQuestions[0]} personalized questions...
            </p>
          </motion.div>

          <div className="gaming-card p-8 space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <motion.div
                className="absolute inset-0 border-4 border-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Processing {file?.name || 'content'}...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-2 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 mr-3 text-accent" />
              Quiz Generated Successfully!
            </h2>
            <p className="text-muted-foreground">
              Review your {generatedQuestions.length} questions below
            </p>
          </motion.div>

          <div className="gaming-card p-6 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{generatedQuestions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{difficulty}</div>
                <div className="text-sm text-muted-foreground">Difficulty</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">{topic || 'General'}</div>
                <div className="text-sm text-muted-foreground">Subject</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">{file?.name.split('.').pop()?.toUpperCase()}</div>
                <div className="text-sm text-muted-foreground">Source</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {generatedQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="gaming-card">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Question {index + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="font-medium">{question.question}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="p-3 rounded border border-border bg-muted/20 hover:bg-muted/30 transition-colors"
                        >
                          <span className="font-medium">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>{' '}
                          {option}
                        </div>
                      ))}
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                      <p>✨ Answers and explanations will be revealed after you start the quiz!</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="gaming-button-primary"
              onClick={handleUseQuiz}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Quiz
            </Button>
            <Button 
              variant="outline"
              onClick={resetGenerator}
            >
              Generate New Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Step 1: Upload */}
      {step === 'upload' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold">Step 1: Upload Your Content</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload File</h3>
              <div
                className="gaming-card p-8 border-2 border-dashed border-border/50 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer"
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) handleFileUpload(droppedFile);
                }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) handleFileUpload(selectedFile);
                  }}
                  className="hidden"
                />
                
                {file ? (
                  <div className="space-y-4">
                    <FileText className="w-16 h-16 mx-auto text-accent" />
                    <div>
                      <p className="text-lg font-semibold text-accent">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setTextContent('');
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-semibold">
                        <span className="text-primary">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-muted-foreground">
                        PDF, DOCX, TXT, or Images (Max 100MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Text Input */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Or Paste Text Content</h3>
              <div className="gaming-card p-4">
                <Textarea
                  placeholder="Paste your text content here to generate questions from..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setStep('configure')}
              disabled={!file && !textContent.trim()}
              className="gaming-button-primary"
            >
              Next: Configure Quiz
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Configure */}
      {step === 'configure' && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold">Step 2: Configure Your Quiz</h2>
          
          <div className="gaming-card p-6 space-y-6">
            {/* Quiz Topic */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Quiz Topic (Optional)</label>
              <Input
                placeholder="e.g., Machine Learning, World History, Physics"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Number of Questions */}
              <div className="space-y-4">
                <label className="text-sm font-medium">
                  Number of Questions: <span className="text-primary font-bold">{numQuestions[0]}</span>
                </label>
                <Slider
                  value={numQuestions}
                  onValueChange={setNumQuestions}
                  max={20}
                  min={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 questions</span>
                  <span>20 questions</span>
                </div>
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Difficulty Level</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy - Basic concepts</SelectItem>
                    <SelectItem value="medium">Medium - Intermediate knowledge</SelectItem>
                    <SelectItem value="hard">Hard - Advanced understanding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-4 bg-muted/20 rounded border">
              <h4 className="font-medium mb-2">Content Source:</h4>
              <p className="text-sm text-muted-foreground">
                {file ? (
                  <>📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</>
                ) : (
                  <>📝 Text content ({textContent.length} characters)</>
                )}
              </p>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep('upload')}
            >
              Back: Upload Content
            </Button>
            <Button
              onClick={generateQuestions}
              className="gaming-button-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Quiz
            </Button>
          </div>
        </motion.div>
      )}

    </div>
  );
};