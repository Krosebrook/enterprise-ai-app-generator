import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

const statusColors = {
  success: "text-emerald-400",
  failed: "text-red-400",
  running: "text-amber-400",
  pending: "text-slate-400",
};

export default function LogViewer({ pipeline, open, onClose }) {
  const [copied, setCopied] = useState(false);

  const copyLogs = () => {
    navigator.clipboard.writeText(pipeline?.logs || '');
    setCopied(true);
    toast.success('Logs copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLogs = () => {
    const blob = new Blob([pipeline?.logs || ''], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-${pipeline?.id}-logs.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logs downloaded');
  };

  if (!pipeline) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pipeline Logs</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyLogs}
                className="text-slate-400 hover:text-white"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadLogs}
                className="text-slate-400 hover:text-white"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="flex-1 flex flex-col">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="all">All Logs</TabsTrigger>
            {pipeline.stages?.map((stage, idx) => (
              <TabsTrigger key={idx} value={`stage-${idx}`}>
                {stage.name}
                <Badge 
                  className={cn("ml-2 text-xs", statusColors[stage.status])}
                  variant="outline"
                >
                  {stage.status}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="flex-1 mt-4">
            <div className="bg-slate-950 rounded-xl p-4 h-full overflow-auto font-mono text-sm">
              <pre className="text-slate-300 whitespace-pre-wrap">
                {pipeline.logs || 'No logs available'}
              </pre>
            </div>
          </TabsContent>

          {pipeline.stages?.map((stage, idx) => (
            <TabsContent key={idx} value={`stage-${idx}`} className="flex-1 mt-4">
              <div className="bg-slate-950 rounded-xl p-4 h-full overflow-auto font-mono text-sm">
                <div className="mb-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">{stage.name}</h3>
                    <Badge className={cn(statusColors[stage.status])} variant="outline">
                      {stage.status}
                    </Badge>
                  </div>
                  {stage.duration_ms && (
                    <p className="text-slate-500 text-xs mt-1">
                      Duration: {(stage.duration_ms / 1000).toFixed(2)}s
                    </p>
                  )}
                </div>
                <pre className="text-slate-300 whitespace-pre-wrap">
                  {stage.logs || 'No logs available for this stage'}
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}