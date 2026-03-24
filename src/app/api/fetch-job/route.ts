import { NextRequest, NextResponse } from "next/server";
import { scrapeJobUrl } from "@/lib/scraper";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "A valid URL is required" },
        { status: 400 }
      );
    }

    const text = await scrapeJobUrl(url);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract job description from the provided URL" },
        { status: 400 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error fetching job description:", error);
    return NextResponse.json(
      { error: "Failed to fetch job description from the provided URL" },
      { status: 500 }
    );
  }
}
