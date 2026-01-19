import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Wand2, 
  Bug, 
  MessageCircle, 
  TrendingUp,
  Loader2,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

const modes = [
  { id: 'refactor', name: 'Refactor', icon: Wand2, color: 'text-purple-400', prompt: 'Refactor the following code to be more efficient, readable, and maintainable. Use modern best practices:' },
  { id: 'debug', name: 'Debug', icon: Bug, color: 'text-red-400', prompt: 'Analyze the following code for bugs, errors, and potential issues. Provide fixes:' },
  { id: 'explain', name: 'Explain', icon: MessageCircle, color: 'text-blue-400', prompt: 'Provide a deep, context-aware explanation of the following code including:\n- What it does and why\n- Architectural patterns used (MVC, MVVM, Singleton, Observer, etc.)\n- Potential security vulnerabilities\n- Performance implications for React applications\n- Stack-specific considerations\n\nBe comprehensive and educational:' },
  { id: 'improve', name: 'Improve', icon: TrendingUp, color: 'text-emerald-400', prompt: 'Suggest improvements for the following code (performance, security, best practices):' },
];

export default function AIAssistant({ code, onApplyCode }) {
  const [activeMode, setActiveMode] = useState('refactor');
  const [customPrompt, setCustomPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentMode = modes.find(m => m.id === activeMode);

  const handleAsk = async () => {
    if (!code?.trim()) {
      toast.error('No code to analyze');
      return;
    }

    setIsProcessing(true);
    setResponse('');

    try {
      const prompt = customPrompt || currentMode.prompt;
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${prompt}\n\n\`\`\`\n${code}\n\`\`\`\n\nProvide your response in a clear, actionable format.`,
      });
      setResponse(result);
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const applyCode = () => {
    // Extract code from markdown if present
    const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
    const codeToApply = codeMatch ? codeMatch[1] : response;
    onApplyCode?.(codeToApply);
    toast.success('Code applied to editor');
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">AI Assistant</h3>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2">
          {modes.map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left",
                  activeMode === mode.id
                    ? "bg-slate-800 border-slate-700"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                )}
              >
                <Icon className={cn("w-4 h-4", mode.color)} />
                <span className="text-white text-sm">{mode.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Custom Prompt */}
        <div>
          <label className="text-slate-400 text-xs mb-2 block">Custom Instructions (optional)</label>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder={`e.g., "Focus on TypeScript types" or "Optimize for React performance"`}
            className="bg-slate-800/50 border-slate-700 text-white text-sm min-h-[60px]"
          />
        </div>

        {/* Ask Button */}
        <Button
          onClick={handleAsk}
          disabled={isProcessing || !code}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <currentMode.icon className="w-4 h-4 mr-2" />
              {currentMode.name}
            </>
          )}
        </Button>

        {/* Response */}
        {response && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <span>AI Response</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyResponse}
                    className="text-slate-400 hover:text-white h-7"
                  >
                    {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-slate-950 rounded-lg p-3 max-h-96 overflow-auto">
                <pre className="text-slate-300 text-xs font-mono whitespace-pre-wrap">
                  {response}
                </pre>
              </div>
              
              {response.includes('```') && (
                <Button
                  onClick={applyCode}
                  variant="outline"
                  className="w-full border-slate-700 text-blue-400 hover:text-blue-300"
                  size="sm"
                >
                  Apply Code to Editor
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!response && !isProcessing && (
          <div className="text-center py-8">
            <currentMode.icon className={cn("w-12 h-12 mx-auto mb-3", currentMode.color)} />
            <p className="text-slate-400 text-sm">
              Select code and click "{currentMode.name}" to get AI assistance
            </p>
          </div>
        )}
      </div>
    </div>
  );
}