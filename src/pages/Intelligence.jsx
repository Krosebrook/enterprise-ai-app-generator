import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp } from 'lucide-react';
import RiskForecast from '../components/intelligence/RiskForecast';
import ProjectStatusReport from '../components/intelligence/ProjectStatusReport';
import SecurityPosture from '../components/intelligence/SecurityPosture';

export default function Intelligence() {
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.AppProject.list(),
  });

  const activeProjects = projects.filter(p => p.status === 'active');

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Project Intelligence Center</h1>
        </div>
        <p className="text-slate-400">AI-powered analytics, risk forecasting, and security analysis</p>
      </div>

      {/* Project Selector */}
      <div className="mb-8">
        <label className="text-sm text-slate-400 mb-2 block">Select Project</label>
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="max-w-md bg-slate-900/50 border-slate-800 text-white">
            <SelectValue placeholder="Choose a project to analyze..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-800">
            {activeProjects.map((project) => (
              <SelectItem key={project.id} value={project.id} className="text-white">
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Intelligence Panels */}
      {selectedProjectId ? (
        <div className="space-y-8">
          {/* Project Status Report */}
          <ProjectStatusReport projectId={selectedProjectId} />

          {/* Risk Forecast */}
          <RiskForecast projectId={selectedProjectId} />

          {/* Security Analysis */}
          <SecurityPosture projectId={selectedProjectId} />
        </div>
      ) : (
        <div className="text-center py-16">
          <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Select a project to view AI-powered intelligence</p>
        </div>
      )}
    </div>
  );
}