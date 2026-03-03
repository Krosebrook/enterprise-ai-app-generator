import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Clock, ArrowRight, X, Loader2 } from 'lucide-react';

export default function DynamicTaskCard({ currentPage, completedSteps, userRole, onDismiss }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check cache first to avoid expensive AI call every render
    const cached = sessionStorage.getItem('vibecode_task_rec');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setTask(parsed);
        setLoading(false);
        return;
      } catch {}
    }
    loadRecommendation();
  }, []);

  const loadRecommendation = async () => {
    try {
      setLoading(true);
      const projects = await base44.entities.AppProject.list('-created_date', 5);
      const response = await base44.functions.invoke('recommendNextTask', {
        currentPage,
        completedSteps: completedSteps || [],
        userRole,
        recentProjects: projects.length
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

  if (loading) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-purple-400 flex-shrink-0" />
        <span>Finding your next best action…</span>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="flex items-center gap-4 px-5 py-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-slate-900/50 to-slate-900/50 border border-purple-500/20">
      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white font-medium text-sm truncate">{task.task_title}</span>
          <span className="text-slate-500 text-xs flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3" />{task.estimated_minutes}m
          </span>
        </div>
        <p className="text-slate-400 text-xs truncate">{task.why_important}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          onClick={handleAction}
          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 h-8 text-xs"
        >
          {task.page_to_visit && task.page_to_visit !== 'null' ? (
            <>Go <ArrowRight className="w-3 h-3 ml-1" /></>
          ) : 'Got it'}
        </Button>
        <button
          onClick={() => { sessionStorage.removeItem('vibecode_task_rec'); onDismiss?.(); }}
          className="text-slate-600 hover:text-slate-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}