"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { LinkedInTip } from "@/types";

interface LinkedInTipsProps {
  tips: LinkedInTip[];
  className?: string;
}

export function LinkedInTips({ tips, className }: LinkedInTipsProps) {
  if (tips.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No LinkedIn suggestions available.
      </p>
    );
  }

  return (
    <Accordion type="multiple" className={cn("w-full", className)}>
      {tips.map((tip, i) => (
        <AccordionItem key={i} value={`tip-${i}`}>
          <AccordionTrigger className="text-left">
            <span className="font-medium">{tip.section}</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {tip.current && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Current
                  </p>
                  <p className="text-sm rounded-md bg-muted p-3">
                    {tip.current}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                  Suggested
                </p>
                <p className="text-sm rounded-md bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800">
                  {tip.suggested}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Why
                </p>
                <p className="text-sm text-muted-foreground">{tip.reason}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
