"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function JobInput({ className }: { className?: string }) {
  const { jobText, setJobText, setJobUrl } = useAppStore();
  const [url, setUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchJob = async () => {
    if (!url.trim()) return;

    setIsFetching(true);
    setError(null);

    try {
      const response = await fetch("/api/fetch-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch job description");
      }

      const data = await response.json();
      setJobText(data.text ?? data.rawText ?? "");
      setJobUrl(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch job description"
      );
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs defaultValue="paste">
        <TabsList className="w-full">
          <TabsTrigger value="paste" className="flex-1">
            Paste Text
          </TabsTrigger>
          <TabsTrigger value="url" className="flex-1">
            From URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste">
          <Textarea
            placeholder="Paste the job description here..."
            className="min-h-[200px]"
            value={jobText ?? ""}
            onChange={(e) => setJobText(e.target.value)}
          />
        </TabsContent>

        <TabsContent value="url">
          <div className="space-y-3">
            <Input
              type="url"
              placeholder="https://example.com/job-posting"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              onClick={handleFetchJob}
              disabled={isFetching || !url.trim()}
              className="w-full"
            >
              {isFetching ? "Fetching..." : "Fetch"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
