import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Loader2,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

export default function DeploymentAnalysis({ projectId, onStrategySelect }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeDeployment = async () => {
    if (!projectId) {
      toast.error('Please select a project first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this project for deployment readiness and provide recommendations.

Project ID: ${projectId}

Analyze the following aspects:
1. **Readiness Score** (0-100): Overall deployment readiness
2. **Risks**: List potential deployment risks (security, performance, compatibility)
3. **Recommended Strategy**: Choose from:
   - Blue/Green: Zero-downtime with instant rollback
   - Canary: Gradual rollout to subset of users
   - Rolling: Sequential server updates
   - All-at-once: Immediate full deployment
4. **Optimizations**: Suggested improvements before deployment
5. **Estimated Deployment Time**: In minutes
6. **CI/CD Recommendations**: Pipeline configuration suggestions

Provide concise, actionable insights.`,
        response_json_schema: {
          type: "object",
          properties: {
            readiness_score: { type: "number" },
            readiness_label: { type: "string" },
            recommended_strategy: { type: "string" },
            strategy_reasoning: { type: "string" },
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  severity: { type: "string" },
                  category: { type: "string" },
                  description: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            optimizations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            estimated_time_minutes: { type: "number" },
            cicd_recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAnalysis(result);
      toast.success('Analysis complete!');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const strategies = [
    { 
      id: 'blue-green', 
      name: 'Blue/Green', 
      icon: Target,
      description: 'Zero-downtime with instant rollback',
      color: 'text-blue-400'
    },
    { 
      id: 'canary', 
      name: 'Canary', 
      icon: TrendingUp,
      description: 'Gradual rollout to subset of users',
      color: 'text-yellow-400'
    },
    { 
      id: 'rolling', 
      name: 'Rolling', 
      icon: Zap,
      description: 'Sequential server updates',
      color: 'text-cyan-400'
    },
    { 
      id: 'all-at-once', 
      name: 'All-at-once', 
      icon: Shield,
      description: 'Immediate full deployment',
      color: 'text-purple-400'
    },
  ];

  const severityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          AI Deployment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!analysis ? (
          <div className="text-center py-8">
            <Brain className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">
              AI will analyze your project for deployment readiness, suggest optimal strategies, and identify risks.
            </p>
            <Button
              onClick={analyzeDeployment}
              disabled={!projectId || isAnalyzing}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Project
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Readiness Score */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Deployment Readiness</span>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {analysis.readiness_label}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-white">
                  {analysis.readiness_score}
                  <span className="text-2xl text-slate-400">/100</span>
                </div>
                <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      analysis.readiness_score >= 80 ? "bg-emerald-500" :
                      analysis.readiness_score >= 60 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${analysis.readiness_score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recommended Strategy */}
            <div>
              <h3 className="text-white font-medium mb-3">Recommended Strategy</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {strategies.map(strategy => {
                  const Icon = strategy.icon;
                  const isRecommended = strategy.name === analysis.recommended_strategy;
                  return (
                    <button
                      key={strategy.id}
                      onClick={() => onStrategySelect?.(strategy.id)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        isRecommended
                          ? "bg-purple-500/10 border-purple-500/30 ring-2 ring-purple-500/20"
                          : "bg-slate-800/30 border-slate-700 hover:border-slate-600"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={cn("w-5 h-5", strategy.color)} />
                        <span className="text-white font-medium text-sm">{strategy.name}</span>
                        {isRecommended && (
                          <CheckCircle2 className="w-4 h-4 text-purple-400 ml-auto" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{strategy.description}</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-slate-400 bg-slate-800/30 p-3 rounded-lg">
                <strong className="text-white">Why?</strong> {analysis.strategy_reasoning}
              </p>
            </div>

            {/* Risks */}
            {analysis.risks?.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Identified Risks ({analysis.risks.length})
                </h3>
                <div className="space-y-3">
                  {analysis.risks.map((risk, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-800/30 border border-slate-700">
                      <div className="flex items-start gap-3">
                        <Badge className={cn("mt-0.5", severityColors[risk.severity.toLowerCase()])}>
                          {risk.severity}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium text-sm">{risk.category}</span>
                          </div>
                          <p className="text-slate-400 text-sm mb-2">{risk.description}</p>
                          <p className="text-emerald-400 text-xs">
                            <strong>Mitigation:</strong> {risk.mitigation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optimizations */}
            {analysis.optimizations?.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-3">Suggested Optimizations</h3>
                <div className="space-y-2">
                  {analysis.optimizations.map((opt, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-white text-sm font-medium mb-1">{opt.title}</h4>
                          <p className="text-slate-400 text-xs">{opt.description}</p>
                        </div>
                        <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 text-xs">
                          {opt.impact}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CI/CD Recommendations */}
            {analysis.cicd_recommendations?.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-3">CI/CD Configuration</h3>
                <div className="space-y-2">
                  {analysis.cicd_recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="text-sm text-slate-400">
                Estimated deployment time: <strong className="text-white">{analysis.estimated_time_minutes} min</strong>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={analyzeDeployment}
                className="border-slate-700 text-slate-400"
              >
                Re-analyze
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}