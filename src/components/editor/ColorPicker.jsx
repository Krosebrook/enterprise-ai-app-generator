import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const presetColors = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981',
  '#14b8a6', '#06b6d4', '#0ea5e9', '#6366f1', '#a855f7',
];

export default function ColorPicker({ value = '#3b82f6', onChange, label }) {
  const [hexInput, setHexInput] = useState(value);

  const handleChange = (newColor) => {
    setHexInput(newColor);
    onChange?.(newColor);
  };

  return (
    <div>
      {label && <Label className="text-slate-300 mb-2 block">{label}</Label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start bg-slate-800/50 border-slate-700"
          >
            <div
              className="w-6 h-6 rounded border border-slate-600 mr-3"
              style={{ backgroundColor: value }}
            />
            <span className="text-white">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-slate-800 border-slate-700">
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300 text-xs mb-2 block">Hex Color</Label>
              <Input
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onBlur={(e) => handleChange(e.target.value)}
                placeholder="#000000"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 text-xs mb-2 block">Presets</Label>
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleChange(color)}
                    className="w-10 h-10 rounded-lg border-2 border-slate-700 hover:border-slate-500 transition-all"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}