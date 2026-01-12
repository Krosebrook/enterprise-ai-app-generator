import React from 'react';
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = "blue" }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400",
    green: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-gradient-to-br border backdrop-blur-xl p-6",
      colorClasses[color]
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-4xl font-bold text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            `bg-${color}-500/20`
          )}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={trend > 0 ? "text-emerald-400" : "text-red-400"}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
          <span className="text-slate-500 text-sm">vs last month</span>
        </div>
      )}
    </div>
  );
}