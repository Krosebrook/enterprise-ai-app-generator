import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, ThumbsDown, Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AITemplateReview({ templateName, onClose }) {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReview();
  }, [templateName]);

  const loadReview = async () => {
    try {
      const { data } = await base44.functions.invoke('generateTemplateReview', { template_name: templateName });
      setReview(data.review);
    } catch (error) {
      console.error('Failed to load review:', error);
    } finally {
      setLoading(false);
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

  if (!review) return null;

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />);
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-slate-600" />);
      }
    }
    return stars;
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-white">AI-Generated Review</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {renderStars(review.rating)}
            <span className="text-sm font-bold text-white ml-2">{review.rating.toFixed(1)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div>
          <p className="text-slate-300 leading-relaxed">{review.ai_generated_summary}</p>
        </div>

        {/* Pros */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ThumbsUp className="w-4 h-4 text-green-400" />
            <h4 className="font-semibold text-white">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {review.pros?.map((pro, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-green-400 mt-1">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ThumbsDown className="w-4 h-4 text-amber-400" />
            <h4 className="font-semibold text-white">Considerations</h4>
          </div>
          <ul className="space-y-2">
            {review.cons?.map((con, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-amber-400 mt-1">!</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Use Cases */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-blue-400" />
            <h4 className="font-semibold text-white">Ideal For</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {review.use_cases?.map((useCase, idx) => (
              <Badge key={idx} className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {useCase}
              </Badge>
            ))}
          </div>
        </div>

        <Button onClick={onClose} variant="outline" className="w-full">
          Close
        </Button>
      </CardContent>
    </Card>
  );
}