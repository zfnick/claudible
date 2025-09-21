# Audit Assistant UI – Hackathon Prototype

AI-Enhanced Compliance Audit Assistant
Scan cloud configurations and logs to flag compliance risks (e.g., HIPAA, GDPR, ISO 27001) and produce human‑readable explanations for audit readiness. This repository contains a front‑end, session‑only demo suitable for a hackathon showcase. No sensitive cloud connections are made in this prototype, and no user data is persisted.

Note: This project is a mock hackathon front end. It does not call any external AI or cloud provider APIs. It simulates the full user experience end‑to‑end.

## Problem Statement

Organizations struggle to quickly understand their cloud compliance posture across multiple frameworks. Audits are time‑consuming, require expert knowledge, and deliver findings that are often not actionable. Teams want:
- Rapid checks against major frameworks (HIPAA, GDPR, ISO 27001, etc.)
- Clear explanations and remediation guidance
- A session‑based experience that doesn't retain their data

## Vision

Enable users to delegate a read‑only, least‑privilege access to their cloud (no write access), then ask natural questions like "check security compliance" or "show risks for access controls." An agentic AI would:
1) Read relevant configurations and logs (scoped to the user's prompt)
2) Summarize findings and violations
3) Produce a dashboard, concise summary, and "what you should do" recommendations with justifications based on the observed data

For this hackathon front‑end demo, everything is simulated locally. No external services are invoked. The future direction is to support a read‑only integration for a user's account (e.g., user grants a least‑privilege access) so the agent can analyze only what the user requests. Nothing would be stored—reports live only for the current session.

## What This Demo Includes

- Landing page with the product story and a clear call to action
- Simple login (demo only) that routes to a dashboard
- Provider selection and a "Before Start" step (reads account ID, non‑persistent)
- AI‑assisted Summary page:
  - Session‑based "scan" simulation driven by user prompts
  - Realistic staged loading with progress and animated steps
  - KPI pills: Critical Issues, Medium Risks, Compliant
  - Severity distribution (stacked bar)
  - Latest Scan Results with expandable details:
    - Explanation
    - Referenced frameworks (violations)
    - "What you should do" remediation steps
  - Context‑aware chat that can summarize and expand existing findings without re‑running a full analysis
  - Download as a print‑optimized PDF: includes a print‑only header, KPI snapshot, and a detailed findings table with full details
- Session model: refreshing or "ending session" clears all data; nothing is stored

## How It Works (Demo Mode)

- No external connections, keys, or accounts required
- The assistant simulates "analysis" based on your prompt, including:
  - Generic compliance findings
  - Malaysia‑specific use cases (NCCP 2025, Cybersecurity Act 2024, Data Sharing Act 2025) to showcase localization
  - Structured JSON input support (paste JSON that describes buckets, roles, functions, etc.) to generate consistent counts and recommendations
- All results are in‑memory only for the session
- The PDF export uses the browser's print flow with specialized print styles to include the entire report contents (not a cropped screenshot)

## Future Roadmap (Post‑Hackathon)

- Add a secure, read‑only, least‑privilege integration so users can allow the agent to analyze their cloud resources on demand
- Expand coverage across more frameworks and jurisdictions
- Enrich the PDF export with deeper visuals and an executive summary section
- Opt‑in encrypted report persistence for team sharing (off by default)

## Using The Demo

1) Install deps
- Use your standard frontend tooling (pnpm or npm). The project is Vite + React + Tailwind.  

2) Run the dev server
- Start the Vite dev server and open the app in your browser

3) Try the flow
- Home → Login → Dashboard → Providers → Before Start → Summary
- In Summary, type prompts like:
  - "Summarize current risks"
  - "Explain the public bucket issue"
  - "Show details for IAM over‑privileged role"
  - "More examples"
  - Or paste structured configuration JSON to drive specific findings

4) Export a report
- Click "Download PDF" on the Summary page to print a clean, multi‑page report including the KPI snapshot and a detailed table of findings with explanations, violations, and remediation

## Sample Structured JSON (Demo Input)

Paste a minimal JSON to drive deterministic results, for example:
{
  "S3Buckets": [
    { "BucketName": "customer-data", "PublicAccess": true, "Encryption": "None", "Versioning": "Disabled", "LoggingEnabled": false }
  ],
  "IAMRoles": [
    { "RoleName": "AdminRole", "AttachedPolicies": ["AdministratorAccess"], "MFAEnabled": false }
  ],
  "LambdaFunctions": [
    { "FunctionName": "GenerateReports", "EnvironmentVariables": { "API_KEY": "plaintext" }, "Role": "AdminExecutionRole" }
  ]
}

The Summary will reflect the severities and produce corresponding recommendations.

## Design & UX

- Theme: Light, modern Glassmorphism
- Strong emphasis on contrast and readability across all pages
- Smooth animations using Framer Motion
- Print‑optimized report:
  - Dedicated print header (logo, timestamp)
  - All content flows naturally across pages (no cropping)
  - Dark text enforced for print for legibility
  - Detailed table includes complete finding details

## Tech Stack (Frontend)

- Vite + React + TypeScript
- Tailwind CSS v4
- Shadcn UI components
- Framer Motion for animations

Note: The repository contains scaffolding for more advanced capabilities (such as auth and backend wiring) to support future iterations, but the hackathon demo runs fully locally with simulated data and does not require any external services.

## Security & Data

- Session‑only: No data is saved to a database in this demo
- No external API calls are performed
- PDF export is local; nothing is uploaded

## Contributing (Hackathon)

- Keep changes minimal, composable, and UI‑first
- Maintain session‑only behavior (no persistence)
- Preserve print‑friendly styles and end‑to‑end demo flow

## License

For hackathon and demo purposes only. Review before using in production.