import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  AlertTriangle, 
  Loader2,
  Calendar,
  Users,
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

export default function ProjectInsights({ project }) {
  const [insights, setInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeProject = async () => {
    setIsAnalyzing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this project for timeline and resource optimization insights.

Project: ${project?.name}
Description: ${project?.description}
Template: ${project?.template}
Features: ${project?.features?.join(', ')}
AI Model: ${project?.ai_model}

Provide insights on:
1. **Timeline Analysis**
   - Estimated total project duration (weeks)
   - Critical path and milestones
   - Potential timeline risks

2. **Bottleneck Identification**
   - Top 3 potential bottlenecks ranked by impact
   - Each with: name, cause, impact level (high/medium/low), mitigation strategy

3. **Completion Prediction**
   - Estimated completion date (from today)
   - Confidence score (0-100%)
   - Key factors affecting completion

4. **Resource Optimization**
   - Recommended team size and roles
   - Resource allocation for each phase
   - Efficiency recommendations

Format as structured JSON with clear, actionable insights.`,
        response_json_schema: {
          type: "object",
          properties: {
            estimated_duration_weeks: { type: "number" },
            milestones: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  week: { type: "number" },
                  description: { type: "string" }
                }
              }
            },
            bottlenecks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  cause: { type: "string" },
                  impact_level: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            completion_date: { type: "string" },
            confidence_score: { type: "number" },
            completion_factors: {
              type: "array",
              items: { type: "string" }
            },
            team_composition: {
              type: "object",
              properties: {
                total_size: { type: "number" },
                roles: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      role: { type: "string" },
                      count: { type: "number" },
                      description: { type: "string" }
                    }
                  }
                }
              }
            },
            resource_allocation: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  allocation_percent: { type: "number" },
                  focus: { type: "string" }
                }
              }
            }
          }
        }
      });

      setInsights(result);
      toast.success('Project analysis complete!');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const impactColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Project Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!insights ? (
            <div className="text-center py-8">
              <Target className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">
                AI will analyze timelines, identify bottlenecks, predict completion, and optimize resources.
              </p>
              <Button
                onClick={analyzeProject}
                disabled={!project || isAnalyzing}
                className="bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analyze Project
                  </>
                )}
              </Button>
            </div>
          ) : (
            <>
              {/* Timeline Overview */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span className="text-slate-300 font-medium">Timeline</span>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300">{insights.estimated_duration_weeks} weeks</Badge>
                </div>
                <div className="space-y-2">
                  {insights.milestones?.slice(0, 3).map((milestone, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{milestone.name}</span>
                      <span className="text-blue-400">Week {milestone.week}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completion Prediction */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-300 font-medium">Estimated Completion</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300">
                    {insights.confidence_score}% confident
                  </Badge>
                </div>
                <p className="text-white font-semibold mb-2">{insights.completion_date}</p>
                <div className="flex h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500" 
                    style={{ width: `${insights.confidence_score}%` }}
                  />
                </div>
              </div>

              {/* Bottlenecks */}
              {insights.bottlenecks?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    Potential Bottlenecks
                  </h4>
                  <div className="space-y-2">
                    {insights.bottlenecks.map((bottleneck, idx) => (
                      <div key={idx} className={cn("p-3 rounded-lg border", impactColors[bottleneck.impact_level.toLowerCase()])}>
                        <div className="font-medium text-sm mb-1">{bottleneck.name}</div>
                        <p className="text-xs opacity-80 mb-2">{bottleneck.cause}</p>
                        <p className="text-xs"><strong>Fix:</strong> {bottleneck.mitigation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resource Allocation */}
              {insights.team_composition && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    Recommended Team
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {insights.team_composition.roles?.map((role, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
                        <div className="text-white font-medium text-sm">{role.role}</div>
                        <div className="text-cyan-400 text-lg font-bold">{role.count}</div>
                        <div className="text-xs text-slate-400">{role.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Allocation Chart */}
              {insights.resource_allocation?.length > 0 && (
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Resource Allocation by Phase
                  </h4>
                  <div className="space-y-2">
                    {insights.resource_allocation.map((alloc, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-400">{alloc.phase}</span>
                          <span className="text-cyan-400">{alloc.allocation_percent}%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            style={{ width: `${alloc.allocation_percent}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={analyzeProject}
                className="w-full border-slate-700 text-slate-400"
              >
                Re-analyze
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}