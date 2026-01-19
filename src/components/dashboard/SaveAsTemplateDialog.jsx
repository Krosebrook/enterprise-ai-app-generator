import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Sparkles, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SaveAsTemplateDialog({ open, onClose, project, onSave }) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    version: '1.0.0',
    description: project?.description || '',
    category: 'saas',
    preview_image: '',
    features: project?.features || [],
    tags: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const generateAISuggestions = async () => {
    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate template metadata for this project configuration.

Project Name: ${project?.name}
Template Base: ${project?.template}
Features: ${project?.features?.join(', ')}
Description: ${project?.description}

Provide:
1. **Professional Description** (2-3 sentences): A compelling description for template discovery
2. **Relevant Tags** (5-7 tags): Searchable tags (e.g., 'authentication', 'real-time', 'scalable')
3. **Preview Image Prompt**: A detailed prompt to generate a preview image
4. **Feature Summary** (bullet points): Key features to highlight

Format as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            preview_prompt: { type: "string" },
            feature_summary: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAiSuggestions(result);
      toast.success('AI suggestions generated!');
    } catch (error) {
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyAISuggestions = () => {
    if (aiSuggestions) {
      setFormData(prev => ({
        ...prev,
        description: aiSuggestions.description,
        tags: aiSuggestions.tags,
        features: aiSuggestions.feature_summary,
      }));
      toast.success('Suggestions applied!');
    }
  };

  const generatePreviewImage = async () => {
    if (!aiSuggestions?.preview_prompt) {
      toast.error('Generate AI suggestions first');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: aiSuggestions.preview_prompt,
      });
      setFormData(prev => ({
        ...prev,
        preview_image: result.url,
      }));
      toast.success('Preview image generated!');
    } catch (error) {
      toast.error('Failed to generate preview image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        popularity: 0,
        config: project?.config || {},
        ai_model: project?.ai_model,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Save as Template</DialogTitle>
          <DialogDescription className="text-slate-400">
            Create a reusable template from this project configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* AI Generation Section */}
          {!aiSuggestions && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">AI-Powered Template Creation</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Let AI analyze your project and auto-generate professional template metadata.
              </p>
              <Button
                onClick={generateAISuggestions}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>
          )}

          {/* AI Suggestions */}
          {aiSuggestions && (
            <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">AI Suggestions</span>
                <Button
                  onClick={applyAISuggestions}
                  size="sm"
                  variant="outline"
                  className="border-slate-700 text-slate-400 text-xs"
                >
                  Apply All
                </Button>
              </div>
              <div>
                <label className="text-slate-400 text-xs">Suggested Description</label>
                <p className="text-slate-300 text-xs mt-1">{aiSuggestions.description}</p>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-2 block">Suggested Tags</label>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.tags?.map((tag, idx) => (
                    <Badge key={idx} variant="outline" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                onClick={generatePreviewImage}
                disabled={isGenerating}
                size="sm"
                variant="outline"
                className="w-full border-slate-700 text-slate-400 text-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Preview Image'
                )}
              </Button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300 mb-2 block">Template Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Custom Template"
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 mb-2 block">Version</Label>
              <Input
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="1.0.0"
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-300 mb-2 block">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what makes this template unique..."
              className="bg-slate-800/50 border-slate-700 text-white min-h-24"
            />
          </div>

          <div>
            <Label className="text-slate-300 mb-2 block">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="saas">SaaS</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="e-commerce">E-Commerce</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-slate-300 mb-2 block">Tags</Label>
            <Input
              value={formData.tags?.join(', ')}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
              placeholder="e.g., authentication, real-time, scalable"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div>
            <Label className="text-slate-300 mb-2 block">Preview Image URL (optional)</Label>
            {formData.preview_image && (
              <div className="mb-3 p-2 rounded-lg bg-slate-800/30 border border-slate-700">
                <img src={formData.preview_image} alt="Preview" className="w-full h-32 object-cover rounded" />
              </div>
            )}
            <Input
              value={formData.preview_image}
              onChange={(e) => setFormData({ ...formData, preview_image: e.target.value })}
              placeholder="https://example.com/preview.png"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
            <h4 className="text-white font-medium mb-2">Included Configuration:</h4>
            <div className="space-y-1 text-sm text-slate-400">
              <p>• AI Model: <span className="text-blue-400">{project?.ai_model}</span></p>
              <p>• Features: <span className="text-blue-400">{project?.features?.join(', ')}</span></p>
              <p>• Template: <span className="text-blue-400">{project?.template}</span></p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="border-slate-700 text-slate-400"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name || !formData.description || isSaving}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}