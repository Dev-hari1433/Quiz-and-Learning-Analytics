import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';

const GenerateQuiz = () => {
  const [file, setFile] = useState<File | null>(null);
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState([10]);
  const [difficulty, setDifficulty] = useState('Medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = useCallback((uploadedFile: File) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(uploadedFile.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, or TXT file.",
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
    toast({
      title: "File uploaded successfully",
      description: `${uploadedFile.name} is ready for processing.`
    });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  }, [handleFileUpload]);

  const handleGenerateQuiz = async () => {
    if (!file) {
      toast({
        title: "No file uploaded",
        description: "Please upload a document first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Quiz generated successfully!",
        description: `Created ${numQuestions[0]} ${difficulty.toLowerCase()} questions.`
      });
      navigate('/quiz');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation />

      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Upload Section */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-bold text-foreground">1. Upload your Document</h1>
          
          <div
            className="gaming-card p-12 border-2 border-dashed border-border/50 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-4">
                <FileText className="w-16 h-16 mx-auto text-success" />
                <div>
                  <p className="text-lg font-semibold text-success">{file.name}</p>
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
                    }}
                  >
                    Remove file
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
                    PDF, DOCX, or TXT (Max 100MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Configuration Section */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-foreground">2. Configure Your Quiz</h2>
          
          <div className="gaming-card p-6 space-y-6">
            {/* Quiz Topic */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Quiz Topic (Optional)</label>
              <Input
                placeholder="e.g., The French Revolution, React State Management"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Number of Questions */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground">
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
              </div>

              {/* Difficulty */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            className="w-full gaming-button-primary p-6 text-lg font-bold"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating Quiz...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 neon-glow" />
                <span>Generate Quiz</span>
              </div>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default GenerateQuiz;