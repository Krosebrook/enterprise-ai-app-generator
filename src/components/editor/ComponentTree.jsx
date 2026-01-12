import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileCode, 
  Layout, 
  Palette, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Trash2
} from 'lucide-react';
import { cn } from "@/lib/utils";

const componentIcons = {
  page: Layout,
  component: FileCode,
  style: Palette,
};

export default function ComponentTree({ 
  components = [], 
  selectedId, 
  onSelect, 
  onAdd,
  onDelete,
  expanded = true 
}) {
  const [expandedItems, setExpandedItems] = React.useState(new Set(['pages', 'components', 'styles']));

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const groupedComponents = {
    pages: components.filter(c => c.type === 'page'),
    components: components.filter(c => c.type === 'component'),
    styles: components.filter(c => c.type === 'style'),
  };

  const renderGroup = (groupName, items) => {
    const isExpanded = expandedItems.has(groupName);
    
    return (
      <div key={groupName} className="mb-2">
        <button
          onClick={() => toggleExpand(groupName)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="font-medium capitalize">{groupName}</span>
            <Badge variant="outline" className="text-xs border-slate-700">
              {items.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onAdd?.(groupName === 'styles' ? 'style' : groupName.slice(0, -1));
            }}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </button>
        
        {isExpanded && (
          <div className="ml-2 space-y-1">
            {items.map((item) => {
              const Icon = componentIcons[item.type];
              const isSelected = selectedId === item.id;
              
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer",
                    isSelected
                      ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                  onClick={() => onSelect?.(item)}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(item.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </Button>
                </div>
              );
            })}
            {items.length === 0 && (
              <p className="text-xs text-slate-600 px-3 py-2">No {groupName} yet</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {Object.entries(groupedComponents).map(([groupName, items]) =>
        renderGroup(groupName, items)
      )}
    </div>
  );
}