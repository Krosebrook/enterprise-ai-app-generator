import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, ChevronRight, Play, Sparkles, X, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

const tutorialSteps = {
  Generator: [
    { id: 'select-template', title: 'Select a Template', description: 'Choose a starting point that matches your vision', action: 'Click on a template card below', tip: 'SaaS Core v1.2.0 is the most battle-tested starter for subscription apps.' },
    { id: 'configure-features', title: 'Configure Features', description: 'Pick the features you need for your app', action: 'Select features from the list', tip: 'Start with Auth + Database. You can always add Payments later without breaking the app.' },
    { id: 'choose-ai-model', title: 'Choose AI Model', description: 'Select the AI model that fits your needs', action: 'Pick your preferred model', tip: 'GPT-4 Turbo hits the sweet spot of speed and capability for most apps.' },
    { id: 'generate-app', title: 'Generate Your App', description: 'Hit generate and watch the magic happen', action: 'Click the Generate App button', tip: 'Keep the tab open during generation — it only takes ~30 seconds.' },
  ],
  Templates: [
    { id: 'search-nl', title: 'Natural Language Search', description: 'Search templates by describing what you need', action: 'Try: "I need a SaaS app with subscriptions"', tip: 'The more specific your description, the better the AI matches.' },
    { id: 'view-trending', title: 'Check Trending', description: 'See what templates others are using', action: 'Browse the trending section', tip: 'Trending templates have community-proven patterns and fewer edge cases.' },
    { id: 'ai-review', title: 'Get AI Insights', description: 'View AI-generated reviews of templates', action: 'Click "View AI Review" on any template', tip: 'AI reviews flag gotchas like "missing mobile responsiveness" upfront.' },
  ],
  Intelligence: [
    { id: 'select-project', title: 'Select a Project', description: 'Choose the project you want to analyze', action: 'Use the project dropdown', tip: 'Intelligence works best on projects that have been active for a few days.' },
    { id: 'risk-analysis', title: 'Analyze Risks', description: 'Get AI-powered risk forecasts for your project', action: 'Click "Analyze Risks"', tip: 'Pay attention to "high probability + high impact" risks — those are your blockers.' },
    { id: 'security-scan', title: 'Security Posture', description: 'Check your app security profile', action: 'Run security analysis', tip: 'GDPR and OWASP Top 10 checks are the most impactful ones for production.' },
    { id: 'status-report', title: 'Generate Report', description: 'Create an automated status report', action: 'Click Generate Report', tip: 'Use weekly reports for stakeholder updates — they auto-format into shareable summaries.' },
  ],
  Collaboration: [
    { id: 'code-review', title: 'AI Code Review', description: 'Get intelligent code suggestions on any file', action: 'Select a file and run review', tip: 'Focus on "high severity" issues first — medium ones are usually style preferences.' },
    { id: 'task-assign', title: 'Smart Task Assignment', description: 'Let AI recommend the best person for tasks', action: 'Create a new task assignment', tip: 'Provide required skills accurately — that\'s the main signal the AI uses.' },
  ],
  Deploy: [
    { id: 'env-vars', title: 'Set Environment Variables', description: 'Configure your secrets and config', action: 'Add required ENV vars', tip: 'Never put secrets in source code. Env vars here are encrypted at rest.' },
    { id: 'choose-provider', title: 'Choose Deploy Provider', description: 'Select where to host your app', action: 'Pick Vercel, Netlify, or AWS', tip: 'Vercel is the fastest for frontend-heavy apps. AWS gives you the most control.' },
    { id: 'trigger-deploy', title: 'Deploy!', description: 'Trigger your first deployment', action: 'Click Deploy Now', tip: 'Your first deploy will be slower — subsequent ones are incremental and much faster.' },
  ],
  Pipelines: [
    { id: 'view-pipeline', title: 'View Pipeline Status', description: 'See live build and test status', action: 'Select a project to see its pipelines', tip: 'Green pipeline = your main branch is healthy and deployable.' },
    { id: 'view-logs', title: 'Inspect Logs', description: 'Dig into build and test logs', action: 'Click "View Logs" on any pipeline run', tip: 'Search for "ERROR:" in the logs to jump straight to failures.' },
  ],
};

export default function InteractiveTutorial({ page, onComplete, defaultOpen = true }) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [expanded, setExpanded] = useState(defaultOpen);
  const [dismissed, setDismissed] = useState(false);

  const steps = tutorialSteps[page] || [];
  const progressPct = steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0;

  // Persist completed steps to onboarding entity
  const handleStepComplete = async (stepId) => {
    if (completedSteps.includes(stepId)) return;
    const newCompleted = [...completedSteps, stepId];
    setCompletedSteps(newCompleted);

    if (newCompleted.length === steps.length) {
      onComplete?.(page);
      try {
        const user = await base44.auth.me();
        const existing = await base44.entities.OnboardingProgress.filter({ user_email: user.email });
        if (existing.length > 0) {
          const prev = existing[0].completed_tutorials || [];
          if (!prev.includes(page)) {
            await base44.entities.OnboardingProgress.update(existing[0].id, {
              completed_tutorials: [...prev, page]
            });
          }
        }
      } catch {}
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  if (steps.length === 0 || dismissed) return null;

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-left flex-1">
            <Play className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <CardTitle className="text-white text-base">
              {page} Tutorial
            </CardTitle>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
              {completedSteps.length}/{steps.length}
            </Badge>
          </button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="h-7 text-slate-400 hover:text-white px-2 text-xs">
              {expanded ? 'Hide' : 'Show'}
            </Button>
            <button onClick={() => setDismissed(true)} className="text-slate-600 hover:text-slate-400 ml-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <Progress value={progressPct} className="h-1 bg-slate-800 mt-2" />
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-2 pt-0">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isActive = index === activeStep;

            return (
              <div key={step.id} className={cn(
                "p-3 rounded-lg border transition-all",
                isCompleted && "bg-emerald-500/5 border-emerald-500/20",
                isActive && !isCompleted && "bg-blue-500/8 border-blue-500/25",
                !isActive && !isCompleted && "bg-slate-800/20 border-slate-800/50 opacity-55"
              )}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className={cn("w-5 h-5 rounded-full border-2 flex-shrink-0", isActive ? "border-blue-400" : "border-slate-600")} />
                      )}
                      <h4 className={cn("font-medium text-sm", isCompleted ? "text-slate-500 line-through" : "text-white")}>{step.title}</h4>
                    </div>
                    <p className="text-xs text-slate-400 ml-7">{step.description}</p>
                    {isActive && !isCompleted && (
                      <p className="text-xs text-blue-400 ml-7 mt-1">→ {step.action}</p>
                    )}
                    {isActive && !isCompleted && step.tip && (
                      <p className="text-xs text-cyan-400/80 ml-7 mt-1.5 flex items-start gap-1">
                        <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5 text-yellow-400" />{step.tip}
                      </p>
                    )}
                  </div>
                  {isActive && !isCompleted && (
                    <Button size="sm" onClick={() => handleStepComplete(step.id)} className="bg-blue-500 hover:bg-blue-600 h-7 px-2">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {completedSteps.length === steps.length && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">Tutorial complete! Great work.</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}