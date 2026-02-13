import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DynamicTaskCard({ currentPage, completedSteps, userRole, onTaskComplete }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRecommendation();
  }, [currentPage, completedSteps?.length]);

  const loadRecommendation = async () => {
    try {
      setLoading(true);
      const projects = await base44.entities.AppProject.list();
      
      const response = await base44.functions.invoke('recommendNextTask', {
        currentPage,
        completedSteps: completedSteps || [],
        userRole,
        recentProjects: projects.length
      });

      if (response.data.success) {
        setTask(response.data.recommendation);
      }
    } catch (error) {
      console.error('Failed to load recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeAction = () => {
    if (task?.page_to_visit && task.page_to_visit !== 'null') {
      navigate(createPageUrl(task.page_to_visit));
      toast.success('Taking you there!');
    }
    if (onTaskComplete) {
      onTaskComplete(task?.task_title);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!task) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <Badge variant="outline" className="text-purple-400 border-purple-400/30">
                AI Recommended
              </Badge>
            </div>
            <CardTitle className="text-white text-lg">{task.task_title}</CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              {task.task_description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{task.estimated_minutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Priority</span>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
          <p className="text-xs text-slate-400">
            <span className="text-purple-400 font-medium">Why this matters:</span> {task.why_important}
          </p>
        </div>

        <Button 
          onClick={handleTakeAction}
          className="w-full bg-purple-500 hover:bg-purple-600"
        >
          {task.page_to_visit && task.page_to_visit !== 'null' ? 'Take Me There' : 'Got It'}
        </Button>
      </CardContent>
    </Card>
  );
}