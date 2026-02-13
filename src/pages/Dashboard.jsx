import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Plus, 
  FolderOpen, 
  Cpu, 
  Zap, 
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Brain,
  Shield
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import ProjectCard from '@/components/dashboard/ProjectCard';
import ProjectInsights from '@/components/project/ProjectInsights';
import ContextualTooltip from '@/components/onboarding/ContextualTooltip';
import DynamicTaskCard from '@/components/onboarding/DynamicTaskCard';
import InteractiveTutorial from '@/components/onboarding/InteractiveTutorial';

/**
 * Dashboard page component displaying project overview and quick actions
 * Features:
 * - Recent projects list with status management
 * - Statistics cards showing key metrics
 * - Quick action links to common tasks
 * @returns {JSX.Element} Dashboard page with projects and statistics
 */
export default function Dashboard() {
  const queryClient = useQueryClient();
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [onboardingProgress, setOnboardingProgress] = React.useState(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.AppProject.list('-created_date', 10),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list(),
  });

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      const progress = await base44.entities.OnboardingProgress.filter({ 
        user_email: userData.email 
      });
      
      if (progress.length > 0) {
        setOnboardingProgress(progress[0]);
        setShowTutorial(!progress[0].is_complete && projects.length < 2);
      } else {
        setShowTutorial(projects.length < 2);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.AppProject.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalProjects = projects.length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Manage your AI-generated applications</p>
        </div>
        <Link to={createPageUrl('Generator')}>
          <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
            <Plus className="w-5 h-5 mr-2" />
            New App
          </Button>
        </Link>
      </div>

      {/* Dynamic Task Recommendation */}
      {user && showTutorial && (
        <div className="mb-8">
          <DynamicTaskCard
            currentPage="Dashboard"
            completedSteps={onboardingProgress?.completed_steps || []}
            userRole={user.role || 'user'}
            onTaskComplete={(taskTitle) => {
              console.log('Task completed:', taskTitle);
            }}
          />
        </div>
      )}

      {/* Interactive Tutorial */}
      {showTutorial && projects.length === 0 && (
        <div className="mb-8">
          <InteractiveTutorial
            page="Generator"
            onComplete={(page) => {
              console.log('Tutorial completed for:', page);
              setShowTutorial(false);
            }}
          />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          subtitle="All time"
          icon={FolderOpen}
          color="blue"
        />
        <StatCard
          title="Active Apps"
          value={activeProjects}
          subtitle="Currently running"
          icon={Zap}
          color="green"
        />
        <StatCard
          title="Templates"
          value={templates.length}
          subtitle="Available"
          icon={Cpu}
          color="purple"
        />
        <StatCard
          title="API Calls"
          value="12.4K"
          subtitle="This month"
          icon={TrendingUp}
          trend={23}
          color="cyan"
        />
      </div>

      {/* Recent Projects with AI Insights */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
          <Link to={createPageUrl('Generator')}>
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Project Intelligence for First Active Project */}
        {projects.find(p => p.status === 'active') && (
          <div className="mb-8">
            <ContextualTooltip id="project-insights" autoShow={true} autoShowDelay={3000}>
              <div>
                <ProjectInsights project={projects.find(p => p.status === 'active')} />
              </div>
            </ContextualTooltip>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900/50 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 rounded-2xl bg-slate-900/50 border border-slate-800/50">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
              <FolderOpen className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
            <p className="text-slate-400 mb-6">Create your first AI-powered application</p>
            <Link to={createPageUrl('Generator')}>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                <Plus className="w-4 h-4 mr-2" />
                Generate New App
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onStatusChange={(id, status) => updateMutation.mutate({ id, status })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to={createPageUrl('Intelligence')} className="block">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all group">
            <Brain className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">AI Intelligence</h3>
            <p className="text-slate-400 text-sm">Risk forecasts, security analysis & reports</p>
          </div>
        </Link>
        <Link to={createPageUrl('Templates')} className="block">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
            <FolderOpen className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">AI Marketplace</h3>
            <p className="text-slate-400 text-sm">Natural language search & AI reviews</p>
          </div>
        </Link>
        <Link to={createPageUrl('Scripts')} className="block">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 hover:border-cyan-500/40 transition-all group">
            <RefreshCw className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Run Scripts</h3>
            <p className="text-slate-400 text-sm">Validate and manage configurations</p>
          </div>
        </Link>
        <Link to={createPageUrl('Collaboration')} className="block">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all group">
            <Shield className="w-10 h-10 text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Collaboration</h3>
            <p className="text-slate-400 text-sm">AI code reviews & task assignments</p>
          </div>
        </Link>
      </div>
    </div>
  );
}