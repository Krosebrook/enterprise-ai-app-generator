import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertOctagon, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const severityConfig = {
  low: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }
};

export default function SecurityPosture({ projectId }) {
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, [projectId]);

  const loadAnalysis = async () => {
    try {
      const data = await base44.entities.SecurityAnalysis.filter({ project_id: projectId });
      if (data.length > 0) {
        setAnalysis(data[0]);
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data } = await base44.functions.invoke('analyzeSecurityPosture', { project_id: projectId });
      setAnalysis(data.analysis);
      toast.success('Security analysis completed');
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

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            <CardTitle className="text-white">Security Posture Analysis</CardTitle>
          </div>
          <Button
            onClick={runAnalysis}
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
        {!analysis ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No security analysis available</p>
            <Button onClick={runAnalysis} variant="outline">
              Start Security Analysis
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center p-6 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-sm text-slate-400 mb-2">Security Score</p>
              <p className={cn("text-5xl font-bold", getScoreColor(analysis.overall_score))}>
                {analysis.overall_score}
              </p>
              <p className="text-xs text-slate-500 mt-1">out of 100</p>
            </div>

            {/* Compliance Status */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Compliance Status</h4>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(analysis.compliance_status || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className={cn(
                      "p-3 rounded-lg border text-center",
                      value
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    )}
                  >
                    {value ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                    )}
                    <p className="text-xs font-semibold text-white uppercase">{key.replace('_', ' ')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vulnerabilities */}
            {analysis.vulnerabilities?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertOctagon className="w-4 h-4 text-orange-400" />
                  <h4 className="text-sm font-semibold text-white">
                    Identified Vulnerabilities ({analysis.vulnerabilities.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {analysis.vulnerabilities
                    .sort((a, b) => {
                      const order = { critical: 4, high: 3, medium: 2, low: 1 };
                      return order[b.severity] - order[a.severity];
                    })
                    .map((vuln, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-lg border",
                          severityConfig[vuln.severity].bg,
                          severityConfig[vuln.severity].border
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <Badge className={cn("text-xs mb-2", severityConfig[vuln.severity].color)}>
                              {vuln.severity}
                            </Badge>
                            <p className="text-sm font-medium text-white">{vuln.type}</p>
                            <p className="text-xs text-slate-400 mt-1">{vuln.location}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-300 mb-2">{vuln.description}</p>
                        <div className="p-2 rounded bg-slate-900/50 mt-2">
                          <p className="text-xs text-green-300">
                            <span className="font-semibold">Fix: </span>
                            {vuln.fix_suggestion}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Security Recommendations</h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <Shield className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}