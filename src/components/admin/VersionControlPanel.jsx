import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { GitBranch, Sparkles, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function VersionControlPanel({ templateName, currentVersion }) {
  const [changes, setChanges] = useState([]);
  const [newChange, setNewChange] = useState({ type: 'feature', description: '' });
  const [releaseNotes, setReleaseNotes] = useState(null);
  const [loading, setLoading] = useState(false);

  const addChange = () => {
    if (newChange.description.trim()) {
      setChanges([...changes, newChange]);
      setNewChange({ type: 'feature', description: '' });
    }
  };

  const generateReleaseNotes = async () => {
    if (changes.length === 0) {
      toast.error('Add at least one change');
      return;
    }

    try {
      setLoading(true);
      const response = await base44.functions.invoke('generateReleaseNotes', {
        templateName,
        currentVersion,
        changes
      });

      if (response.data.success) {
        setReleaseNotes(response.data);
        toast.success('Release notes generated!');
      }
    } catch (error) {
      toast.error('Failed to generate release notes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-green-400" />
          Version Control - {templateName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-500/20 text-blue-300">
            Current: v{currentVersion}
          </Badge>
          {releaseNotes && (
            <Badge className="bg-green-500/20 text-green-300">
              Next: v{releaseNotes.suggested_version}
            </Badge>
          )}
        </div>

        {/* Change Entry */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Add Changes:</h4>
          <div className="flex gap-2">
            <Select
              value={newChange.type}
              onValueChange={(type) => setNewChange({ ...newChange, type })}
            >
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="fix">Fix</SelectItem>
                <SelectItem value="breaking">Breaking</SelectItem>
                <SelectItem value="docs">Docs</SelectItem>
                <SelectItem value="refactor">Refactor</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={newChange.description}
              onChange={(e) => setNewChange({ ...newChange, description: e.target.value })}
              placeholder="Describe the change..."
              className="flex-1 bg-slate-800 border-slate-700 text-white"
              onKeyPress={(e) => e.key === 'Enter' && addChange()}
            />
            <Button onClick={addChange} size="sm" className="bg-blue-500 hover:bg-blue-600">
              Add
            </Button>
          </div>
        </div>

        {/* Changes List */}
        {changes.length > 0 && (
          <div className="space-y-2">
            {changes.map((change, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded bg-slate-800/50 text-sm">
                <Badge variant="outline" className="text-xs">
                  {change.type}
                </Badge>
                <span className="text-slate-300">{change.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={generateReleaseNotes}
          disabled={loading || changes.length === 0}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate Release Notes</>
          )}
        </Button>

        {/* Release Notes Preview */}
        {releaseNotes && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white">AI-Generated Release Notes:</h4>
              <Badge className="bg-green-500/20 text-green-300">
                {releaseNotes.version_strategy} update
              </Badge>
            </div>
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 prose prose-sm prose-invert max-w-none">
              <ReactMarkdown>{releaseNotes.release_notes}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}