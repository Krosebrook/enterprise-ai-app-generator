import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Code, 
  FileJson, 
  Copy, 
  CheckCircle2,
  ListTodo,
  Palette
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const examples = [
  {
    id: 'taskflow',
    name: 'TaskFlow SaaS',
    filename: 'vibe-saas-taskflow.json',
    description: 'A complete task management SaaS application with team collaboration features',
    category: 'saas',
    icon: ListTodo,
    color: 'blue',
    config: {
      name: "TaskFlow",
      template: "saas-core-v1.2.0",
      features: ["auth", "database", "email", "payments"],
      ai_model: "gpt-4",
      entities: [
        { name: "Task", fields: ["title", "description", "status", "priority", "assignee", "due_date"] },
        { name: "Project", fields: ["name", "description", "team_members"] },
        { name: "Comment", fields: ["content", "task_id", "author"] }
      ],
      integrations: ["stripe", "sendgrid", "slack"]
    }
  },
  {
    id: 'brandcraft',
    name: 'AI BrandCraft',
    filename: 'vibe-ai-brandcraft.json',
    description: 'AI-powered brand identity generator with logo, color palette, and messaging',
    category: 'ai',
    icon: Palette,
    color: 'purple',
    config: {
      name: "BrandCraft",
      template: "ai-brandcraft",
      features: ["auth", "database", "ai"],
      ai_model: "gpt-4-turbo",
      entities: [
        { name: "Brand", fields: ["name", "industry", "values", "target_audience"] },
        { name: "Asset", fields: ["type", "url", "brand_id"] },
        { name: "Generation", fields: ["prompt", "result", "model_used"] }
      ],
      ai_workflows: [
        "logo-generation",
        "color-palette",
        "tagline-creation",
        "brand-voice"
      ]
    }
  }
];

export default function Examples() {
  const [selectedExample, setSelectedExample] = useState(examples[0]);
  const [copied, setCopied] = useState(false);

  const copyConfig = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedExample.config, null, 2));
    setCopied(true);
    toast.success('Configuration copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Examples</h1>
        <p className="text-slate-400">Pre-built configurations to get you started quickly</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Example List */}
        <div className="space-y-4">
          {examples.map(example => {
            const colorClasses = {
              blue: "border-blue-500/30 bg-blue-500/10",
              purple: "border-purple-500/30 bg-purple-500/10",
            };
            const isSelected = selectedExample.id === example.id;
            
            return (
              <button
                key={example.id}
                onClick={() => setSelectedExample(example)}
                className={cn(
                  "w-full p-5 rounded-2xl border text-left transition-all",
                  isSelected
                    ? colorClasses[example.color]
                    : "bg-slate-900/50 border-slate-800/50 hover:border-slate-700"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    isSelected ? `bg-${example.color}-500/20` : "bg-slate-800"
                  )}>
                    <example.icon className={cn(
                      "w-6 h-6",
                      isSelected ? `text-${example.color}-400` : "text-slate-400"
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn(
                        "font-semibold",
                        isSelected ? "text-white" : "text-slate-300"
                      )}>
                        {example.name}
                      </h3>
                      <Badge className="text-xs" variant="outline">
                        {example.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">{example.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Example Detail */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center",
                  `bg-${selectedExample.color}-500/20`
                )}>
                  <selectedExample.icon className={cn("w-7 h-7", `text-${selectedExample.color}-400`)} />
                </div>
                <div>
                  <CardTitle className="text-white">{selectedExample.name}</CardTitle>
                  <p className="text-slate-400 text-sm mt-1">{selectedExample.filename}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={copyConfig}
                className="border-slate-700 text-slate-300 hover:text-white"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Config
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="config">
                <TabsList className="bg-slate-800/50">
                  <TabsTrigger value="config" className="data-[state=active]:bg-slate-700">
                    <FileJson className="w-4 h-4 mr-2" />
                    Configuration
                  </TabsTrigger>
                  <TabsTrigger value="entities" className="data-[state=active]:bg-slate-700">
                    <Code className="w-4 h-4 mr-2" />
                    Entities
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="config" className="mt-4">
                  <div className="bg-slate-950 rounded-xl p-4 overflow-auto max-h-96">
                    <pre className="text-sm text-slate-300 font-mono">
                      {JSON.stringify(selectedExample.config, null, 2)}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="entities" className="mt-4">
                  <div className="space-y-4">
                    {selectedExample.config.entities?.map((entity, idx) => (
                      <div key={idx} className="bg-slate-950 rounded-xl p-4">
                        <h4 className="text-white font-medium mb-3">{entity.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {entity.fields.map((field, i) => (
                            <Badge key={i} variant="outline" className="border-slate-700 text-slate-400">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-6 border-t border-slate-800">
                <h4 className="text-sm font-medium text-white mb-3">Features Included</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedExample.config.features?.map((feature, idx) => (
                    <Badge key={idx} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}