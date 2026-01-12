import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Clock, 
  ExternalLink,
  Eye,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

const statusConfig = {
  queued: { icon: Clock, color: "text-slate-400 bg-slate-500/20", label: "Queued" },
  building: { icon: Loader2, color: "text-blue-400 bg-blue-500/20", label: "Building", spin: true },
  deploying: { icon: Loader2, color: "text-cyan-400 bg-cyan-500/20", label: "Deploying", spin: true },
  ready: { icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/20", label: "Ready" },
  error: { icon: AlertCircle, color: "text-red-400 bg-red-500/20", label: "Error" },
  cancelled: { icon: AlertCircle, color: "text-slate-400 bg-slate-500/20", label: "Cancelled" },
};

const providerLogos = {
  vercel: "▲",
  netlify: "◆",
  aws: "☁",
  heroku: "◉",
};

export default function DeploymentCard({ deployment, onViewLogs, onVisit }) {
  const status = statusConfig[deployment.status] || statusConfig.queued;
  const StatusIcon = status.icon;

  return (
    <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl hover:border-slate-700/50 transition-all">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", status.color)}>
              <StatusIcon className={cn("w-5 h-5", status.spin && "animate-spin")} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {providerLogos[deployment.provider]}
                </span>
                <h3 className="text-white font-semibold capitalize">
                  {deployment.provider}
                </h3>
                <Badge className={cn("text-xs", status.color)}>
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Badge variant="outline" className="text-xs border-slate-700">
                  {deployment.environment}
                </Badge>
                <span>{format(new Date(deployment.created_date), 'MMM d, HH:mm')}</span>
              </div>
            </div>
          </div>
        </div>

        {deployment.url && deployment.status === 'ready' && (
          <div className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <a
                  href={deployment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm truncate"
                >
                  {deployment.url}
                </a>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(deployment.url, '_blank')}
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {deployment.preview_url && (
          <div className="mb-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm">Preview Available</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(deployment.preview_url, '_blank')}
                className="text-purple-400 hover:text-purple-300"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            {deployment.commit_hash && (
              <span className="font-mono text-xs">
                {deployment.commit_hash.substring(0, 7)}
              </span>
            )}
            {deployment.duration_ms && (
              <span>{(deployment.duration_ms / 1000).toFixed(1)}s</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewLogs?.(deployment)}
            className="text-blue-400 hover:text-blue-300"
          >
            View Logs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}