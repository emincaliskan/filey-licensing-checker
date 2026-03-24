import { CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillComparisonProps {
  strengthAreas: string[];
  improvementAreas: string[];
  className?: string;
}

export function SkillComparison({
  strengthAreas,
  improvementAreas,
  className,
}: SkillComparisonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Strengths
        </h4>
        <ul className="space-y-2">
          {strengthAreas.length > 0 ? (
            strengthAreas.map((area) => (
              <li
                key={area}
                className="flex items-start gap-2 text-sm"
              >
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                <span>{area}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-muted-foreground">
              No strengths identified yet.
            </li>
          )}
        </ul>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Areas to Improve
        </h4>
        <ul className="space-y-2">
          {improvementAreas.length > 0 ? (
            improvementAreas.map((area) => (
              <li
                key={area}
                className="flex items-start gap-2 text-sm"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber-500" />
                <span>{area}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-muted-foreground">
              No improvement areas identified yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
