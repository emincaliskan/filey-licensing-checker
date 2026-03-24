"use client";

import Link from "next/link";
import { FileText, Target, Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center gap-8 px-4 py-24 text-center md:py-32">
        <div className="flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          AI-Powered Resume Optimization
        </div>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Tailor your resume to{" "}
          <span className="text-primary">any job</span> in seconds
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground">
          Upload your resume and a job description. Resumatch analyzes both,
          optimizes your resume for the role, and gives you LinkedIn profile
          improvement tips.
        </p>

        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Get Started
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 px-4 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          <FeatureCard
            icon={<FileText className="h-8 w-8 text-primary" />}
            title="Smart Resume Parsing"
            description="Upload your PDF resume or paste your LinkedIn profile. Our AI extracts and structures your experience instantly."
          />
          <FeatureCard
            icon={<Target className="h-8 w-8 text-primary" />}
            title="Job Match Analysis"
            description="Get a match score, see keyword gaps, and understand exactly what the hiring manager is looking for."
          />
          <FeatureCard
            icon={<Sparkles className="h-8 w-8 text-primary" />}
            title="Optimized Output"
            description="Receive a tailored resume and LinkedIn improvement tips that highlight your relevant experience."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
          <StepCard step={1} title="Upload" description="Add your resume (PDF) and the job description (paste or URL)." />
          <StepCard step={2} title="Analyze" description="AI compares your profile against job requirements in seconds." />
          <StepCard step={3} title="Download" description="Get your optimized resume as PDF and LinkedIn improvement tips." />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-6">
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
        {step}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
