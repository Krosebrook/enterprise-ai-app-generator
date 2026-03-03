import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Clock, ArrowRight, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryColors = {
  setup: 'from-blue-500/20 to-blue-500/5 border-blue-500/25 text-blue-400',
  explore: 'from-purple-500/20 to-purple-500/5 border-purple-500/25 text-purple-400',
  deploy: 'from-green-500/20 to-green-500/5 border-green-500/25 text-green-400',
  learn: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/25 text-yellow-400',
  collaborate: 'from-pink-500/20 to-pink-500/5 border-pink-500/25 text-pink-400',
};

export default function DynamicTaskCard({ currentPage, completedSteps, userRole, onDismiss }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cached = sessionStorage.getItem('vibecode_task_rec');
    if (cached) {
      try {
        setTask(JSON.parse(cached));
        setLoading(false);
        return;
      } catch {}
    }
    loadRecommendation();
  }, []);

  const loadRecommendation = async () => {
    try {
      setLoading(true);
      const [projects, onboardingRecs] = await Promise.all([
        base44.entities.AppProject.list('-created_date', 5),
        base44.entities.OnboardingProgress.filter({})
      ]);

      const onboarding = onboardingRecs[0];

      const response = await base44.functions.invoke('recommendNextTask', {
        currentPage,
        completedSteps: completedSteps || [],
        userRole,
        recentProjects: projects.length,
        templateCategory: onboarding?.personalized_guide?.template || null,
        userGoal: onboarding?.personalized_guide?.goal || null,
        learningStyle: onboarding?.preferred_learning_style || 'mixed',
      });

      if (response.data.success) {
        setTask(response.data.recommendation);
        sessionStorage.setItem('vibecode_task_rec', JSON.stringify(response.data.recommendation));
      }
    } catch (error) {
      console.error('Task recommendation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    sessionStorage.removeItem('vibecode_task_rec');
    if (task?.page_to_visit && task.page_to_visit !== 'null') {
      navigate(createPageUrl(task.page_to_visit));
    }
    onDismiss?.();
  };

  const handleDismiss = () => {
    sessionStorage.removeItem('vibecode_task_rec');
    onDismiss?.();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-purple-400 flex-shrink-0" />
        <span>Finding your next best action…</span>
      </div>
    );
  }

  if (!task) return null;

  const colorClass = categoryColors[task.category] || categoryColors.explore;

  return (
    <div className={cn("flex items-center gap-4 px-5 py-4 rounded-xl bg-gradient-to-r border", colorClass.split(' ').slice(0, 2).join(' '), 'bg-slate-900/50', colorClass.split(' ')[2])}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", colorClass.split(' ')[2].replace('border-', 'bg-').replace('/25', '/20'))}>
        <Sparkles className={cn("w-4 h-4", colorClass.split(' ')[3])} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="text-white font-medium text-sm">{task.task_title}</span>
          <span className="text-slate-500 text-xs flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3" />{task.estimated_minutes}m
          </span>
          {task.category && (
            <span className={cn("text-xs px-1.5 py-0.5 rounded-full border", colorClass.split(' ').slice(0, 3).join(' '), 'capitalize')}>{task.category}</span>
          )}
        </div>
        <p className="text-slate-400 text-xs line-clamp-1">{task.why_important}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          onClick={handleAction}
          className="bg-white/10 hover:bg-white/15 text-white border border-white/10 h-8 text-xs"
        >
          {task.page_to_visit && task.page_to_visit !== 'null' ? (
            <>Go <ArrowRight className="w-3 h-3 ml-1" /></>
          ) : 'Got it'}
        </Button>
        <button onClick={handleDismiss} className="text-slate-600 hover:text-slate-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}