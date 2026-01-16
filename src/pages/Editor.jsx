import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Save, 
  Eye, 
  Code,
  Undo,
  Redo,
  RefreshCw
} from 'lucide-react';
import ComponentTree from '@/components/editor/ComponentTree';
import ColorPicker from '@/components/editor/ColorPicker';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';

const mockComponents = [
  { id: '1', name: 'Home', type: 'page', content: '<div>Home Page</div>' },
  { id: '2', name: 'About', type: 'page', content: '<div>About Page</div>' },
  { id: '3', name: 'Header', type: 'component', content: '<header>Header</header>' },
  { id: '4', name: 'Footer', type: 'component', content: '<footer>Footer</footer>' },
  { id: '5', name: 'Theme', type: 'style', content: 'primary: #3b82f6' },
];

export default function Editor() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState('');
  const [components, setComponents] = useState(mockComponents);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  const [editValues, setEditValues] = useState({
    content: '',
    styles: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#ec4899',
    }
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.AppProject.list(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.TemplateEdit.create({
        project_id: selectedProject,
        component_type: selectedComponent.type,
        component_name: selectedComponent.name,
        changes: data,
        version: (selectedComponent.version || 0) + 1,
        is_published: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templateEdits'] });
      setIsDirty(false);
      toast.success('Changes saved successfully');
    },
  });

  useEffect(() => {
    if (selectedComponent) {
      setEditValues({
        content: selectedComponent.content || '',
        styles: editValues.styles,
      });
    }
  }, [selectedComponent]);

  const handleSave = () => {
    if (!selectedComponent) return;
    
    const updatedComponents = components.map(c =>
      c.id === selectedComponent.id
        ? { ...c, content: editValues.content, version: (c.version || 0) + 1 }
        : c
    );
    setComponents(updatedComponents);
    
    saveMutation.mutate({
      content: editValues.content,
      styles: editValues.styles,
    });
  };

  const handleAddComponent = (type) => {
    const newComponent = {
      id: Date.now().toString(),
      name: `New ${type}`,
      type,
      content: type === 'style' ? 'primary: #3b82f6' : '<div>New Content</div>',
    };
    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent);
    toast.success(`New ${type} added`);
  };

  const handleDeleteComponent = (id) => {
    setComponents(components.filter(c => c.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
    toast.success('Component deleted');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">Visual Editor</h1>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64 bg-slate-900/50 border-slate-800 text-white">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <div className="h-6 w-px bg-slate-800 mx-2" />
          <Button
            variant="ghost"
            onClick={() => setPreviewMode(!previewMode)}
            className={cn(
              "text-slate-400",
              previewMode && "bg-blue-500/20 text-blue-400"
            )}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty || !selectedComponent || saveMutation.isPending}
            className="bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Component Tree */}
        <div className="w-64 border-r border-slate-800 bg-slate-900/50 overflow-y-auto p-4">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Code className="w-4 h-4" />
            Components
          </h2>
          <ComponentTree
            components={components}
            selectedId={selectedComponent?.id}
            onSelect={setSelectedComponent}
            onAdd={handleAddComponent}
            onDelete={handleDeleteComponent}
          />
        </div>

        {/* Center - Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedComponent ? (
            <>
              <div className="border-b border-slate-800 p-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  {selectedComponent.name}
                  <span className="text-slate-500 text-sm">({selectedComponent.type})</span>
                </h3>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                <Tabs defaultValue="content">
                  <TabsList className="bg-slate-800/50 mb-6">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="styles">Styles</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-300 mb-2 block">Component Name</Label>
                        <Input
                          value={selectedComponent.name}
                          onChange={(e) => {
                            setSelectedComponent({ ...selectedComponent, name: e.target.value });
                            setIsDirty(true);
                          }}
                          className="bg-slate-800/50 border-slate-700 text-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-slate-300 mb-2 block">
                          {selectedComponent.type === 'style' ? 'CSS/Styles' : 'HTML/JSX'}
                        </Label>
                        <Textarea
                          value={editValues.content}
                          onChange={(e) => {
                            setEditValues({ ...editValues, content: e.target.value });
                            setIsDirty(true);
                          }}
                          className="bg-slate-800/50 border-slate-700 text-white font-mono text-sm min-h-[400px]"
                          placeholder="Enter your code here..."
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="styles">
                    <Card className="bg-slate-900/50 border-slate-800/50">
                      <CardHeader>
                        <CardTitle className="text-white">Theme Colors</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <ColorPicker
                          label="Primary Color"
                          value={editValues.styles.primary}
                          onChange={(color) => {
                            setEditValues({
                              ...editValues,
                              styles: { ...editValues.styles, primary: color }
                            });
                            setIsDirty(true);
                          }}
                        />
                        <ColorPicker
                          label="Secondary Color"
                          value={editValues.styles.secondary}
                          onChange={(color) => {
                            setEditValues({
                              ...editValues,
                              styles: { ...editValues.styles, secondary: color }
                            });
                            setIsDirty(true);
                          }}
                        />
                        <ColorPicker
                          label="Accent Color"
                          value={editValues.styles.accent}
                          onChange={(color) => {
                            setEditValues({
                              ...editValues,
                              styles: { ...editValues.styles, accent: color }
                            });
                            setIsDirty(true);
                          }}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings">
                    <Card className="bg-slate-900/50 border-slate-800/50">
                      <CardHeader>
                        <CardTitle className="text-white">Component Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-slate-300 mb-2 block">Type</Label>
                          <Input
                            value={selectedComponent.type}
                            disabled
                            className="bg-slate-800/50 border-slate-700 text-slate-400"
                          />
                        </div>
                        <div>
                          <Label className="text-slate-300 mb-2 block">Version</Label>
                          <Input
                            value={selectedComponent.version || 1}
                            disabled
                            className="bg-slate-800/50 border-slate-700 text-slate-400"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <Code className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No Component Selected</h3>
                <p className="text-slate-400">Select a component from the tree to start editing</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Live Preview */}
        {previewMode && (
          <div className="w-96 border-l border-slate-800 bg-slate-900/50 overflow-auto">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Preview
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <div 
                className="bg-white rounded-lg p-4 min-h-[200px]"
                style={{
                  '--primary': editValues.styles.primary,
                  '--secondary': editValues.styles.secondary,
                  '--accent': editValues.styles.accent,
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: editValues.content }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}