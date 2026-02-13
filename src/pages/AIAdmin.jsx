import React from 'react';
import { Brain } from 'lucide-react';
import VersionControlPanel from '@/components/admin/VersionControlPanel';
import RoleSuggestionsPanel from '@/components/admin/RoleSuggestionsPanel';
import UXInsightsPanel from '@/components/admin/UXInsightsPanel';

export default function AIAdmin() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">AI Admin Center</h1>
          <Brain className="w-8 h-8 text-purple-400" />
        </div>
        <p className="text-slate-400">
          AI-powered version control, role management, and UX analytics
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version Control */}
        <VersionControlPanel 
          templateName="saas-core"
          currentVersion="1.2.0"
        />

        {/* Role Suggestions */}
        <RoleSuggestionsPanel />

        {/* UX Insights */}
        <div className="lg:col-span-2">
          <UXInsightsPanel />
        </div>
      </div>
    </div>
  );
}