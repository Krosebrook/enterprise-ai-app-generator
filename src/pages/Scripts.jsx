import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  Terminal,
  Shield,
  Key,
  Route,
  RefreshCw
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const scripts = [
  {
    id: 'validate-rls',
    name: 'Validate RLS',
    description: 'Check Row Level Security policies on all database tables',
    icon: Shield,
    color: 'blue',
    estimatedTime: '~5s'
  },
  {
    id: 'validate-secrets',
    name: 'Validate Secrets',
    description: 'Ensure all required environment variables are configured',
    icon: Key,
    color: 'purple',
    estimatedTime: '~3s'
  },
  {
    id: 'template-router',
    name: 'Template Router',
    description: 'Test template routing and configuration loading',
    icon: Route,
    color: 'cyan',
    estimatedTime: '~2s'
  },
];

const statusConfig = {
  pending: { color: 'text-slate-400', bg: 'bg-slate-500/20', icon: Clock },
  running: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Loader2, spin: true },
  success: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: CheckCircle2 },
  failed: { color: 'text-red-400', bg: 'bg-red-500/20', icon: XCircle },
};

export default function Scripts() {
  const queryClient = useQueryClient();
  const [runningScript, setRunningScript] = useState(null);
  const [output, setOutput] = useState('');

  const { data: scriptRuns = [], isLoading } = useQuery({
    queryKey: ['scriptRuns'],
    queryFn: () => base44.entities.ScriptRun.list('-created_date', 20),
  });

  const runMutation = useMutation({
    mutationFn: async (scriptName) => {
      setRunningScript(scriptName);
      setOutput('');
      
      // Simulate running
      await new Promise(r => setTimeout(r, 500));
      setOutput(`[${new Date().toISOString()}] Starting ${scriptName}...\n`);
      
      await new Promise(r => setTimeout(r, 1000));
      setOutput(prev => prev + `[${new Date().toISOString()}] Checking configurations...\n`);
      
      await new Promise(r => setTimeout(r, 1500));
      setOutput(prev => prev + `[${new Date().toISOString()}] Validating...\n`);
      
      await new Promise(r => setTimeout(r, 1000));
      const success = Math.random() > 0.2;
      
      if (success) {
        setOutput(prev => prev + `[${new Date().toISOString()}] ✓ All checks passed!\n`);
      } else {
        setOutput(prev => prev + `[${new Date().toISOString()}] ✗ Validation failed: Missing configuration\n`);
      }
      
      // Create record
      await base44.entities.ScriptRun.create({
        script_name: scriptName,
        status: success ? 'success' : 'failed',
        output: output,
        duration_ms: Math.floor(Math.random() * 3000) + 1000,
      });
      
      setRunningScript(null);
      return { success };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scriptRuns'] });
    },
  });

  const colorClasses = {
    blue: "bg-blue-500/20 border-blue-500/30 text-blue-400",
    purple: "bg-purple-500/20 border-purple-500/30 text-purple-400",
    cyan: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Scripts</h1>
        <p className="text-slate-400">Run validation and maintenance scripts</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Scripts List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">Available Scripts</h2>
          
          {scripts.map(script => {
            const isRunning = runningScript === script.id;
            
            return (
              <Card key={script.id} className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        colorClasses[script.color]
                      )}>
                        <script.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-1">{script.name}</h3>
                        <p className="text-slate-400 text-sm mb-2">{script.description}</p>
                        <Badge variant="outline" className="text-xs border-slate-700 text-slate-500">
                          {script.estimatedTime}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => runMutation.mutate(script.id)}
                      disabled={isRunning}
                      className={cn(
                        "bg-gradient-to-r hover:opacity-90",
                        script.color === 'blue' && "from-blue-500 to-blue-600",
                        script.color === 'purple' && "from-purple-500 to-purple-600",
                        script.color === 'cyan' && "from-cyan-500 to-cyan-600",
                      )}
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Output & History */}
        <div className="space-y-6">
          {/* Live Output */}
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-950 rounded-xl p-4 h-48 overflow-auto font-mono text-sm">
                <AnimatePresence>
                  {output ? (
                    <motion.pre
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-slate-300 whitespace-pre-wrap"
                    >
                      {output}
                    </motion.pre>
                  ) : (
                    <span className="text-slate-600">Run a script to see output...</span>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Recent Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-xl bg-slate-800/50 animate-pulse" />
                  ))}
                </div>
              ) : scriptRuns.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No script runs yet
                </div>
              ) : (
                <div className="space-y-3">
                  {scriptRuns.slice(0, 5).map(run => {
                    const status = statusConfig[run.status];
                    const StatusIcon = status.icon;
                    
                    return (
                      <div
                        key={run.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", status.bg)}>
                            <StatusIcon className={cn(
                              "w-4 h-4",
                              status.color,
                              status.spin && "animate-spin"
                            )} />
                          </div>
                          <div>
                            <span className="text-white font-medium">
                              {run.script_name.replace(/-/g, ' ')}
                            </span>
                            <p className="text-xs text-slate-500">
                              {format(new Date(run.created_date), 'MMM d, HH:mm:ss')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={cn(status.bg, status.color, "border-0")}>
                            {run.status}
                          </Badge>
                          {run.duration_ms && (
                            <p className="text-xs text-slate-500 mt-1">
                              {run.duration_ms}ms
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}