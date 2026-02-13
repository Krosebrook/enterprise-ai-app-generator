import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UserCheck, Target, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

export default function TaskRecommendations({ projectId }) {
  const [taskDescription, setTaskDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [priority, setPriority] = useState('medium');
  const [recommendation, setRecommendation] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const getRecommendation = async () => {
    if (!taskDescription.trim()) {
      toast.error('Please enter a task description');
      return;
    }

    setAnalyzing(true);
    try {
      const { data } = await base44.functions.invoke('recommendTaskAssignment', {
        project_id: projectId,
        task_description: taskDescription,
        required_skills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        estimated_hours: estimatedHours ? parseInt(estimatedHours) : null,
        priority
      });
      setRecommendation(data);
      toast.success('Task assignment recommended');
    } catch (error) {
      toast.error('Failed to get recommendation: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-cyan-400" />
          <CardTitle className="text-white">AI Task Assignment</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Form */}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Task Description</label>
            <Textarea
              placeholder="Describe the task..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Required Skills (comma-separated)</label>
              <Input
                placeholder="React, TypeScript, API"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Estimated Hours</label>
              <Input
                type="number"
                placeholder="8"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1 block">Priority</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'urgent'].map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant={priority === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority(p)}
                  className={cn(priority === p && "bg-blue-500 hover:bg-blue-600")}
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={getRecommendation}
            disabled={analyzing}
            className="w-full bg-cyan-500 hover:bg-cyan-600"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Team...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Recommendation
              </>
            )}
          </Button>
        </div>

        {/* Recommendation Results */}
        {recommendation && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            {/* Primary Recommendation */}
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-green-400" />
                <h4 className="text-sm font-semibold text-green-300">Recommended Assignee</h4>
                <Badge className="ml-auto bg-green-500/20 text-green-400">
                  {recommendation.assignment.recommendation_confidence}% match
                </Badge>
              </div>
              <p className="text-white font-medium mb-2">
                {recommendation.assignment.recommended_assignee}
              </p>
              {recommendation.reasoning && (
                <p className="text-xs text-green-200">{recommendation.reasoning}</p>
              )}
            </div>

            {/* Alternative Assignees */}
            {recommendation.alternatives?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Alternative Options</h4>
                <div className="space-y-2">
                  {recommendation.alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-800/30 border border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm text-white font-medium">{alt.email}</p>
                        <p className="text-xs text-slate-400">{alt.reason}</p>
                      </div>
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        {alt.match_score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}