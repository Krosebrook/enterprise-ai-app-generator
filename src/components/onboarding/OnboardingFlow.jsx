import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, ArrowRight, ArrowLeft, CheckCircle2,
  Rocket, Zap, ShoppingCart, BarChart3, Smartphone, Brain,
  BookOpen, FlaskConical, Globe, Shield, User, Check,
  Eye, Hand, FileText, Layers, Clock, MapPin
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const templateCategories = [
  { id: 'saas', label: 'SaaS App', icon: Rocket, color: 'from-blue-500 to-cyan-500', description: 'Subscription & recurring revenue' },
  { id: 'ai', label: 'AI Product', icon: Brain, color: 'from-purple-500 to-pink-500', description: 'LLM-powered tools & agents' },
  { id: 'e-commerce', label: 'E-Commerce', icon: ShoppingCart, color: 'from-orange-500 to-yellow-500', description: 'Online storefronts & marketplaces' },
  { id: 'dashboard', label: 'Analytics', icon: BarChart3, color: 'from-green-500 to-emerald-500', description: 'Data visualization & reporting' },
  { id: 'mobile', label: 'Mobile App', icon: Smartphone, color: 'from-pink-500 to-rose-500', description: 'iOS & Android applications' },
];

const userGoals = [
  { id: 'build_fast', label: 'Ship Something Fast', icon: Zap, description: 'I need a working product ASAP' },
  { id: 'learn_platform', label: 'Learn the Platform', icon: BookOpen, description: 'Understand all capabilities' },
  { id: 'explore_ai', label: 'Explore AI Features', icon: FlaskConical, description: 'Curious about AI integrations' },
  { id: 'deploy_prod', label: 'Deploy to Production', icon: Globe, description: 'Launch an existing app' },
];

const learningStyles = [
  { id: 'hands-on', label: 'Hands-On', icon: Hand, description: 'Learn by doing, action first' },
  { id: 'visual', label: 'Visual', icon: Eye, description: 'Prefer diagrams & examples' },
  { id: 'reading', label: 'Deep Dive', icon: FileText, description: 'Detailed explanations' },
  { id: 'mixed', label: 'Balanced', icon: Layers, description: 'A bit of everything' },
];

const PHASES = ['welcome', 'intent', 'goal', 'style', 'generating', 'guide'];

