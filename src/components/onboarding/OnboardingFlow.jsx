import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2,
  Loader2,
  Rocket,
  User,
  Shield
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

const roleBasedSteps = {
  admin: [
    { 
      id: 'welcome', 
      title: 'Welcome to VibeCode', 
      description: 'As an admin, you have full control over app generation, templates, and deployment.',
      icon: Rocket,
      action: 'Get Started'
    },
    { 
      id: 'generate', 
      title: 'Generate Your First App', 
      description: 'Use AI to create applications from templates. Navigate to the Generator page to start.',
      icon: Sparkles,
      page: 'Generator',
      action: 'Go to Generator'
    },
    { 
      id: 'templates', 
      title: 'Explore Templates', 
      description: 'Browse pre-built templates or save your projects as reusable templates.',
      icon: User,
      page: 'Templates',
      action: 'View Templates'
    },
    { 
      id: 'editor', 
      title: 'Code Editor & AI', 
      description: 'Edit components with AI assistance for refactoring, debugging, and optimization.',
      icon: Sparkles,
      page: 'Editor',
      action: 'Open Editor'
    },
    { 
      id: 'deploy', 
      title: 'Deploy Apps', 
      description: 'Deploy to production with one click using Vercel, Netlify, or AWS.',
      icon: Rocket,
      page: 'Deploy',
      action: 'Deploy Now'
    }
  ],
  user: [
    { 
      id: 'welcome', 
      title: 'Welcome to VibeCode', 
      description: 'Start building AI-powered applications in minutes with our templates.',
      icon: Rocket,
      action: 'Get Started'
    },
    { 
      id: 'generate', 
      title: 'Generate Your First App', 
      description: 'Choose a template and let AI build your application automatically.',
      icon: Sparkles,
      page: 'Generator',
      action: 'Create App'
    },
    { 
      id: 'dashboard', 
      title: 'Manage Projects', 
      description: 'View and manage all your generated applications from the dashboard.',
      icon: User,
      page: 'Dashboard',
      action: 'View Dashboard'
    },
    { 
      id: 'examples', 
      title: 'Learn from Examples', 
      description: 'Explore example applications to understand what you can build.',
      icon: Sparkles,
      page: 'Examples',
      action: 'See Examples'
    }
  ]
};

export default function OnboardingFlow({ open, onClose, userRole = 'user' }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false);
  const [personalizedGuide, setPersonalizedGuide] = useState(null);
  const [progress, setProgress] = useState(null);

  const steps = roleBasedSteps[userRole] || roleBasedSteps.user;
  const currentStep = steps[currentStepIndex];
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (open) {
      loadProgress();
    }
  }, [open]);

  const loadProgress = async () => {
    try {
      const user = await base44.auth.me();
      const existing = await base44.entities.OnboardingProgress.filter({ user_email: user.email });
      
      if (existing.length > 0) {
        setProgress(existing[0]);
        const lastStepIndex = steps.findIndex(s => s.id === existing[0].current_step);
        if (lastStepIndex >= 0) {
          setCurrentStepIndex(lastStepIndex);
        }
      }
    } catch (error) {
      console.error('Failed to load progress', error);
    }
  };

  const saveProgress = async (stepId, completed = false) => {
    try {
      const user = await base44.auth.me();
      
      if (progress) {
        await base44.entities.OnboardingProgress.update(progress.id, {
          current_step: stepId,
          completed_steps: [...new Set([...progress.completed_steps, stepId])],
          is_complete: completed
        });
      } else {
        await base44.entities.OnboardingProgress.create({
          user_email: user.email,
          current_step: stepId,
          completed_steps: [stepId],
          is_complete: completed,
          role: userRole,
          personalized_guide: personalizedGuide
        });
      }
    } catch (error) {
      console.error('Failed to save progress', error);
    }
  };

  const generatePersonalizedGuide = async () => {
    setIsGeneratingGuide(true);
    try {
      const user = await base44.auth.me();
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a personalized onboarding guide for a ${userRole} user of VibeCode, an AI app generator platform.

User: ${user.full_name || user.email}
Role: ${userRole}

Generate:
1. **Welcome Message**: Personalized greeting addressing the user's role
2. **Quick Wins**: 3 actions they should take first based on their role
3. **Pro Tips**: 3 insider tips to maximize productivity
4. **Resources**: Recommended learning resources specific to their role

Format as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            welcome_message: { type: "string" },
            quick_wins: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            pro_tips: {
              type: "array",
              items: { type: "string" }
            },
            resources: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      setPersonalizedGuide(result);
      toast.success('Personalized guide generated!');
    } catch (error) {
      toast.error('Failed to generate guide');
    } finally {
      setIsGeneratingGuide(false);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      saveProgress(steps[currentStepIndex + 1].id);
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      saveProgress(currentStep.id, true);
      toast.success('Onboarding complete! 🎉');
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      saveProgress(steps[currentStepIndex - 1].id);
    }
  };

  const handleSkip = async () => {
    try {
      const user = await base44.auth.me();
      await base44.entities.OnboardingProgress.create({
        user_email: user.email,
        skipped: true,
        role: userRole
      });
      onClose();
    } catch (error) {
      console.error('Failed to skip', error);
    }
  };

  const StepIcon = currentStep?.icon || Sparkles;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <StepIcon className="w-6 h-6 text-white" />
              </div>
              {currentStep?.title}
            </DialogTitle>
            <Badge className={cn(
              "text-xs",
              userRole === 'admin' ? "bg-purple-500/20 text-purple-300" : "bg-blue-500/20 text-blue-300"
            )}>
              {userRole === 'admin' ? (
                <><Shield className="w-3 h-3 mr-1" /> Admin</>
              ) : (
                <><User className="w-3 h-3 mr-1" /> User</>
              )}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
              <span>{Math.round(progressPercent)}% Complete</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Current Step Content */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700">
            <p className="text-slate-300 text-lg leading-relaxed">
              {currentStep?.description}
            </p>
          </div>

          {/* Personalized Guide */}
          {currentStepIndex === 0 && (
            <div className="space-y-4">
              {!personalizedGuide ? (
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">Get Your Personalized Guide</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    AI will create a custom onboarding plan based on your role and goals.
                  </p>
                  <Button
                    onClick={generatePersonalizedGuide}
                    disabled={isGeneratingGuide}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                    size="sm"
                  >
                    {isGeneratingGuide ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate My Guide
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700 space-y-4">
                  <p className="text-slate-300 text-sm italic">{personalizedGuide.welcome_message}</p>
                  
                  <div>
                    <h4 className="text-white font-medium text-sm mb-2">🚀 Quick Wins</h4>
                    <div className="space-y-2">
                      {personalizedGuide.quick_wins?.map((win, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="text-cyan-400 font-medium">{win.title}:</span>
                          <span className="text-slate-400"> {win.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium text-sm mb-2">💡 Pro Tips</h4>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {personalizedGuide.pro_tips?.map((tip, idx) => (
                        <li key={idx}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step Indicators */}
          <div className="flex justify-center gap-2">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === currentStepIndex ? "w-8 bg-gradient-to-r from-blue-500 to-cyan-500" :
                  idx < currentStepIndex ? "w-2 bg-cyan-500/50" : "w-2 bg-slate-700"
                )}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-slate-800">
          <div>
            {currentStepIndex === 0 ? (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-slate-400 hover:text-white"
              >
                Skip Tutorial
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="border-slate-700 text-slate-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            {currentStepIndex === steps.length - 1 ? (
              <>
                Complete
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                {currentStep?.action || 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}