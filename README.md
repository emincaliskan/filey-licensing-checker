# Resumatch

AI-powered resume optimization and LinkedIn profile improvement tool. Upload your resume and a job description — Resumatch analyzes both, tailors your resume to the role, and provides LinkedIn improvement suggestions.

## Features

- **Smart Resume Parsing** — Upload a PDF resume and extract structured data automatically
- **Job Description Analysis** — Paste text or provide a URL to a job posting
- **AI-Powered Match Analysis** — Get a match score, keyword gap analysis, and skills assessment
- **Resume Optimization** — Receive a tailored resume that highlights relevant experience
- **LinkedIn Suggestions** — Section-by-section tips to improve your LinkedIn profile
- **PDF Export** — Download your optimized resume as a clean PDF

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Claude API (Anthropic SDK)
- **PDF Parsing**: pdf-parse
- **PDF Generation**: @react-pdf/renderer
- **Web Scraping**: Cheerio
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- An Anthropic API key

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file:

```
ANTHROPIC_API_KEY=your_api_key_here
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## How It Works

1. **Upload** your resume (PDF) and provide the job description (paste or URL)
2. **Analyze** — AI compares your profile against job requirements
3. **Download** your optimized resume and get LinkedIn improvement tips
