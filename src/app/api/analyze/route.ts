import { NextRequest, NextResponse } from "next/server";
import { callClaude } from "@/lib/anthropic";
import { SYSTEM_ANALYZE, buildAnalysisUserMessage } from "@/lib/prompts";
import { analysisResultSchema } from "@/lib/resume-schema";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobText } = await request.json();

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "resumeText is required and must be a string" },
        { status: 400 }
      );
    }

    if (!jobText || typeof jobText !== "string") {
      return NextResponse.json(
        { error: "jobText is required and must be a string" },
        { status: 400 }
      );
    }

    const userMessage = buildAnalysisUserMessage(resumeText, jobText);
    const rawResponse = await callClaude(SYSTEM_ANALYZE, userMessage);

    // Extract JSON from the response (handle markdown code fences if present)
    let jsonString = rawResponse.trim();
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      console.error("Failed to parse Claude response as JSON:", rawResponse);
      return NextResponse.json(
        { error: "AI returned an invalid JSON response. Please try again." },
        { status: 500 }
      );
    }

    const validation = analysisResultSchema.safeParse(parsed);

    if (!validation.success) {
      console.error("Validation errors:", validation.error.flatten());
      return NextResponse.json(
        {
          error: "AI response did not match the expected schema. Please try again.",
          details: validation.error.flatten(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(validation.data);
  } catch (error) {
    console.error("Error in analysis route:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume and job description" },
      { status: 500 }
    );
  }
}
