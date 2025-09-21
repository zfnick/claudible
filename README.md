# Claudible – Audit Assistant

**AI-Enhanced Compliance Audit Assistant**

Scan cloud configurations and logs to flag compliance risks (e.g., HIPAA, GDPR, ISO 27001, PDPA) and produce human-readable explanations for audit readiness. This repository contains a **frontend-focused hackathon prototype** that showcases the concept of an AI-driven compliance assistant. Reports are session-based, with no long-term data storage.

---

## Problem Statement

Organizations struggle to quickly understand their cloud compliance posture across multiple frameworks. Audits are time-consuming, require expert knowledge, and deliver findings that are often not actionable. Teams want:

* Rapid checks against major frameworks (HIPAA, GDPR, ISO 27001, PDPA, etc.)
* Clear explanations and remediation guidance
* A session-based experience that doesn’t retain sensitive data

---

## Vision

Claudible aims to let users delegate **read-only, least-privilege access** to their cloud environment (no write access), then ask natural questions like:

* *“Check security compliance”*
* *“Show risks for access controls”*

An agentic AI would:

1. Read relevant configurations and logs (scoped to the user’s prompt)
2. Summarize findings and violations
3. Produce a dashboard, concise summary, and recommended actions with justifications

---

## What This Demo Includes

* **Landing page** introducing Claudible and its purpose
* **Login flow** that routes to a dashboard
* **Provider selection** and *Before Start* step
* **AI-assisted Summary page** with:

  * Session-based “scan” simulation driven by user prompts
  * KPI pills: Critical Issues, Medium Risks, Compliant
  * Severity distribution (stacked bar)
  * Latest Scan Results with expandable details:

    * Explanation
    * Referenced frameworks (violations)
    * Recommended remediation steps
  * Context-aware chat to expand findings
  * **Download as print-optimized PDF** (KPI snapshot + detailed findings table)
* **Session model**: refreshing or “ending session” clears all data

---

## Design & UX

* **Theme:** Light, modern glassmorphism
* **Animations:** Smooth transitions powered by Framer Motion
* **Report Export:**

  * Dedicated print header (logo, timestamp)
  * Multi-page, clean layout (no cropped screenshots)
  * Clear and detailed findings tables

---

## Tech Stack

* **Frontend:** Vite + React + TypeScript
* **Styling:** Tailwind CSS v4 + Shadcn UI
* **Animations:** Framer Motion

---

## Security & Data

* Session-based: All data cleared on refresh or end-session
* Reports generated entirely in-browser
* Nothing persisted beyond the session

---

## Future Roadmap

* Integrate **real AWS AI services** for live analysis
* Expand compliance coverage across more global and local frameworks
* Enrich PDF exports with executive summaries and additional visuals
* Optional encrypted persistence for team collaboration

---

## Note

Due to limited time, technical knowledge, and practical skills during the hackathon, we could not fully deploy AWS AI services into our app. However, the **proof of concept is demonstrated end-to-end** through the frontend prototype, showing the **intended user experience and system vision**.

---
