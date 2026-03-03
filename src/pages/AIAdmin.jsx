import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Brain, GitBranch, Users, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VersionControlPanel from '@/components/admin/VersionControlPanel';
import RoleSuggestionsPanel from '@/components/admin/RoleSuggestionsPanel';
import UXInsightsPanel from '@/components/admin/UXInsightsPanel';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'version', label: 'Version Control', icon: GitBranch },
  { id: 'roles', label: 'Role Suggestions', icon: Users },
  { id: 'ux', label: 'UX Insights', icon: TrendingUp },
];

export default function AIAdmin() {
  const [activeTab, setActiveTab] = useState('version');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list('-popularity', 20),
  });

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">AI Admin Center</h1>
          <Brain className="w-8 h-8 text-purple-400" />
        </div>
        <p className="text-slate-400">AI-powered version control, role management, and UX analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 p-1 bg-slate-900/50 rounded-xl w-fit border border-slate-800">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Version Control Tab */}
      {activeTab === 'version' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-slate-400 whitespace-nowrap">Select Template:</label>
            <Select value={selectedTemplateId || ''} onValueChange={setSelectedTemplateId}>
              <SelectTrigger className="w-64 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Choose a template…" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name} — v{t.version}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedTemplate ? (
            <VersionControlPanel
              templateName={selectedTemplate.name}
              currentVersion={selectedTemplate.version || '1.0.0'}
            />
          ) : (
            <div className="text-center py-16 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-500">
              Select a template above to manage its versions
            </div>
          )}
        </div>
      )}

      {/* Role Suggestions Tab */}
      {activeTab === 'roles' && <RoleSuggestionsPanel />}

      {/* UX Insights Tab */}
      {activeTab === 'ux' && <UXInsightsPanel />}
    </div>
  );
}