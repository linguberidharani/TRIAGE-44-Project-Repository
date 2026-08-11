# Future Scope — TRIAGE//44

This document separates what TRIAGE//44 **actually is today (v1.0.0)** from ideas for how it could evolve. Nothing in this file is implemented — it's a roadmap of possibilities, not a feature list.

## CURRENT v1.0.0

- 2 authored SOC alert scenarios (beginner difficulty)
- Three-way classification: Malicious, Benign, Needs Investigation
- Instant feedback with written explanations
- Difficulty filter (All Levels / Beginner / Intermediate / Advanced — only Beginner has scenarios currently)
- Randomized scenario order per session
- Streak tracking
- Score, accuracy, and progress tracking via localStorage
- Results screen with missed-scenario review
- Restart and Reset flows
- Dark/light theme toggle
- Responsive design (desktop, tablet, mobile)
- Keyboard accessibility, focus states, reduced-motion support
- Deployed on GitHub Pages
- No backend, no database, no authentication, no runtime AI

## FUTURE SCOPE

### Next 3 Months
- **Expand the scenario library** beyond the current 2 scenarios toward a meaningfully larger set (the "44" in TRIAGE//44 implies a target scenario count not yet reached)
- **Populate Intermediate and Advanced difficulty scenarios** — currently these filters exist in the UI but have no matching data
- **Real screen-reader testing** with actual assistive technology (NVDA, VoiceOver, or similar), since this remains an honestly-documented gap from Day 8/9 testing
- **Basic in-session analytics** — e.g., which classification type (Malicious/Benign/Needs Investigation) a user gets wrong most often, surfaced on the results screen

### Next 6 Months
- **Categorized alert types** beyond the current single flat scenario list — e.g., grouping by attack pattern (network, endpoint, identity) for more structured learning paths
- **Export/share results** — a way to download or share a session summary (still client-side, e.g. generating a downloadable text/JSON summary, no backend required)
- **A lightweight scenario contribution format** — a documented JSON schema/template so scenarios could be community-contributed via pull request without app code changes

### Next 12 Months
- **Optional backend for cross-device progress** — if genuinely needed, a simple backend (with clear justification) to sync progress across devices, which would be a deliberate architecture change from the current localStorage-only approach, not a default assumption
- **Optional authentication** — only if cross-device sync is introduced; not needed for the current single-device, single-user design
- **AI-assisted scenario generation as a development-time tool** — using AI to help author new scenarios faster during content creation, distinct from any runtime AI dependency in the deployed app itself

## What This Document Is Not

This is not a commitment or a sprint plan — it's a set of directions the project could reasonably grow toward, kept separate from what has actually shipped in v1.0.0.