import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function NaturalLanguageSearch({ onResults }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const { data } = await base44.functions.invoke('searchTemplatesNaturalLanguage', { query });
      onResults(data.results);
      toast.success(`Found ${data.results.length} matching templates`);
    } catch (error) {
      toast.error('Search failed: ' + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
        </div>
        <Input
          type="text"
          placeholder="Try: 'I need an e-commerce template with AI recommendations' or 'dashboard for analytics'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-32 h-14 text-base bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
        />
        <Button
          type="submit"
          disabled={isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">
        AI-powered search understands natural language - describe what you need!
      </p>
    </form>
  );
}