import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCode, AlertCircle, Lightbulb, CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

const severityConfig = {
  info: { color: 'bg-blue-500/20 text-blue-400', icon: '●' },
  warning: { color: 'bg-yellow-500/20 text-yellow-400', icon: '●●' },
  error: { color: 'bg-orange-500/20 text-orange-400', icon: '●●●' },
  critical: { color: 'bg-red-500/20 text-red-400', icon: '●●●●' }
};

const qualityConfig = {
  poor: { color: 'text-red-400', bg: 'bg-red-500/10' },
  fair: { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  good: { color: 'text-green-400', bg: 'bg-green-500/10' },
  excellent: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
};

export default function CodeReviewPanel({ projectId, filePath, codeContent }) {
  const [review, setReview] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  const runReview = async () => {
    setReviewing(true);
    try {
      const { data } = await base44.functions.invoke('analyzeCodeForReview', {
        project_id: projectId,
        file_path: filePath,
        code_content: codeContent
      });
      setReview(data.review);
      toast.success('Code review completed');
    } catch (error) {
      toast.error('Review failed: ' + error.message);
    } finally {
      setReviewing(false);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-white">AI Code Review</CardTitle>
          </div>
          <Button
            onClick={runReview}
            disabled={reviewing}
            size="sm"
            className="bg-purple-500 hover:bg-purple-600"
          >
            {reviewing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reviewing...
              </>
            ) : (
              'Run Review'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!review ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">Click "Run Review" to analyze this code</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Quality */}
            <div className={cn("p-4 rounded-lg text-center", qualityConfig[review.overall_quality].bg)}>
              <p className="text-sm text-slate-400 mb-1">Code Quality</p>
              <p className={cn("text-2xl font-bold capitalize", qualityConfig[review.overall_quality].color)}>
                {review.overall_quality}
              </p>
            </div>

            {/* Summary */}
            <div>
              <p className="text-slate-300 leading-relaxed">{review.summary}</p>
            </div>

            {/* Issues */}
            {review.issues_found?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <h4 className="text-sm font-semibold text-white">
                    Issues Found ({review.issues_found.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {review.issues_found.map((issue, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-800/30 border border-slate-700"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Badge className={cn("text-xs", severityConfig[issue.severity].color)}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-slate-700">
                          {issue.type}
                        </Badge>
                        {issue.line && (
                          <Badge variant="outline" className="text-xs border-slate-700">
                            Line {issue.line}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{issue.message}</p>
                      {issue.suggestion && (
                        <div className="p-2 rounded bg-green-500/10 border border-green-500/20">
                          <p className="text-xs text-green-300">
                            <span className="font-semibold">Suggestion: </span>
                            {issue.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {review.improvements?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <h4 className="text-sm font-semibold text-white">Suggested Improvements</h4>
                </div>
                <div className="space-y-2">
                  {review.improvements.map((improvement, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-xs bg-blue-500/20 text-blue-400">
                          {improvement.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-300">
                          {improvement.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-200">{improvement.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}