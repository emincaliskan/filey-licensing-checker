# Filey Licensing Checker

Property licensing compliance tool for **Filey Properties** — a London-based lettings and property management agency operating across North and East London.

**Agent 1-L** in Filey's 55-agent AI automation programme (Priority 1).

## What it does

Enter a property address (postcode), select property configuration, and get an instant licensing compliance report showing:

- Which licences are required (Mandatory HMO, Additional HMO, Selective)
- Fees and applicable discounts
- Application links
- Upcoming scheme changes and advisory notes
- Downloadable PDF report

## Supported Boroughs

| Borough | Mandatory HMO | Additional HMO | Selective |
|---------|:---:|:---:|:---:|
| Hackney | Active | From May 2026 | 17 wards, from May 2026 |
| Haringey | Active | Active (June 2024) | Active (Nov 2022) |
| Enfield | Active | Active (Sep 2025) | 14 wards (Sep 2021) |
| Waltham Forest | Active | Active (Apr 2025) | Most wards (May 2025) |
| Islington | Active | From Feb 2026 | 7 wards (TBC) |
| Barnet | Active | Active | No selective scheme |

## Setup

```bash
cd filey-licensing-checker
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Build for Production

```bash
npm run build
```

Static files are output to `dist/`. Deploy to any static hosting (GitHub Pages, Netlify, Vercel, etc.).

## Run Tests

```bash
npm test
```

## How to Update Borough Data

All licensing data is stored in `src/data/boroughs.json`. To update:

1. Open `src/data/boroughs.json`
2. Find the relevant borough section
3. Update fees, dates, ward lists, or other details
4. Update `metadata.last_updated` to the current date
5. Rebuild and deploy

The JSON structure for each borough:

```json
{
  "borough_key": {
    "name": "Full Borough Name",
    "short_name": "Short Name",
    "council_url": "https://...",
    "mandatory_hmo": { ... },
    "additional_hmo": { ... },
    "selective": { ... },
    "upcoming_changes": [ ... ],
    "penalties": { ... }
  }
}
```

## How to Add a New Borough

1. Add a new key to `src/data/boroughs.json` following the existing borough structure
2. Include: `mandatory_hmo`, `additional_hmo`, `selective`, `upcoming_changes`, `penalties`
3. For selective licensing, list covered wards. Use `["ALL_EXCEPT_EXCLUDED"]` with `excluded_wards` if most wards are covered
4. Update `metadata.last_updated`
5. Add tests in `src/__tests__/licenceChecker.test.js`

## Deploy to GitHub Pages

1. Install gh-pages: `npm install -D gh-pages`
2. Add to `vite.config.js`: `base: '/filey-licensing-checker/'`
3. Add script to `package.json`: `"deploy": "npm run build && gh-pages -d dist"`
4. Run: `npm run deploy`

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- jsPDF (PDF generation)
- Postcodes.io API (postcode lookup, free, no key required)
- Vitest (testing)

## Disclaimer

This tool provides guidance based on publicly available council licensing data. It does not constitute legal advice. Always verify directly with the relevant council before making licensing decisions.
