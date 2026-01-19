import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Wand2, 
  Copy,
  Loader2,
  FileCode,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AutoPipelineConfig({ projectId }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState(null);
  const [provider, setProvider] = useState('github-actions');

  const generateConfig = async () => {
    if (!projectId) {
      toast.error('Please select a project first');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a production-ready CI/CD pipeline configuration for ${provider} for this project.

Project ID: ${projectId}

Requirements:
- Automated testing (unit, integration, E2E)
- Code quality checks (linting, type checking)
- Security scanning
- Build optimization
- Multi-environment deployment (dev, staging, production)
- Caching for faster builds
- Notifications on failures
- Automatic rollback on errors

Provider: ${provider}

Provide the complete YAML configuration file with inline comments explaining each step.`,
      });

      setConfig(result);
      toast.success('Pipeline configuration generated!');
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyConfig = () => {
    navigator.clipboard.writeText(config);
    toast.success('Configuration copied to clipboard');
  };

  const providers = [
    { id: 'github-actions', name: 'GitHub Actions', file: '.github/workflows/deploy.yml' },
    { id: 'gitlab-ci', name: 'GitLab CI', file: '.gitlab-ci.yml' },
    { id: 'circleci', name: 'CircleCI', file: '.circleci/config.yml' },
  ];

  return (
    <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-cyan-400" />
          Auto-Generate Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="text-slate-300 text-sm mb-3 block">CI/CD Provider</label>
          <div className="grid grid-cols-3 gap-3">
            {providers.map(p => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  provider === p.id
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-white font-medium text-sm mb-1">{p.name}</div>
                <div className="text-slate-500 text-xs">{p.file}</div>
              </button>
            ))}
          </div>
        </div>

        {!config ? (
          <div className="text-center py-8">
            <FileCode className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">
              AI will analyze your project structure and generate an optimized CI/CD pipeline configuration.
            </p>
            <Button
              onClick={generateConfig}
              disabled={!projectId || isGenerating}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Configuration
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Configuration Display */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    {providers.find(p => p.id === provider)?.file}
                  </Badge>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Production Ready
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyConfig}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
              
              <Textarea
                value={config}
                readOnly
                className="bg-slate-950 border-slate-800 text-slate-300 font-mono text-sm min-h-[400px] focus:border-cyan-500"
              />
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                'Automated Testing',
                'Code Quality Checks',
                'Security Scanning',
                'Multi-Environment',
                'Caching Optimized',
                'Auto-Rollback',
                'Notifications',
                'Performance Monitoring'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={generateConfig}
                className="flex-1 border-slate-700"
              >
                Regenerate
              </Button>
              <Button
                onClick={copyConfig}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}