"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  LeadScoreBreakdown, 
  getScoreLabel, 
  SCORE_BREAKDOWN_LABELS 
} from "@/lib/leads/scoring";

interface LeadScoreBadgeProps {
  score: number;
  breakdown?: LeadScoreBreakdown;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function LeadScoreBadge({ 
  score, 
  breakdown, 
  size = "md",
  showTooltip = true 
}: LeadScoreBadgeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { color, emoji } = getScoreLabel(score);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5 font-semibold",
  };

  return (
    <div className="relative inline-block">
      <Badge 
        className={`${color} ${sizeClasses[size]} cursor-help transition-transform hover:scale-105`}
        onMouseEnter={() => showTooltip && setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        {emoji} {score}
      </Badge>

      {/* Tooltip mit Score-Breakdown */}
      {showTooltip && showDetails && breakdown && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
          <div className="font-semibold mb-2 text-center border-b pb-2">
            Lead Score: {score}/100
          </div>
          <div className="space-y-1.5">
            {(Object.keys(SCORE_BREAKDOWN_LABELS) as Array<keyof typeof SCORE_BREAKDOWN_LABELS>).map((key) => {
              const { label: categoryLabel, max } = SCORE_BREAKDOWN_LABELS[key];
              const value = breakdown[key];
              const percentage = (value / max) * 100;
              
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                    <span>{categoryLabel}</span>
                    <span className="font-medium">{value}/{max}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-8 border-transparent border-t-white" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Kompakte Score-Anzeige für Kanban/Listen
 */
export function LeadScoreCompact({ score }: { score: number }) {
  const { color } = getScoreLabel(score);
  
  return (
    <span 
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${color}`}
      title={`Lead Score: ${score}`}
    >
      {score}
    </span>
  );
}

/**
 * Score-Progress für Detail-Seite
 */
export function LeadScoreDetail({ score, breakdown }: { score: number; breakdown: LeadScoreBreakdown }) {
  const { label, emoji } = getScoreLabel(score);

  return (
    <div className="space-y-4">
      {/* Haupt-Score */}
      <div className="flex items-center gap-3">
        <div className={`text-4xl font-bold ${score >= 60 ? "text-green-600" : score >= 40 ? "text-yellow-600" : "text-orange-600"}`}>
          {score}
        </div>
        <div>
          <div className="font-medium">{emoji} {label}</div>
          <div className="text-sm text-slate-500">von 100 Punkten</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${
            score >= 60 ? "bg-green-500" : 
            score >= 40 ? "bg-yellow-500" : 
            "bg-orange-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {(Object.keys(SCORE_BREAKDOWN_LABELS) as Array<keyof typeof SCORE_BREAKDOWN_LABELS>).map((key) => {
          const { label: categoryLabel, max } = SCORE_BREAKDOWN_LABELS[key];
          const value = breakdown[key];
          const percentage = Math.round((value / max) * 100);
          
          return (
            <div key={key} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                  <span>{categoryLabel}</span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      percentage >= 70 ? "bg-green-400" :
                      percentage >= 40 ? "bg-yellow-400" :
                      "bg-orange-400"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
