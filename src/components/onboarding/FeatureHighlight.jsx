import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function FeatureHighlight({ 
  targetId, 
  title, 
  description, 
  onComplete,
  show = false,
  position = 'bottom'
}) {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    if (show && targetId) {
      const element = document.getElementById(targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      }
    }
  }, [show, targetId]);

  if (!show) return null;

  const tooltipPosition = {
    top: position === 'top' ? coords.top - 20 : position === 'bottom' ? coords.top + coords.height + 20 : coords.top,
    left: position === 'left' ? coords.left - 320 : position === 'right' ? coords.left + coords.width + 20 : coords.left
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onComplete}
          />

          {/* Spotlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[101] rounded-lg ring-4 ring-cyan-500 shadow-2xl shadow-cyan-500/50"
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
              height: coords.height,
              pointerEvents: 'none'
            }}
          />

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed z-[102] w-80"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left
            }}
          >
            <div className="bg-slate-900 rounded-xl p-6 border border-cyan-500/50 shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">{title}</h3>
                <button
                  onClick={onComplete}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                {description}
              </p>

              <Button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                Got it!
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}