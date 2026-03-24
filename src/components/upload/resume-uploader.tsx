"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, FileText } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ResumeUploader({ className }: { className?: string }) {
  const { setResumeText, setResumeFile, resumeFileName, resumeText } =
    useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to parse resume");
        }

        const data = await response.json();
        setResumeText(data.text ?? data.rawText ?? "");
        setResumeFile(file.name);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to upload resume"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [setResumeText, setResumeFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const isSuccess = !!resumeFileName && !!resumeText;

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          isSuccess && "border-green-500/50 bg-green-50 dark:bg-green-950/20"
        )}
      >
        <input {...getInputProps()} />
        {isSuccess ? (
          <>
            <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              {resumeFileName}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Resume parsed successfully. Drop a new file to replace.
            </p>
          </>
        ) : (
          <>
            <Upload
              className={cn(
                "h-10 w-10 mb-2",
                isUploading
                  ? "text-muted-foreground animate-pulse"
                  : "text-muted-foreground"
              )}
            />
            <p className="text-sm font-medium">
              {isDragActive
                ? "Drop your resume here"
                : "Drag & drop your resume PDF here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse (PDF only)
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="linkedin-url">
          LinkedIn Profile URL (optional)
        </label>
        <Input
          id="linkedin-url"
          type="url"
          placeholder="https://linkedin.com/in/your-profile"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
        />
      </div>
    </div>
  );
}
