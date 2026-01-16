import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  TestTube2, 
  Zap, 
  FileText, 
  Copy, 
  Loader2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function CodeAI() {
  const [inputCode, setInputCode] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('tests');

  // Generate unit tests using AI
  const generateTests = async () => {
    if (!inputCode.trim()) {
      toast.error('Please provide code to generate tests for');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate comprehensive unit tests for the following code. Include edge cases and error scenarios. Use Jest/React Testing Library syntax.\n\nCode:\n${inputCode}`,
      });
      setOutput(result);
      toast.success('Tests generated successfully');
    } catch (error) {
      toast.error('Failed to generate tests');
    } finally {
      setIsProcessing(false);
    }
  };

  // Optimize code for performance
  const optimizeCode = async () => {
    if (!inputCode.trim()) {
      toast.error('Please provide code to optimize');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze and optimize the following code for performance. Focus on:\n- Reducing unnecessary re-renders\n- Optimizing loops and algorithms\n- Memory efficiency\n- Using proper React patterns (useMemo, useCallback)\n\nProvide the optimized code with inline comments explaining improvements.\n\nCode:\n${inputCode}`,
      });
      setOutput(result);
      toast.success('Code optimized successfully');
    } catch (error) {
      toast.error('Failed to optimize code');
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate documentation
  const generateDocs = async () => {
    if (!inputCode.trim()) {
      toast.error('Please provide code to document');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Add comprehensive JSDoc documentation to the following code. Include:\n- Function descriptions\n- Parameter types and descriptions\n- Return value descriptions\n- Usage examples where appropriate\n\nCode:\n${inputCode}`,
      });
      setOutput(result);
      toast.success('Documentation generated successfully');
    } catch (error) {
      toast.error('Failed to generate documentation');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard');
  };

  const features = [
    {
      id: 'tests',
      title: 'Generate Tests',
      description: 'Create comprehensive unit tests with edge cases',
      icon: TestTube2,
      color: 'text-emerald-400',
      action: generateTests,
    },
    {
      id: 'optimize',
      title: 'Optimize Code',
      description: 'Improve performance and reduce complexity',
      icon: Zap,
      color: 'text-amber-400',
      action: optimizeCode,
    },
    {
      id: 'docs',
      title: 'Generate Docs',
      description: 'Add JSDoc documentation and comments',
      icon: FileText,
      color: 'text-blue-400',
      action: generateDocs,
    },
  ];

  const activeFeature = features.find(f => f.id === activeTab);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Code Tools</h1>
            <p className="text-slate-400">Generate tests, optimize code, and create documentation</p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {features.map(feature => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => setActiveTab(feature.id)}
              className={`p-6 rounded-2xl border transition-all text-left ${
                activeTab === feature.id
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-10 h-10 mb-4 ${feature.color}`} />
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </button>
          );
        })}
      </div>

      {/* Main Interface */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Input Code</span>
              <Badge variant="outline" className="text-slate-400 border-slate-700">
                {inputCode.split('\n').length} lines
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Paste your code here..."
              className="bg-slate-950 border-slate-800 text-white font-mono text-sm min-h-[500px] focus:border-blue-500"
            />
            <div className="flex gap-3 mt-4">
              <Button
                onClick={activeFeature?.action}
                disabled={isProcessing || !inputCode.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {activeFeature && <activeFeature.icon className="w-4 h-4 mr-2" />}
                    {activeFeature?.title}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setInputCode('');
                  setOutput('');
                }}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Generated Output</span>
              {output && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {output ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[500px] overflow-auto">
                <pre className="text-slate-300 text-sm font-mono whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[500px] text-center">
                <div>
                  {activeFeature && <activeFeature.icon className={`w-16 h-16 mx-auto mb-4 ${activeFeature.color}`} />}
                  <p className="text-slate-400 mb-2">
                    {isProcessing ? 'AI is processing your code...' : 'Output will appear here'}
                  </p>
                  <p className="text-slate-600 text-sm">
                    {!isProcessing && 'Paste code and click the button to generate'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Example Snippets */}
      <Card className="mt-8 bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Example Code Snippets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: 'React Component',
                code: `function UserProfile({ userId }) {\n  const [user, setUser] = useState(null);\n  \n  useEffect(() => {\n    fetchUser(userId).then(setUser);\n  }, [userId]);\n  \n  return <div>{user?.name}</div>;\n}`,
              },
              {
                title: 'API Function',
                code: `async function fetchData(endpoint) {\n  const response = await fetch(endpoint);\n  const data = await response.json();\n  return data;\n}`,
              },
              {
                title: 'Algorithm',
                code: `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}`,
              },
            ].map((snippet, idx) => (
              <button
                key={idx}
                onClick={() => setInputCode(snippet.code)}
                className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 text-left transition-all"
              >
                <h4 className="text-white font-medium mb-2">{snippet.title}</h4>
                <pre className="text-slate-500 text-xs font-mono overflow-hidden">
                  {snippet.code.substring(0, 60)}...
                </pre>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}