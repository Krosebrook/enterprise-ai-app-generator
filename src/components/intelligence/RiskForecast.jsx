import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Shield, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const severityConfig = {
  low: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '●' },
  medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: '●●' },
  high: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '●●●' },
  critical: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '●●●●' }
};

export default function RiskForecast({ projectId }) {
  const [risks, setRisks] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRisks();
  }, [projectId]);

  const loadRisks = async () => {
    try {
      const data = await base44.entities.ProjectRisk.filter({ project_id: projectId });
      setRisks(data);
    } catch (error) {
      console.error('Failed to load risks:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeRisks = async () => {
    setAnalyzing(true);
    try {
      const { data } = await base44.functions.invoke('analyzeProjectRisks', { project_id: projectId });
      setRisks(data.risks);
      toast.success('Risk analysis completed');
    } catch (error) {
      toast.error('Analysis failed: ' + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <CardTitle className="text-white">Risk Forecast & Mitigation</CardTitle>
          </div>
          <Button
            onClick={analyzeRisks}
            disabled={analyzing}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {risks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No risk analysis available</p>
            <Button onClick={analyzeRisks} variant="outline">
              Start Risk Analysis
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Risk Summary */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {['critical', 'high', 'medium', 'low'].map((severity) => {
                const count = risks.filter(r => r.severity === severity).length;
                return (
                  <div key={severity} className="text-center p-3 rounded-lg bg-slate-800/50">
                    <div className="text-2xl font-bold text-white">{count}</div>
                    <div className="text-xs text-slate-400 capitalize">{severity}</div>
                  </div>
                );
              })}
            </div>

            {/* Risk List */}
            <div className="space-y-3">
              {risks
                .sort((a, b) => {
                  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                  return severityOrder[b.severity] - severityOrder[a.severity];
                })
                .map((risk) => (
                  <div
                    key={risk.id}
                    className="p-4 rounded-lg bg-slate-800/30 border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={cn("text-xs", severityConfig[risk.severity].color)}>
                            {severityConfig[risk.severity].icon} {risk.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
                            {risk.risk_category}
                          </Badge>
                        </div>
                        <p className="text-white font-medium mb-1">{risk.description}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span>Probability: {risk.probability}%</span>
                          <span>Impact: {risk.impact_score}/10</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-blue-300 mb-1">Mitigation Plan</p>
                          <p className="text-xs text-blue-200">{risk.mitigation_plan}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}