import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, MoreVertical, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

const statusConfig = {
  generating: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", dot: "bg-amber-400" },
  active: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", dot: "bg-emerald-400" },
  paused: { color: "bg-slate-500/20 text-slate-400 border-slate-500/30", dot: "bg-slate-400" },
  archived: { color: "bg-red-500/20 text-red-400 border-red-500/30", dot: "bg-red-400" },
};

export default function ProjectCard({ project, onStatusChange }) {
  const status = statusConfig[project.status] || statusConfig.active;

  return (
    <div className="group relative rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-6 hover:border-slate-700/50 transition-all duration-300">
      {/* Status Badge */}
      <div className="flex items-start justify-between mb-4">
        <Badge className={cn("flex items-center gap-2 px-3 py-1", status.color)}>
          <span className={cn("w-2 h-2 rounded-full animate-pulse", status.dot)} />
          {project.status}
        </Badge>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Project Info */}
      <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
      <p className="text-slate-400 text-sm line-clamp-2 mb-4">{project.description || "No description"}</p>

      {/* Template Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-500">Template:</span>
        <Badge variant="outline" className="text-xs border-slate-700 text-slate-300">
          {project.template}
        </Badge>
      </div>

      {/* AI Model */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-slate-500">AI Model:</span>
        <span className="text-xs text-blue-400">{project.ai_model || "gpt-4"}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
        <span className="text-xs text-slate-500">
          {project.last_deployed 
            ? `Deployed ${format(new Date(project.last_deployed), 'MMM d, yyyy')}`
            : 'Not deployed yet'}
        </span>
        <div className="flex gap-2">
          {project.status === 'active' ? (
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-400 hover:text-white"
              onClick={() => onStatusChange?.(project.id, 'paused')}
            >
              <Pause className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-400 hover:text-white"
              onClick={() => onStatusChange?.(project.id, 'active')}
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open
          </Button>
        </div>
      </div>
    </div>
  );
}