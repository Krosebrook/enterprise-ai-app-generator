import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";

export default function TrendingTemplates({ onTemplateSelect }) {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const { data } = await base44.functions.invoke('getTrendingTemplates', {});
      setTrending(data.trending || []);
    } catch (error) {
      console.error('Failed to load trending:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Trending & Recommended for You</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trending.map((template) => (
          <Card
            key={template.id}
            onClick={() => onTemplateSelect(template)}
            className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors">
                  {template.name}
                </CardTitle>
                {template.trending_score > 0 && (
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {template.trending_score}
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className="w-fit text-xs border-slate-700 text-slate-300">
                {template.category}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-3 line-clamp-2">{template.description}</p>
              {template.recommendation_reason && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-300">{template.recommendation_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}