export default function OnboardingFlow({ open, onClose, userRole = 'user' }) {
  const [phase, setPhase] = useState('welcome');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('mixed');
  const [personalizedGuide, setPersonalizedGuide] = useState(null);
  const [progress, setProgress] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (open) initSession();
  }, [open]);

  const initSession = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      const existing = await base44.entities.OnboardingProgress.filter({ user_email: u.email });
      if (existing.length > 0) {
        const rec = existing[0];
        setProgress(rec);
        setCompletedSteps(rec.completed_steps || []);
        if (rec.preferred_learning_style) setSelectedStyle(rec.preferred_learning_style);
        const guide = rec.personalized_guide;
        if (guide?.recommended_steps?.length > 0) {
          setPersonalizedGuide(guide);
          setPhase('guide');
        }
      }
    } catch (e) {
      console.error('Failed to init onboarding session', e);
    }
  };

  const generateGuide = async () => {
    setPhase('generating');
    try {
      const u = user || await base44.auth.me();
      const response = await base44.functions.invoke('generatePersonalizedOnboarding', {
        userRole,
        selectedTemplate: selectedCategory,
        userGoal: selectedGoal,
        learningStyle: selectedStyle,
        completedSteps: [],
      });

      if (response.data.success) {
        const guide = response.data.guide;
        setPersonalizedGuide(guide);

        const progressData = {
          user_email: u.email,
          role: userRole,
          current_step: 'guide',
          completed_steps: [],
          is_complete: false,
          personalized_guide: guide,
          preferred_learning_style: selectedStyle,
          skipped: false
        };

        if (progress) {
          await base44.entities.OnboardingProgress.update(progress.id, progressData);
        } else {
          const created = await base44.entities.OnboardingProgress.create(progressData);
          setProgress(created);
        }
        setPhase('guide');
      } else {
        throw new Error('Guide generation failed');
      }
    } catch (error) {
      console.error('Failed to generate guide:', error);
      toast.error('Failed to generate guide');
      setPhase('guide');
    }
  };

  const markStepComplete = async (stepTitle) => {
    const newCompleted = [...new Set([...completedSteps, stepTitle])];
    setCompletedSteps(newCompleted);
    if (progress) {
      await base44.entities.OnboardingProgress.update(progress.id, {
        completed_steps: newCompleted,
        is_complete: newCompleted.length >= (personalizedGuide?.recommended_steps?.length || 4)
      });
    }
  };

  const handleSkip = async () => {
    try {
      const u = user || await base44.auth.me();
      if (progress) {
        await base44.entities.OnboardingProgress.update(progress.id, { skipped: true });
      } else {
        await base44.entities.OnboardingProgress.create({ user_email: u.email, skipped: true, role: userRole });
      }
    } catch (e) { console.error('Skip error', e); }
    onClose();
  };

  const handleComplete = async () => {
    if (progress) {
      await base44.entities.OnboardingProgress.update(progress.id, { is_complete: true });
    }
    toast.success("You're all set! Let's build something great.");
    onClose();
  };

  if (!open) return null;

  const phaseIndex = PHASES.indexOf(phase);
  const progressPct = Math.round((phaseIndex / (PHASES.length - 1)) * 100);
  const doneCount = completedSteps.length;
  const totalSteps = personalizedGuide?.recommended_steps?.length || 4;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/97 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-2xl my-8">
        {/* Top progress bar */}
        {phase !== 'welcome' && phase !== 'generating' && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-500 mb-2">
              <span>Setting up your experience</span>
              <span>{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-1 bg-slate-800" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* WELCOME */}
          {phase === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }} className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <Badge className={cn("mb-4", userRole === 'admin' ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30")}>
                {userRole === 'admin' ? <><Shield className="w-3 h-3 mr-1" />Admin Account</> : <><User className="w-3 h-3 mr-1" />Developer Account</>}
              </Badge>
              <h1 className="text-4xl font-bold text-white mb-3">Welcome to VibeCode</h1>
              <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                Let's build your personalized learning path. Takes 45 seconds and makes a real difference.
              </p>
              <div className="flex justify-center gap-6 mb-10">
                {[{ icon: Rocket, label: 'Tailored tutorials' }, { icon: Brain, label: 'AI guidance' }, { icon: Zap, label: 'Smart task tips' }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xs text-slate-500">{label}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 items-center">
                <Button onClick={() => setPhase('intent')} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-10 py-5 text-base h-auto rounded-xl">
                  Personalize My Experience <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <button onClick={handleSkip} className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                  Skip — take me straight to the dashboard
                </button>
              </div>
            </motion.div>
          )}

          {/* INTENT */}
          {phase === 'intent' && (
            <motion.div key="intent" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.35 }}>
              <div className="mb-6">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Step 1 of 3</span>
                <h2 className="text-2xl font-bold text-white mt-1 mb-1">What do you want to build?</h2>
                <p className="text-slate-400 text-sm">Your tutorials will be tailored to this type of app.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                {templateCategories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={cn("p-4 rounded-xl border text-left transition-all duration-200", isSelected ? "border-blue-500/60 bg-blue-500/10 shadow-lg shadow-blue-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-700")}>
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br", cat.color)}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="font-medium text-white text-sm">{cat.label}</div>
                      <div className="text-slate-500 text-xs mt-1 leading-snug">{cat.description}</div>
                      {isSelected && <div className="mt-2 flex items-center gap-1 text-blue-400 text-xs"><Check className="w-3 h-3" /> Selected</div>}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setPhase('welcome')} className="text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
                <Button onClick={() => setPhase('goal')} disabled={!selectedCategory} className="bg-gradient-to-r from-blue-500 to-cyan-500 disabled:opacity-40">Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>
            </motion.div>
          )}

          {/* GOAL */}
          {phase === 'goal' && (
            <motion.div key="goal" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.35 }}>
              <div className="mb-6">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Step 2 of 3</span>
                <h2 className="text-2xl font-bold text-white mt-1 mb-1">What's your primary goal?</h2>
                <p className="text-slate-400 text-sm">This determines which features and tutorials we highlight first.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {userGoals.map(goal => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoal === goal.id;
                  return (
                    <button key={goal.id} onClick={() => setSelectedGoal(goal.id)} className={cn("p-5 rounded-xl border text-left transition-all duration-200", isSelected ? "border-purple-500/60 bg-purple-500/10 shadow-lg shadow-purple-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-700")}>
                      <Icon className={cn("w-6 h-6 mb-3", isSelected ? "text-purple-400" : "text-slate-400")} />
                      <div className="font-medium text-white text-sm">{goal.label}</div>
                      <div className="text-slate-500 text-xs mt-1">{goal.description}</div>
                      {isSelected && <div className="mt-2 flex items-center gap-1 text-purple-400 text-xs"><Check className="w-3 h-3" /> Selected</div>}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setPhase('intent')} className="text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
                <Button onClick={() => setPhase('style')} disabled={!selectedGoal} className="bg-gradient-to-r from-purple-500 to-pink-500 disabled:opacity-40">Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>
            </motion.div>
          )}

          {/* LEARNING STYLE */}
          {phase === 'style' && (
            <motion.div key="style" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.35 }}>
              <div className="mb-6">
                <span className="text-xs text-slate-500 uppercase tracking-wider">Step 3 of 3</span>
                <h2 className="text-2xl font-bold text-white mt-1 mb-1">How do you like to learn?</h2>
                <p className="text-slate-400 text-sm">We'll adjust the depth and style of your tutorials accordingly.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {learningStyles.map(style => {
                  const Icon = style.icon;
                  const isSelected = selectedStyle === style.id;
                  return (
                    <button key={style.id} onClick={() => setSelectedStyle(style.id)} className={cn("p-5 rounded-xl border text-left transition-all duration-200", isSelected ? "border-cyan-500/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/10" : "border-slate-800 bg-slate-900/50 hover:border-slate-700")}>
                      <Icon className={cn("w-6 h-6 mb-3", isSelected ? "text-cyan-400" : "text-slate-400")} />
                      <div className="font-medium text-white text-sm">{style.label}</div>
                      <div className="text-slate-500 text-xs mt-1">{style.description}</div>
                      {isSelected && <div className="mt-2 flex items-center gap-1 text-cyan-400 text-xs"><Check className="w-3 h-3" /> Selected</div>}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setPhase('goal')} className="text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
                <Button onClick={generateGuide} className="bg-gradient-to-r from-cyan-500 to-blue-500">
                  <Sparkles className="w-4 h-4 mr-2" />Generate My Guide
                </Button>
              </div>
            </motion.div>
          )}

          {/* GENERATING */}
          {phase === 'generating' && (
            <motion.div key="generating" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="text-center py-16">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-spin opacity-80" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-1 rounded-full bg-slate-950 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Building Your Guide</h2>
              <p className="text-slate-400 mb-8">Crafting a learning path tailored to your goals…</p>
              <div className="flex flex-wrap justify-center gap-4">
                {['Analyzing your goals', 'Selecting tutorials', 'Tailoring tips', 'Prioritizing tasks'].map((label, i) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.5 }} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 text-xs text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    {label}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* GUIDE */}
          {phase === 'guide' && personalizedGuide && (
            <motion.div key="guide" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {/* Header */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-400 text-sm font-medium">Your personalized guide is ready</span>
                </div>
                <h2 className="text-xl font-bold text-white leading-snug">
                  {personalizedGuide.welcome_message || "Here's your path to success"}
                </h2>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  {personalizedGuide.estimated_completion_minutes && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{personalizedGuide.estimated_completion_minutes} min</span>
                  )}
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{doneCount}/{totalSteps} steps done</span>
                </div>
                {/* Mini progress bar */}
                <Progress value={(doneCount / totalSteps) * 100} className="h-1.5 bg-slate-800 mt-2" />
              </div>

              {/* Focus Areas */}
              {personalizedGuide.focus_areas?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {personalizedGuide.focus_areas.map((area, i) => (
                    <Badge key={i} className="bg-slate-800 text-slate-400 border-slate-700 text-xs">{area}</Badge>
                  ))}
                </div>
              )}

              {/* Steps */}
              <div className="space-y-2 mb-5">
                {(personalizedGuide.recommended_steps || []).map((step, idx) => {
                  const isDone = completedSteps.includes(step.title);
                  return (
                    <div key={idx} className={cn("rounded-xl border transition-all", isDone ? "bg-emerald-500/5 border-emerald-500/20" : "bg-slate-900/50 border-slate-800 hover:border-slate-700")}>
                      <div className="flex items-start gap-3 p-4">
                        <button onClick={() => markStepComplete(step.title)} className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all", isDone ? "bg-emerald-500 border-emerald-500" : "border-slate-600 hover:border-blue-400")}>
                          {isDone && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className={cn("font-medium text-sm", isDone ? "text-slate-500 line-through" : "text-white")}>
                              {step.title}
                            </span>
                            {step.priority === 'high' && !isDone && (
                              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs px-1.5 py-0">Priority</Badge>
                            )}
                            {step.page_hint && !isDone && (
                              <Badge className="bg-slate-700 text-slate-400 border-slate-600 text-xs px-1.5 py-0">{step.page_hint}</Badge>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm">{step.description}</p>
                          {step.contextual_tip && !isDone && (
                            <p className="text-xs text-cyan-400/80 mt-1.5 flex items-start gap-1">
                              <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" />{step.contextual_tip}
                            </p>
                          )}
                        </div>
                        {step.page_hint && !isDone && (
                          <Link to={createPageUrl(step.page_hint)} onClick={handleComplete} className="flex-shrink-0">
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-400 hover:text-blue-300 px-2">
                              Go <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pro Tips */}
              {personalizedGuide.pro_tips?.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 mb-5">
                  <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />Pro Tips for Your Setup
                  </h4>
                  <ul className="space-y-1.5">
                    {personalizedGuide.pro_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-cyan-400 flex-shrink-0">→</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => setPhase('style')} className="text-slate-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />Back
                </Button>
                <Button onClick={handleComplete} className="bg-gradient-to-r from-blue-500 to-cyan-500">
                  {doneCount >= totalSteps ? 'All Done! 🎉' : 'Start Building'} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Fallback */}
          {phase === 'guide' && !personalizedGuide && (
            <motion.div key="guide-fallback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <h2 className="text-2xl font-bold text-white mb-4">You're all set!</h2>
              <p className="text-slate-400 mb-6">Head to the Generator to create your first app.</p>
              <Button onClick={handleComplete} className="bg-gradient-to-r from-blue-500 to-cyan-500">
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}