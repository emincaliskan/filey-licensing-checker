"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { ResumeUploader } from "@/components/upload/resume-uploader";
import { JobInput } from "@/components/upload/job-input";
import { FileText, Briefcase, Loader2 } from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const { resumeText, jobText, isAnalyzing, setAnalyzing, setAnalysis, setError } =
    useAppStore();

  const canAnalyze = resumeText && jobText && !isAnalyzing;

  async function handleAnalyze() {
    if (!resumeText || !jobText) return;

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobText }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Analysis failed");
      }

      const result = await response.json();
      setAnalysis(result);
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold">Analyze Your Resume</h1>
        <p className="mt-2 text-muted-foreground">
          Upload your resume and provide the job description to get started
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Resume Upload */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5 text-primary" />
            Your Resume
          </div>
          <ResumeUploader />
        </div>

        {/* Job Description */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Briefcase className="h-5 w-5 text-primary" />
            Job Description
          </div>
          <JobInput />
        </div>
      </div>

      {/* Status indicators */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              resumeText ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          Resume {resumeText ? "ready" : "needed"}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              jobText ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          Job description {jobText ? "ready" : "needed"}
        </div>
      </div>

      {/* Error display */}
      {useAppStore.getState().error && (
        <div className="mx-auto mt-4 max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive">
          {useAppStore.getState().error}
        </div>
      )}

      {/* Analyze button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-10 py-3 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze & Optimize"
          )}
        </button>
      </div>

      {isAnalyzing && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            This may take 15-30 seconds. Our AI is parsing your resume,
            analyzing the job requirements, and crafting an optimized version...
          </p>
        </div>
      )}
    </div>
  );
}
