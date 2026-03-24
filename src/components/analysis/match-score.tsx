"use client";

import { cn } from "@/lib/utils";

interface MatchScoreProps {
  score: number;
  className?: string;
}

export function MatchScore({ score, className }: MatchScoreProps) {
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  const color =
    clampedScore >= 70
      ? "text-green-500"
      : clampedScore >= 40
        ? "text-yellow-500"
        : "text-red-500";

  const strokeColor =
    clampedScore >= 70
      ? "stroke-green-500"
      : clampedScore >= 40
        ? "stroke-yellow-500"
        : "stroke-red-500";

  const label =
    clampedScore >= 70
      ? "Great Match"
      : clampedScore >= 40
        ? "Moderate Match"
        : "Needs Improvement";

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: 120, height: 120 }}>
        <svg width={120} height={120} viewBox="0 0 120 120" className="-rotate-90">
          <circle
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={8}
            className="text-muted/30"
          />
          <circle
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn("transition-all duration-700 ease-out", strokeColor)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold", color)}>{clampedScore}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <p className={cn("text-sm font-medium", color)}>{label}</p>
    </div>
  );
}
