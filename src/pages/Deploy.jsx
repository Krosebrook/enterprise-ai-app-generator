import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Rocket, 
  Plus, 
  Trash2, 
  RefreshCw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import DeploymentCard from '@/components/deployment/DeploymentCard';
import LogViewer from '@/components/pipelines/LogViewer';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const providers = [
  { id: 'vercel', name: 'Vercel', icon: '▲', description: 'Zero-config deployments' },
  { id: 'netlify', name: 'Netlify', icon: '◆', description: 'Modern web hosting' },
  { id: 'aws', name: 'AWS', icon: '☁', description: 'Amazon Web Services' },
  { id: 'heroku', name: 'Heroku', icon: '◉', description: 'Platform as a Service' },
];

export default function Deploy() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('vercel');
  const [environment, setEnvironment] = useState('production');
  const [envVars, setEnvVars] = useState([{ key: '', value: '' }]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  const [logsOpen, setLogsOpen] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.AppProject.list(),
  });

  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['deployments', selectedProject],
    queryFn: () => {
      if (!selectedProject) return [];
      return base44.entities.Deployment.filter(
        { project_id: selectedProject },
        '-created_date'
      );
    },
    enabled: !!selectedProject,
  });

  const deployMutation = useMutation({
    mutationFn: async (data) => {
      setIsDeploying(true);
      
      // Simulate deployment process
      const deployment = await base44.entities.Deployment.create({
        project_id: data.project_id,
        provider: data.provider,
        environment: data.environment,
        status: 'building',
        env_vars: data.env_vars,
        commit_hash: Math.random().toString(36).substring(7),
        build_logs: '[INFO] Starting build...\n',
      });

      // Simulate build progression
      await new Promise(r => setTimeout(r, 2000));
      await base44.entities.Deployment.update(deployment.id, {
        status: 'deploying',
        build_logs: '[INFO] Build complete\n[INFO] Starting deployment...\n',
      });

      await new Promise(r => setTimeout(r, 2000));
      await base44.entities.Deployment.update(deployment.id, {
        status: 'ready',
        url: `https://${data.project_id}-${data.provider}.app`,
        build_logs: '[INFO] Deployment successful!\n',
        duration_ms: 4000,
      });

      setIsDeploying(false);
      return deployment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      toast.success('Deployment successful!');
    },
    onError: () => {
      setIsDeploying(false);
      toast.error('Deployment failed');
    },
  });

  const handleDeploy = () => {
    if (!selectedProject) {
      toast.error('Please select a project');
      return;
    }

    const envVarsObj = {};
    envVars.forEach(({ key, value }) => {
      if (key && value) envVarsObj[key] = value;
    });

    deployMutation.mutate({
      project_id: selectedProject,
      provider: selectedProvider,
      environment,
      env_vars: envVarsObj,
    });
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: '', value: '' }]);
  };

  const removeEnvVar = (index) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const updateEnvVar = (index, field, value) => {
    const updated = [...envVars];
    updated[index][field] = value;
    setEnvVars(updated);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Deploy</h1>
        <p className="text-slate-400">Deploy your applications to production</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Deployment Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                New Deployment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Selection */}
              <div>
                <Label className="text-slate-300 mb-2 block">Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Provider Selection */}
              <div>
                <Label className="text-slate-300 mb-3 block">Hosting Provider</Label>
                <div className="grid grid-cols-2 gap-3">
                  {providers.map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={cn(
                        "p-4 rounded-xl border transition-all text-left",
                        selectedProvider === provider.id
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-slate-800/30 border-slate-700 hover:border-slate-600"
                      )}
                    >
                      <div className="text-2xl mb-2">{provider.icon}</div>
                      <div className="text-sm font-medium text-white">{provider.name}</div>
                      <div className="text-xs text-slate-500">{provider.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Environment */}
              <div>
                <Label className="text-slate-300 mb-2 block">Environment</Label>
                <Select value={environment} onValueChange={setEnvironment}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="preview">Preview</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Environment Variables */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-slate-300">Environment Variables</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addEnvVar}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-3">
                  {envVars.map((envVar, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="KEY"
                        value={envVar.key}
                        onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white text-sm"
                      />
                      <Input
                        placeholder="value"
                        value={envVar.value}
                        onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white text-sm"
                        type="password"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEnvVar(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deploy Button */}
              <Button
                onClick={handleDeploy}
                disabled={!selectedProject || isDeploying}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Deployment History */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Deployment History</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['deployments'] })}
                  className="text-slate-400 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedProject ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Select a project to view deployments</p>
                </div>
              ) : isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 rounded-2xl bg-slate-800/50 animate-pulse" />
                  ))}
                </div>
              ) : deployments.length === 0 ? (
                <div className="text-center py-12">
                  <Rocket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No deployments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {deployments.map(deployment => (
                      <motion.div
                        key={deployment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <DeploymentCard
                          deployment={deployment}
                          onViewLogs={(d) => {
                            setSelectedDeployment({
                              ...d,
                              logs: d.build_logs + '\n' + (d.deploy_logs || ''),
                            });
                            setLogsOpen(true);
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <LogViewer
        pipeline={selectedDeployment}
        open={logsOpen}
        onClose={() => setLogsOpen(false)}
      />
    </div>
  );
}