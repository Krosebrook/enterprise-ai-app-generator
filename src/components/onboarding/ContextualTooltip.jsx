import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HelpCircle, X, Lightbulb } from 'lucide-react';
import { cn } from "@/lib/utils";

const tooltipContent = {
  'generate-app': {
    title: 'Generate App',
    description: 'AI will create a full-stack application based on your selected template and features. The process takes 30-60 seconds.',
    tips: ['Choose features carefully - you can always add more later', 'Select the AI model that fits your complexity needs']
  },
  'ai-model': {
    title: 'AI Model Selection',
    description: 'Different models excel at different tasks. GPT-4 is best for complex apps, Claude for creative solutions, Gemini for speed.',
    tips: ['GPT-4 Turbo: Fast and reliable for most projects', 'Claude 3: Best for innovative features']
  },
  'deployment': {
    title: 'One-Click Deployment',
    description: 'Deploy your app to production instantly. We handle build optimization, environment setup, and hosting configuration.',
    tips: ['Vercel: Fastest deployment', 'AWS: Most control and scalability']
  },
  'save-template': {
    title: 'Save as Template',
    description: 'Convert your project into a reusable template. AI will generate professional metadata and preview images.',
    tips: ['Let AI generate descriptions for better discoverability', 'Add relevant tags for searchability']
  },
  'code-editor': {
    title: 'AI Code Assistant',
    description: 'Get real-time AI help with refactoring, debugging, explaining, and improving your code. Context-aware suggestions based on your stack.',
    tips: ['Use Explain mode to learn architectural patterns', 'Debug mode finds issues automatically']
  },
  'project-insights': {
    title: 'Project Intelligence',
    description: 'AI analyzes your project to predict timelines, identify bottlenecks, and optimize resource allocation.',
    tips: ['Review bottlenecks to avoid delays', 'Use completion predictions for planning']
  },
  'pipeline': {
    title: 'CI/CD Pipeline',
    description: 'Automated build and deployment pipeline. Runs tests, builds your app, and deploys to multiple environments.',
    tips: ['Set up pipelines early for consistency', 'Use preview deployments to test changes']
  }
};

export default function ContextualTooltip({ 
  id, 
  children, 
  position = 'bottom',
  showOnHover = false,
  autoShow = false,
  autoShowDelay = 1000
}) {
  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const content = tooltipContent[id];

  useEffect(() => {
    if (autoShow && !hasShown && content) {
      const timer = setTimeout(() => {
        setOpen(true);
        setHasShown(true);
      }, autoShowDelay);
      return () => clearTimeout(timer);
    }
  }, [autoShow, hasShown, content, autoShowDelay]);

  if (!content) return children;

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (newOpen) {
      setHasShown(true);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="relative inline-flex">
          {children}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className={cn(
              "absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center",
              "hover:scale-110 transition-transform shadow-lg",
              "animate-pulse"
            )}
          >
            <HelpCircle className="w-3 h-3 text-white" />
          </button>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="bg-slate-900 border-slate-700 text-white w-80"
        side={position}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <h4 className="font-semibold text-sm">{content.title}</h4>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            {content.description}
          </p>

          {content.tips && content.tips.length > 0 && (
            <div className="pt-3 border-t border-slate-800">
              <p className="text-cyan-400 text-xs font-medium mb-2">💡 Pro Tips</p>
              <ul className="space-y-1 text-xs text-slate-400">
                {content.tips.map((tip, idx) => (
                  <li key={idx}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          <Button
            onClick={() => setOpen(false)}
            size="sm"
            className="w-full bg-slate-800 hover:bg-slate-700 text-xs"
          >
            Got it!
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}