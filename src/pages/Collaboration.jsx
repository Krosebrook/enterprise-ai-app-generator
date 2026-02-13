import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Code, UserCheck } from 'lucide-react';
import CodeReviewPanel from '../components/collaboration/CodeReviewPanel';
import TaskRecommendations from '../components/collaboration/TaskRecommendations';

export default function Collaboration() {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [sampleCode] = useState(`import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function MyComponent() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await fetch('/api/data');
    const result = await response.json();
    setData(result);
  };

  return (
    <div>
      <h1>Count: {count}</h1>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
`);

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
          <Users className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold text-white">AI-Powered Collaboration</h1>
        </div>
        <p className="text-slate-400">Code reviews, task assignments, and team collaboration tools</p>
      </div>

      {/* Project Selector */}
      <div className="mb-8">
        <label className="text-sm text-slate-400 mb-2 block">Select Project</label>
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="max-w-md bg-slate-900/50 border-slate-800 text-white">
            <SelectValue placeholder="Choose a project..." />
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

      {/* Collaboration Tools */}
      {selectedProjectId ? (
        <Tabs defaultValue="review" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800">
            <TabsTrigger value="review" className="data-[state=active]:bg-slate-800">
              <Code className="w-4 h-4 mr-2" />
              AI Code Review
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-slate-800">
              <UserCheck className="w-4 h-4 mr-2" />
              Task Assignment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            <CodeReviewPanel
              projectId={selectedProjectId}
              filePath="components/MyComponent.jsx"
              codeContent={sampleCode}
            />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskRecommendations projectId={selectedProjectId} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-16">
          <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Select a project to access collaboration tools</p>
        </div>
      )}
    </div>
  );
}