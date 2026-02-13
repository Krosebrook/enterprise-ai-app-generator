import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, TrendingUp, AlertCircle, Loader2, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Progress } from "@/components/ui/progress";

export default function ProjectStatusReport({ projectId }) {
  const [report, setReport] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestReport();
  }, [projectId]);

  const loadLatestReport = async () => {
    try {
      const reports = await base44.entities.ProjectReport.filter({ project_id: projectId });
      if (reports.length > 0) {
        setReport(reports[0]);
      }
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateProjectReport', { project_id: projectId });
      setReport(data.report);
      toast.success('Status report generated');
    } catch (error) {
      toast.error('Failed to generate report: ' + error.message);
    } finally {
      setGenerating(false);
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
            <FileText className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-white">Project Status Report</CardTitle>
          </div>
          <Button
            onClick={generateReport}
            disabled={generating}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!report ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">No report generated yet</p>
            <Button onClick={generateReport} variant="outline">
              Generate First Report
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Executive Summary</h4>
              <p className="text-slate-400 leading-relaxed">{report.summary}</p>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-300">Overall Progress</h4>
                <span className="text-2xl font-bold text-white">{report.progress_percentage}%</span>
              </div>
              <Progress value={report.progress_percentage} className="h-3" />
            </div>

            {/* Completion Date */}
            {report.predicted_completion && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Calendar className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Predicted Completion</p>
                  <p className="text-sm font-semibold text-blue-300">
                    {format(new Date(report.predicted_completion), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {/* Key Achievements */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <h4 className="text-sm font-semibold text-white">Key Achievements</h4>
              </div>
              <ul className="space-y-2">
                {report.key_achievements?.map((achievement, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Roadblocks */}
            {report.roadblocks?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <h4 className="text-sm font-semibold text-white">Current Roadblocks</h4>
                </div>
                <div className="space-y-2">
                  {report.roadblocks.map((block, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-800/30 border border-slate-700"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                          {block.severity}
                        </Badge>
                        <p className="text-sm font-medium text-white">{block.issue}</p>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        <span className="font-semibold text-slate-300">Action: </span>
                        {block.suggested_action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feature Timelines */}
            {report.feature_timelines?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Feature Development Timeline</h4>
                <div className="space-y-2">
                  {report.feature_timelines.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30"
                    >
                      <div>
                        <p className="text-sm text-white font-medium">{feature.feature}</p>
                        <p className="text-xs text-slate-400">{feature.estimated_days} days estimated</p>
                      </div>
                      <Badge variant="outline" className="border-slate-700 text-slate-300">
                        {feature.confidence}% confidence
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Metadata */}
            <div className="text-xs text-slate-500 pt-4 border-t border-slate-800">
              Generated on {format(new Date(report.created_date), 'MMM d, yyyy h:mm a')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}