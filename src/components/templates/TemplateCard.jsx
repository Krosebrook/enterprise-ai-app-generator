import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight, Layers } from 'lucide-react';
import { cn } from "@/lib/utils";

const categoryColors = {
  saas: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ai: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "e-commerce": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  dashboard: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  mobile: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export default function TemplateCard({ template, onSelect }) {
  return (
    <div className="group relative rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 overflow-hidden hover:border-blue-500/30 transition-all duration-300">
      {/* Preview Image */}
      <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
        <Layers className="w-16 h-16 text-slate-700" />
        <div className="absolute top-3 right-3 z-20">
          <Badge className={cn("text-xs", categoryColors[template.category])}>
            {template.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">{template.name}</h3>
          <span className="text-xs text-slate-500">v{template.version}</span>
        </div>
        
        <p className="text-slate-400 text-sm line-clamp-2 mb-4">
          {template.description || "Professional template for building modern applications"}
        </p>

        {/* Features */}
        {template.features && template.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {template.features.slice(0, 3).map((feature, idx) => (
              <span key={idx} className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-400">
                {feature}
              </span>
            ))}
            {template.features.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-lg bg-slate-800 text-slate-500">
                +{template.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm">{template.popularity || 0}</span>
          </div>
          <Button 
            onClick={() => onSelect?.(template)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            Use Template
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}