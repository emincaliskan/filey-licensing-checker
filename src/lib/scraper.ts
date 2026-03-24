import * as cheerio from "cheerio";

const JOB_BOARD_SELECTORS: Record<string, string> = {
  "linkedin.com": ".description__text",
  "indeed.com": "#jobDescriptionText",
  "greenhouse.io": "#content .body",
};

function getJobBoardSelector(url: string): string | null {
  for (const [domain, selector] of Object.entries(JOB_BOARD_SELECTORS)) {
    if (url.includes(domain)) return selector;
  }
  return null;
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function scrapeJobUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove script, style, nav, and footer tags
  $("script, style, nav, footer").remove();

  // Try known job board selectors first
  const boardSelector = getJobBoardSelector(url);
  if (boardSelector) {
    const boardContent = $(boardSelector).text();
    if (boardContent.trim()) {
      return cleanText(boardContent);
    }
  }

  // Fallback: try main content areas
  const fallbackSelectors = ["main", "article", "[role='main']", ".job-description", ".posting-page"];
  for (const selector of fallbackSelectors) {
    const content = $(selector).text();
    if (content.trim().length > 100) {
      return cleanText(content);
    }
  }

  // Last resort: extract from body
  const bodyText = $("body").text();
  return cleanText(bodyText);
}
