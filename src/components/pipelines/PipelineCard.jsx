import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Clock, 
  GitBranch,
  GitCommit,
  Play,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

const statusConfig = {
  pending: { icon: Clock, color: "text-slate-400 bg-slate-500/20", label: "Pending" },
  running: { icon: Loader2, color: "text-amber-400 bg-amber-500/20", label: "Running", spin: true },
  success: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/20", label: "Success" },
  failed: { icon: XCircle, color: "text-red-400 bg-red-500/20", label: "Failed" },
  cancelled: { icon: XCircle, color: "text-slate-400 bg-slate-500/20", label: "Cancelled" },
};

export default function PipelineCard({ pipeline, onViewLogs }) {
  const status = statusConfig[pipeline.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl hover:border-slate-700/50 transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", status.color)}>
                <StatusIcon className={cn("w-5 h-5", status.spin && "animate-spin")} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold">
                    {pipeline.commit_message || "Pipeline Run"}
                  </h3>
                  <Badge className={cn("text-xs", status.color)}>
                    {status.label}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {format(new Date(pipeline.created_date), 'MMM d, HH:mm:ss')}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <GitBranch className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">{pipeline.branch || "main"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <GitCommit className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400 font-mono text-xs">
                {pipeline.commit_hash?.substring(0, 7) || "N/A"}
              </span>
            </div>
          </div>

          {pipeline.stages && pipeline.stages.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-slate-500">Stages</span>
              </div>
              <div className="flex gap-2">
                {pipeline.stages.map((stage, idx) => {
                  const stageStatus = statusConfig[stage.status] || statusConfig.pending;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "flex-1 h-2 rounded-full",
                        stageStatus.color.split(' ')[1]
                      )}
                      title={stage.name}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>
                by {pipeline.triggered_by || pipeline.created_by}
              </span>
              {pipeline.duration_ms && (
                <span>{(pipeline.duration_ms / 1000).toFixed(1)}s</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewLogs?.(pipeline)}
              className="text-blue-400 hover:text-blue-300"
            >
              View Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}