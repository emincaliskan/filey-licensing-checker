import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KeywordGapsProps {
  keywordGaps: string[];
  matchedKeywords: string[];
  className?: string;
}

export function KeywordGaps({
  keywordGaps,
  matchedKeywords,
  className,
}: KeywordGapsProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-destructive">
          Missing Keywords ({keywordGaps.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {keywordGaps.length > 0 ? (
            keywordGaps.map((keyword) => (
              <Badge
                key={keyword}
                variant="outline"
                className="border-destructive/50 text-destructive"
              >
                {keyword}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No missing keywords found.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">
          Matched Keywords ({matchedKeywords.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {matchedKeywords.length > 0 ? (
            matchedKeywords.map((keyword) => (
              <Badge
                key={keyword}
                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
              >
                {keyword}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No matched keywords found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
