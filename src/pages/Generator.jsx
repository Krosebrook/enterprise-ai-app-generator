import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Database, 
  Mail, 
  CreditCard,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  { id: 'auth', name: 'Authentication', icon: Shield, description: 'User login & registration' },
  { id: 'database', name: 'Database', icon: Database, description: 'Data persistence layer' },
  { id: 'email', name: 'Email', icon: Mail, description: 'Transactional emails' },
  { id: 'payments', name: 'Payments', icon: CreditCard, description: 'Stripe integration' },
  { id: 'ai', name: 'AI Features', icon: Cpu, description: 'LLM-powered features' },
];

const aiModels = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable, slower' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Fast and capable' },
  { id: 'claude-3', name: 'Claude 3', description: 'Excellent reasoning' },
  { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google AI model' },
];

export default function Generator() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: 'saas-core-v1.2.0',
    ai_model: 'gpt-4',
    features: ['auth', 'database'],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AppProject.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const toggleFeature = (featureId) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const handleGenerate = async () => {
    if (!formData.name) return;
    
    setIsGenerating(true);
    setProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    await createMutation.mutateAsync({
      ...formData,
      status: 'generating',
      config: {
        features: formData.features,
      }
    });

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        navigate(createPageUrl('Dashboard'));
      }, 1000);
    }, 4000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-6">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Generate New App</h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Create a production-ready application with AI-powered code generation
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-20"
          >
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 rounded-full bg-slate-950 flex items-center justify-center">
                <Zap className="w-12 h-12 text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Generating Your App...</h2>
            <p className="text-slate-400 mb-8">This usually takes about 30 seconds</p>
            <div className="w-96 mx-auto">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-slate-500 text-sm mt-3">{Math.round(Math.min(progress, 100))}% complete</p>
            </div>
            {progress >= 100 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex items-center justify-center gap-2 text-emerald-400"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Generation complete!</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Basic Info */}
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-slate-300 mb-2 block">App Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Awesome App"
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what your app does..."
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 min-h-24"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Template & AI Model */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.template}
                    onValueChange={(value) => setFormData({ ...formData, template: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="saas-core-v1.2.0">SaaS Core v1.2.0</SelectItem>
                      <SelectItem value="ai-brandcraft">AI BrandCraft</SelectItem>
                      <SelectItem value="taskflow">TaskFlow</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">AI Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.ai_model}
                    onValueChange={(value) => setFormData({ ...formData, ai_model: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {aiModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Features */}
            <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.map(feature => (
                    <button
                      key={feature.id}
                      onClick={() => toggleFeature(feature.id)}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-xl border transition-all text-left",
                        formData.features.includes(feature.id)
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        formData.features.includes(feature.id)
                          ? "bg-blue-500/20"
                          : "bg-slate-700/50"
                      )}>
                        <feature.icon className={cn(
                          "w-5 h-5",
                          formData.features.includes(feature.id)
                            ? "text-blue-400"
                            : "text-slate-400"
                        )} />
                      </div>
                      <div>
                        <h4 className={cn(
                          "font-medium",
                          formData.features.includes(feature.id)
                            ? "text-white"
                            : "text-slate-300"
                        )}>
                          {feature.name}
                        </h4>
                        <p className="text-slate-500 text-sm">{feature.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleGenerate}
                disabled={!formData.name || createMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-12 py-6 text-lg h-auto"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate App
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}