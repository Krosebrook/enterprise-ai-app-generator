import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Sparkles, Loader2, AlertTriangle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const pages = ['Dashboard', 'Generator', 'Templates', 'Intelligence', 'Collaboration', 'All'];

export default function UXInsightsPanel() {
  const [selectedPage, setSelectedPage] = useState('All');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeUX = async () => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('analyzeUXPatterns', {
        page: selectedPage === 'All' ? null : selectedPage
      });

      if (response.data.success) {
        setInsights(response.data);
        toast.success('UX analysis complete!');
      }
    } catch (error) {
      toast.error('Failed to analyze UX patterns');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          AI UX Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="flex-1 bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pages.map(page => (
                <SelectItem key={page} value={page}>{page}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={analyzeUX}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-blue-500"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Analyze</>
            )}
          </Button>
        </div>

        {insights && (
          <div className="space-y-4">
            {/* Usability Score */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Usability Score</span>
                <span className={`text-3xl font-bold ${getScoreColor(insights.insights.usability_score)}`}>
                  {insights.insights.usability_score}
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${insights.insights.usability_score}%` }}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-800/50">
                <p className="text-xs text-slate-400">Total Sessions</p>
                <p className="text-xl font-bold text-white">{insights.metrics.total_sessions}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/50">
                <p className="text-xs text-slate-400">Avg Duration</p>
                <p className="text-xl font-bold text-white">
                  {insights.metrics.avg_session_duration.toFixed(1)}s
                </p>
              </div>
            </div>

            {/* Friction Analysis */}
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <h4 className="text-white font-medium flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Friction Analysis
              </h4>
              <p className="text-sm text-slate-300">{insights.insights.friction_analysis}</p>
              
              {insights.metrics.friction_summary && insights.metrics.friction_summary.length > 0 && (
                <div className="mt-3 space-y-1">
                  {insights.metrics.friction_summary.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{item.location}</span>
                      <Badge variant="outline" className="text-red-400 border-red-400/30">
                        {item.high_severity} high severity
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <h4 className="text-white font-medium flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                Recommendations
              </h4>
              <ul className="space-y-2">
                {insights.insights.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Wins */}
            {insights.insights.quick_wins && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <h4 className="text-white font-medium mb-2">⚡ Quick Wins</h4>
                <ul className="space-y-1">
                  {insights.insights.quick_wins.map((win, idx) => (
                    <li key={idx} className="text-sm text-slate-300">• {win}</li>
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