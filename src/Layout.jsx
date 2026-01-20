import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { 
  LayoutDashboard, 
  Sparkles, 
  FolderOpen, 
  FileCode, 
  BookOpen,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Zap,
  GitBranch,
  Code,
  Rocket
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import OnboardingFlow from './components/onboarding/OnboardingFlow';

/**
 * Navigation configuration for the application sidebar
 * @type {Array<{name: string, icon: React.Component, page: string}>}
 */
const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'Dashboard' },
  { name: 'Generate App', icon: Sparkles, page: 'Generator' },
  { name: 'Templates', icon: FolderOpen, page: 'Templates' },
  { name: 'Examples', icon: FileCode, page: 'Examples' },
  { name: 'Docs', icon: BookOpen, page: 'Documentation' },
  { name: 'Scripts', icon: Terminal, page: 'Scripts' },
  { name: 'CI/CD', icon: GitBranch, page: 'Pipelines' },
  { name: 'Editor', icon: Code, page: 'Editor' },
  { name: 'Deploy', icon: Rocket, page: 'Deploy' },
  { name: 'AI Code Tools', icon: Sparkles, page: 'CodeAI' },
];

/**
 * Main application layout component with collapsible sidebar navigation
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to render in the main area
 * @param {string} props.currentPageName - Name of the current active page
 * @returns {JSX.Element} Layout with sidebar and main content area
 */
export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const user = await base44.auth.me();
      setUserRole(user.role || 'user');
      
      const progress = await base44.entities.OnboardingProgress.filter({ user_email: user.email });
      
      if (progress.length === 0 || (!progress[0].is_complete && !progress[0].skipped)) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Failed to check onboarding', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 transition-all duration-300 z-50 flex flex-col",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg leading-none">VibeCode</h1>
                <span className="text-xs text-slate-400">Enterprise Edition</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.page)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-blue-400 border border-blue-500/30" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-blue-400")} />
                {!collapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-slate-800/50">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative min-h-screen">
          {children}
        </div>
      </main>

      {/* Onboarding Flow */}
      <OnboardingFlow
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        userRole={userRole}
      />
    </div>
  );
}