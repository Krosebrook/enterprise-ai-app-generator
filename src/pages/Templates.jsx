import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, Layers, Sparkles } from 'lucide-react';
import TemplateCard from '@/components/templates/TemplateCard';
import NaturalLanguageSearch from '@/components/marketplace/NaturalLanguageSearch';
import TrendingTemplates from '@/components/marketplace/TrendingTemplates';
import AITemplateReview from '@/components/marketplace/AITemplateReview';

const categories = ['all', 'saas', 'ai', 'e-commerce', 'dashboard', 'mobile'];

export default function Templates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [nlSearchResults, setNlSearchResults] = useState(null);
  const [selectedTemplateForReview, setSelectedTemplateForReview] = useState(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list('-popularity'),
  });

  const displayTemplates = nlSearchResults || templates;

  const filteredTemplates = displayTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || template.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template) => {
    navigate(createPageUrl('Generator') + `?template=${template.name}`);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">AI-Powered Template Marketplace</h1>
          <Sparkles className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-slate-400">Discover templates using natural language or browse our curated collection</p>
      </div>

      {/* Natural Language Search */}
      <NaturalLanguageSearch 
        onResults={(results) => {
          setNlSearchResults(results);
          setCategory('all');
        }}
      />

      {/* Trending Templates */}
      <TrendingTemplates 
        onTemplateSelect={(template) => setSelectedTemplateForReview(template.name)}
      />

      {/* Traditional Filters */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-4">All Templates</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setNlSearchResults(null);
            }}
            placeholder="Search templates..."
            className="pl-12 bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-500 focus:border-blue-500"
          />
        </div>
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="bg-slate-900/50 border border-slate-800">
            {categories.map(cat => (
              <TabsTrigger
                key={cat}
                value={cat}
                className="text-slate-400 data-[state=active]:text-white data-[state=active]:bg-slate-800 capitalize"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 rounded-2xl bg-slate-900/50 animate-pulse" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
            <Layers className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No templates found</h3>
          <p className="text-slate-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div key={template.id}>
              <TemplateCard
                template={template}
                onSelect={handleSelectTemplate}
              />
              <button
                onClick={() => setSelectedTemplateForReview(template.name)}
                className="w-full mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                View AI Review
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AI Review Dialog */}
      <Dialog open={!!selectedTemplateForReview} onOpenChange={() => setSelectedTemplateForReview(null)}>
        <DialogContent className="max-w-2xl bg-slate-950 border-slate-800">
          {selectedTemplateForReview && (
            <AITemplateReview
              templateName={selectedTemplateForReview}
              onClose={() => setSelectedTemplateForReview(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}