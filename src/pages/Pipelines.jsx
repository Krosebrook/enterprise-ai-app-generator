import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  GitBranch, 
  Play, 
  RefreshCw, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Wand2
} from 'lucide-react';
import PipelineCard from '@/components/pipelines/PipelineCard';
import LogViewer from '@/components/pipelines/LogViewer';
import AutoPipelineConfig from '@/components/pipelines/AutoPipelineConfig';

export default function Pipelines() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [logsOpen, setLogsOpen] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.AppProject.list(),
  });

  const { data: pipelines = [], isLoading } = useQuery({
    queryKey: ['pipelines', selectedProject],
    queryFn: () => {
      if (selectedProject === 'all') {
        return base44.entities.Pipeline.list('-created_date');
      }
      return base44.entities.Pipeline.filter({ project_id: selectedProject }, '-created_date');
    },
  });

  const triggerMutation = useMutation({
    mutationFn: async (projectId) => {
      // Simulate triggering a pipeline
      return base44.entities.Pipeline.create({
        project_id: projectId,
        status: 'running',
        branch: 'main',
        commit_hash: Math.random().toString(36).substring(7),
        commit_message: 'Manual trigger',
        triggered_by: 'user',
        stages: [
          { name: 'Build', status: 'running', duration_ms: null },
          { name: 'Test', status: 'pending', duration_ms: null },
          { name: 'Deploy', status: 'pending', duration_ms: null },
        ],
        logs: '[INFO] Pipeline started...\n[INFO] Checking out code...\n',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
  });

  const stats = {
    total: pipelines.length,
    success: pipelines.filter(p => p.status === 'success').length,
    failed: pipelines.filter(p => p.status === 'failed').length,
    running: pipelines.filter(p => p.status === 'running').length,
  };

  const successRate = stats.total > 0 
    ? ((stats.success / stats.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">CI/CD Pipelines</h1>
          <p className="text-slate-400">Monitor your deployment pipelines</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48 bg-slate-900/50 border-slate-800 text-white">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => selectedProject !== 'all' && triggerMutation.mutate(selectedProject)}
            disabled={selectedProject === 'all' || triggerMutation.isPending}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            <Play className="w-4 h-4 mr-2" />
            Trigger Pipeline
          </Button>
        </div>
      </div>

      {/* AI Pipeline Generator */}
      <div className="mb-8">
        <AutoPipelineConfig projectId={selectedProject !== 'all' ? selectedProject : null} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Runs</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <GitBranch className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Success</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.success}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Failed</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{stats.failed}</p>
              </div>
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Success Rate</p>
                <p className="text-3xl font-bold text-cyan-400 mt-1">{successRate}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline List */}
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Recent Pipelines</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['pipelines'] })}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="bg-slate-800/50 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="running">Running</TabsTrigger>
              <TabsTrigger value="success">Success</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 rounded-2xl bg-slate-800/50 animate-pulse" />
                  ))}
                </div>
              ) : pipelines.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No pipeline runs yet</p>
                </div>
              ) : (
                pipelines.map(pipeline => (
                  <PipelineCard
                    key={pipeline.id}
                    pipeline={pipeline}
                    onViewLogs={(p) => {
                      setSelectedPipeline(p);
                      setLogsOpen(true);
                    }}
                  />
                ))
              )}
            </TabsContent>

            {['running', 'success', 'failed'].map(status => (
              <TabsContent key={status} value={status} className="space-y-4">
                {pipelines
                  .filter(p => p.status === status)
                  .map(pipeline => (
                    <PipelineCard
                      key={pipeline.id}
                      pipeline={pipeline}
                      onViewLogs={(p) => {
                        setSelectedPipeline(p);
                        setLogsOpen(true);
                      }}
                    />
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <LogViewer
        pipeline={selectedPipeline}
        open={logsOpen}
        onClose={() => setLogsOpen(false)}
      />
    </div>
  );
}