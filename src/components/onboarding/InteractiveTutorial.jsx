import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const tutorialSteps = {
  Generator: [
    { id: 'select-template', title: 'Select a Template', description: 'Choose a starting point that matches your vision', action: 'Click on a template card' },
    { id: 'configure-features', title: 'Configure Features', description: 'Pick the features you need for your app', action: 'Select features from the list' },
    { id: 'choose-ai-model', title: 'Choose AI Model', description: 'Select the AI model that fits your needs', action: 'Pick your preferred model' },
    { id: 'generate-app', title: 'Generate Your App', description: 'Hit generate and watch the magic happen', action: 'Click Generate App' }
  ],
  Templates: [
    { id: 'search-nl', title: 'Natural Language Search', description: 'Search templates by describing what you need', action: 'Try asking "I need an e-commerce site"' },
    { id: 'view-trending', title: 'Check Trending', description: 'See what templates are popular', action: 'Browse the trending section' },
    { id: 'ai-review', title: 'Get AI Insights', description: 'View AI-generated reviews of templates', action: 'Click "View AI Review" on any template' }
  ],
  Intelligence: [
    { id: 'risk-analysis', title: 'Analyze Risks', description: 'Get AI-powered risk forecasts', action: 'Click "Analyze Risks"' },
    { id: 'security-scan', title: 'Security Posture', description: 'Check your app security', action: 'Run security analysis' },
    { id: 'status-report', title: 'Generate Report', description: 'Create automated status reports', action: 'Generate project report' }
  ],
  Collaboration: [
    { id: 'code-review', title: 'AI Code Review', description: 'Get intelligent code suggestions', action: 'Select a file and review' },
    { id: 'task-assign', title: 'Smart Task Assignment', description: 'Let AI recommend the best person for tasks', action: 'Create a new task' }
  ]
};

export default function InteractiveTutorial({ page, onComplete }) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = tutorialSteps[page] || [];
  const progress = (completedSteps.length / steps.length) * 100;

  const handleStepComplete = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      const newCompleted = [...completedSteps, stepId];
      setCompletedSteps(newCompleted);
      
      if (newCompleted.length === steps.length) {
        onComplete?.(page);
      } else {
        setActiveStep(activeStep + 1);
      }
    }
  };

  if (steps.length === 0) return null;

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-400" />
            Interactive Tutorial: {page}
          </CardTitle>
          <span className="text-sm text-slate-400">
            {completedSteps.length}/{steps.length} steps
          </span>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = index === activeStep;
          
          return (
            <div
              key={step.id}
              className={cn(
                "p-4 rounded-lg border transition-all",
                isCompleted && "bg-green-500/10 border-green-500/30",
                isActive && !isCompleted && "bg-blue-500/10 border-blue-500/30",
                !isActive && !isCompleted && "bg-slate-800/30 border-slate-700/50 opacity-60"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-600" />
                    )}
                    <h4 className="font-medium text-white">{step.title}</h4>
                  </div>
                  <p className="text-sm text-slate-400 ml-7">{step.description}</p>
                  <p className="text-xs text-blue-400 ml-7 mt-1">→ {step.action}</p>
                </div>
                {isActive && !isCompleted && (
                  <Button
                    size="sm"
                    onClick={() => handleStepComplete(step.id)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}