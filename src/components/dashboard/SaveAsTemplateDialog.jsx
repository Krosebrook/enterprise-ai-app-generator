import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from 'lucide-react';

export default function SaveAsTemplateDialog({ open, onClose, project, onSave }) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    version: '1.0.0',
    description: project?.description || '',
    category: 'saas',
    preview_image: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        features: project?.features || [],
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
            <Label className="text-slate-300 mb-2 block">Preview Image URL (optional)</Label>
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