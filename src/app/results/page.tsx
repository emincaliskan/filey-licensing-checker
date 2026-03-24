"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { MatchScore } from "@/components/analysis/match-score";
import { KeywordGaps } from "@/components/analysis/keyword-gaps";
import { SkillComparison } from "@/components/analysis/skill-comparison";
import { ResumePreview } from "@/components/resume/resume-preview";
import { LinkedInTips } from "@/components/linkedin/linkedin-tips";
import { Download, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ResultsPage() {
  const router = useRouter();
  const { analysis } = useAppStore();
  const [exporting, setExporting] = useState(false);

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-24">
        <p className="text-lg text-muted-foreground">No analysis results yet.</p>
        <button
          onClick={() => router.push("/analyze")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Go to Analysis
        </button>
      </div>
    );
  }

  async function handleExportPDF() {
    if (!analysis) return;
    setExporting(true);
    try {
      const response = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysis.optimizedResume),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "optimized-resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          <p className="mt-1 text-muted-foreground">
            Your optimized resume and LinkedIn improvement suggestions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/analyze")}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </button>
        </div>
      </div>

      {/* Score + Keywords Row */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Match Score</h2>
          <div className="flex justify-center">
            <MatchScore score={analysis.matchScore} />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Keywords</h2>
          <KeywordGaps
            keywordGaps={analysis.keywordGaps}
            matchedKeywords={analysis.matchedKeywords}
          />
        </div>
      </div>

      {/* Strengths + Improvements */}
      <div className="mb-8 rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Skills Assessment</h2>
        <SkillComparison
          strengthAreas={analysis.strengthAreas}
          improvementAreas={analysis.improvementAreas}
        />
      </div>

      {/* Optimized Resume */}
      <div className="mb-8 rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Optimized Resume</h2>
        <ResumePreview data={analysis.optimizedResume} />
      </div>

      {/* LinkedIn Tips */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">
          LinkedIn Profile Suggestions
        </h2>
        <LinkedInTips tips={analysis.linkedinSuggestions} />
      </div>
    </div>
  );
}
